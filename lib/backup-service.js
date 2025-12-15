/**
 * Production-Grade Backup Service
 * Handles audit logging, change tracking, and full database backups
 */
import { getCollection, getDatabase } from './mongodb';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs/promises';

const execAsync = promisify(exec);

// Collection names
const AUDIT_COLLECTION = 'audit_logs';
const FULL_BACKUP_COLLECTION = 'full_backups';
const BACKUP_DIR = path.join(process.cwd(), 'data', 'backups', 'mongodb');

/**
 * Create audit log entry for a data change
 * This is the core of incremental backup - stores only what changed
 */
export async function createAuditLog({
  collection,
  documentId,
  action,
  before = null,
  after = null,
  changedBy = 'admin',
  metadata = {}
}) {
  try {
    const auditCol = await getCollection(AUDIT_COLLECTION);
    
    // Calculate specific changes for updates
    let changes = {};
    if (action === 'update' && before && after) {
      for (const key in after) {
        if (JSON.stringify(before[key]) !== JSON.stringify(after[key])) {
          changes[key] = {
            from: before[key],
            to: after[key]
          };
        }
      }
    }

    // Get version number for this document
    const lastAudit = await auditCol.findOne(
      { collection, documentId },
      { sort: { version: -1 }, projection: { version: 1 } }
    );
    const version = lastAudit ? (lastAudit.version || 0) + 1 : 1;

    const auditEntry = {
      collection,
      documentId: parseInt(documentId),
      action,
      before,
      after,
      changes: Object.keys(changes).length > 0 ? changes : null,
      changedBy,
      changedAt: new Date(),
      version,
      metadata
    };

    await auditCol.insertOne(auditEntry);
    console.log(`✅ Audit log created: ${collection}/${documentId} - ${action} (v${version})`);
    
    return auditEntry;
  } catch (error) {
    console.error('❌ Failed to create audit log:', error);
    throw error;
  }
}

/**
 * Get audit history for a specific document
 */
export async function getAuditHistory(collection, documentId, limit = 50) {
  try {
    const auditCol = await getCollection(AUDIT_COLLECTION);
    const history = await auditCol
      .find({ collection, documentId: parseInt(documentId) })
      .sort({ changedAt: -1 })
      .limit(limit)
      .toArray();
    
    return history.map(({ _id, ...rest }) => rest);
  } catch (error) {
    console.error('❌ Failed to get audit history:', error);
    return [];
  }
}

/**
 * Get recent audit logs across all collections
 */
export async function getRecentAuditLogs(limit = 100, filters = {}) {
  try {
    const auditCol = await getCollection(AUDIT_COLLECTION);
    const query = {};
    
    if (filters.collection) query.collection = filters.collection;
    if (filters.action) query.action = filters.action;
    if (filters.startDate) query.changedAt = { $gte: new Date(filters.startDate) };
    
    const logs = await auditCol
      .find(query)
      .sort({ changedAt: -1 })
      .limit(limit)
      .toArray();
    
    return logs.map(({ _id, ...rest }) => rest);
  } catch (error) {
    console.error('❌ Failed to get recent audit logs:', error);
    return [];
  }
}

/**
 * Rollback a document to a previous version
 */
export async function rollbackToVersion(collection, documentId, version) {
  try {
    const auditCol = await getCollection(AUDIT_COLLECTION);
    const targetAudit = await auditCol.findOne({
      collection,
      documentId: parseInt(documentId),
      version: parseInt(version)
    });

    if (!targetAudit || !targetAudit.before) {
      throw new Error('Version not found or no previous state available');
    }

    const dataCol = await getCollection(collection);
    await dataCol.updateOne(
      { id: parseInt(documentId) },
      { $set: targetAudit.before }
    );

    // Create audit log for rollback
    const current = await dataCol.findOne({ id: parseInt(documentId) });
    await createAuditLog({
      collection,
      documentId,
      action: 'update',
      before: current,
      after: targetAudit.before,
      changedBy: 'system',
      metadata: { rollback: true, targetVersion: version }
    });

    console.log(`✅ Rolled back ${collection}/${documentId} to version ${version}`);
    return true;
  } catch (error) {
    console.error('❌ Rollback failed:', error);
    throw error;
  }
}

/**
 * Create full database backup using MongoDB dump
 * This creates a complete snapshot of all collections
 */
export async function createFullBackup(type = 'manual', description = '', createdBy = 'admin') {
  const backupCol = await getCollection(FULL_BACKUP_COLLECTION);
  const timestamp = new Date();

  // Create backup record
  const backupRecord = {
    timestamp,
    type,
    status: 'in_progress',
    description,
    createdBy,
    collections: {}
  };

  const result = await backupCol.insertOne(backupRecord);
  const backupId = result.insertedId;

  try {
    // Ensure backup directory exists
    await fs.mkdir(BACKUP_DIR, { recursive: true });

    // Get MongoDB connection details from environment
    const mongoUri = process.env.MONGODB_URI;
    const dbName = process.env.MONGODB_DB || 'supremetuning';

    // Create backup filename with timestamp
    const backupName = `backup_${timestamp.toISOString().replace(/[:.]/g, '-')}`;
    const backupPath = path.join(BACKUP_DIR, backupName);

    // Get collection counts before backup
    const db = await getDatabase();
    const collections = ['brands', 'groups', 'models', 'types', 'engines', 'stages'];
    const counts = {};

    for (const collName of collections) {
      const col = await getCollection(collName);
      counts[collName] = await col.countDocuments();
    }

    // Use mongodump to create backup
    // Note: mongodump must be installed on the system
    const dumpCommand = `mongodump --uri="${mongoUri}" --db="${dbName}" --out="${backupPath}" --gzip`;

    console.log(`🔄 Creating full backup: ${backupName}`);
    await execAsync(dumpCommand);

    // Get backup size
    const stats = await fs.stat(backupPath);
    const size = stats.size;

    // Update backup record
    await backupCol.updateOne(
      { _id: backupId },
      {
        $set: {
          status: 'completed',
          filePath: backupPath,
          size,
          collections: counts,
          completedAt: new Date()
        }
      }
    );

    console.log(`✅ Full backup created: ${backupName} (${(size / 1024 / 1024).toFixed(2)} MB)`);

    return {
      id: backupId.toString(),
      timestamp,
      type,
      status: 'completed',
      filePath: backupPath,
      size,
      collections: counts
    };
  } catch (error) {
    console.error('❌ Full backup failed:', error);

    // Update backup record with error
    await backupCol.updateOne(
      { _id: backupId },
      {
        $set: {
          status: 'failed',
          error: error.message,
          completedAt: new Date()
        }
      }
    );

    throw error;
  }
}

/**
 * Restore from full backup
 */
export async function restoreFullBackup(backupId) {
  try {
    const backupCol = await getCollection(FULL_BACKUP_COLLECTION);
    const { ObjectId } = require('mongodb');
    const backup = await backupCol.findOne({ _id: new ObjectId(backupId) });

    if (!backup || backup.status !== 'completed') {
      throw new Error('Backup not found or incomplete');
    }

    const mongoUri = process.env.MONGODB_URI;
    const dbName = process.env.MONGODB_DB || 'supremetuning';

    // Use mongorestore to restore backup
    const restoreCommand = `mongorestore --uri="${mongoUri}" --db="${dbName}" --dir="${backup.filePath}/${dbName}" --gzip --drop`;

    console.log(`🔄 Restoring from backup: ${backup.filePath}`);
    await execAsync(restoreCommand);

    console.log(`✅ Database restored from backup: ${backup.timestamp}`);

    // Create audit log for restore
    await createAuditLog({
      collection: 'system',
      documentId: 0,
      action: 'restore',
      before: null,
      after: { backupId: backupId.toString(), timestamp: backup.timestamp },
      changedBy: 'admin',
      metadata: { restore: true, backupPath: backup.filePath }
    });

    return true;
  } catch (error) {
    console.error('❌ Restore failed:', error);
    throw error;
  }
}

/**
 * Get list of full backups
 */
export async function getFullBackups(limit = 50) {
  try {
    const backupCol = await getCollection(FULL_BACKUP_COLLECTION);
    const backups = await backupCol
      .find({})
      .sort({ timestamp: -1 })
      .limit(limit)
      .toArray();

    return backups.map(({ _id, ...rest }) => ({
      id: _id.toString(),
      ...rest
    }));
  } catch (error) {
    console.error('❌ Failed to get backups:', error);
    return [];
  }
}

/**
 * Delete old backups (cleanup)
 */
export async function cleanupOldBackups(keepCount = 30) {
  try {
    const backupCol = await getCollection(FULL_BACKUP_COLLECTION);
    const backups = await backupCol
      .find({ status: 'completed' })
      .sort({ timestamp: -1 })
      .toArray();

    if (backups.length <= keepCount) {
      console.log(`✅ No cleanup needed (${backups.length} backups)`);
      return 0;
    }

    const toDelete = backups.slice(keepCount);
    let deletedCount = 0;

    for (const backup of toDelete) {
      try {
        // Delete backup files
        if (backup.filePath) {
          await fs.rm(backup.filePath, { recursive: true, force: true });
        }

        // Delete backup record
        await backupCol.deleteOne({ _id: backup._id });
        deletedCount++;
      } catch (err) {
        console.error(`⚠️ Failed to delete backup ${backup._id}:`, err.message);
      }
    }

    console.log(`✅ Cleaned up ${deletedCount} old backups`);
    return deletedCount;
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
    return 0;
  }
}

