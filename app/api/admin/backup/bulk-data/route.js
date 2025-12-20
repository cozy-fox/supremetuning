import { requireAdmin } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';

/**
 * GET /api/admin/backup/bulk-data - Get list of bulk data backups
 */
export async function GET(request) {
  const authResult = requireAdmin(request);
  if (authResult.error) {
    return NextResponse.json(
      { message: authResult.error },
      { status: authResult.status }
    );
  }

  try {
    const backupCol = await getCollection('bulk_data_backups');
    const backups = await backupCol
      .find({})
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();

    return NextResponse.json({ backups });
  } catch (error) {
    console.error('❌ Get bulk data backups error:', error);
    return NextResponse.json(
      { message: 'Failed to get backups', error: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/backup/bulk-data - Create backup before bulk update
 * Request body:
 *   - dataType: 'price', 'power', or 'torque'
 *   - level: 'all', 'brand', 'model', 'generation', 'engine'
 *   - targetId: ID of target (optional for 'all')
 *   - groupId: Optional group filter
 *   - description: Optional description
 */
export async function POST(request) {
  const authResult = requireAdmin(request);
  if (authResult.error) {
    return NextResponse.json(
      { message: authResult.error },
      { status: authResult.status }
    );
  }

  try {
    const {
      dataType = 'price',
      level = 'all',
      targetId = null,
      groupId = null,
      description = ''
    } = await request.json();

    const stagesCol = await getCollection('stages');
    const enginesCol = await getCollection('engines');
    const typesCol = await getCollection('types');
    const modelsCol = await getCollection('models');
    const brandsCol = await getCollection('brands');
    const backupCol = await getCollection('bulk_data_backups');

    // Build filter for engines based on level (same logic as bulk-price)
    let engineIds = [];
    let targetInfo = { level, dataType };

    if (level === 'all') {
      const allEngines = await enginesCol.find({}).toArray();
      engineIds = allEngines.map(e => e.id);
      targetInfo.targetName = 'All Brands';
    } else if (level === 'brand' && targetId) {
      let brandModelsQuery = { brandId: targetId };
      if (groupId) brandModelsQuery.groupId = groupId;

      const brandModels = await modelsCol.find(brandModelsQuery).toArray();
      const modelIds = brandModels.map(m => m.id);
      const generations = await typesCol.find({ modelId: { $in: modelIds } }).toArray();
      const generationIds = generations.map(g => g.id);
      const engines = await enginesCol.find({ typeId: { $in: generationIds } }).toArray();
      engineIds = engines.map(e => e.id);

      const brand = await brandsCol.findOne({ id: targetId });
      targetInfo.targetName = brand?.name || `Brand ${targetId}`;
      targetInfo.targetId = targetId;
      if (groupId) targetInfo.groupId = groupId;
    } else if (level === 'model' && targetId) {
      const generations = await typesCol.find({ modelId: targetId }).toArray();
      const generationIds = generations.map(g => g.id);
      const engines = await enginesCol.find({ typeId: { $in: generationIds } }).toArray();
      engineIds = engines.map(e => e.id);

      const model = await modelsCol.findOne({ id: targetId });
      targetInfo.targetName = model?.name || `Model ${targetId}`;
      targetInfo.targetId = targetId;
    } else if (level === 'generation' && targetId) {
      const engines = await enginesCol.find({ typeId: targetId }).toArray();
      engineIds = engines.map(e => e.id);

      const type = await typesCol.findOne({ id: targetId });
      targetInfo.targetName = type?.name || `Generation ${targetId}`;
      targetInfo.targetId = targetId;
    } else if (level === 'engine' && targetId) {
      engineIds = [targetId];
      const engine = await enginesCol.findOne({ id: targetId });
      targetInfo.targetName = engine?.name || `Engine ${targetId}`;
      targetInfo.targetId = targetId;
    }

    // Get all stages for the filtered engines
    const stages = await stagesCol.find({ engineId: { $in: engineIds } }).toArray();

    // Extract only the relevant data based on dataType
    const stageData = stages.map(stage => {
      const data = { id: stage.id, engineId: stage.engineId, stageName: stage.stageName };
      if (dataType === 'price') {
        data.price = stage.price;
      } else if (dataType === 'power') {
        data.power = stage.power;
        data.stockPower = stage.stockPower;
        data.powerGain = stage.powerGain;
      } else if (dataType === 'torque') {
        data.torque = stage.torque;
        data.stockTorque = stage.stockTorque;
        data.torqueGain = stage.torqueGain;
      }
      return data;
    });

    // Create backup record
    const backup = {
      createdAt: new Date(),
      dataType,
      targetInfo,
      description: description || `Backup before ${dataType} bulk update`,
      stageCount: stageData.length,
      engineCount: engineIds.length,
      data: stageData
    };

    const result = await backupCol.insertOne(backup);

    console.log(`✅ Created bulk data backup: ${stageData.length} stages (${dataType})`);

    return NextResponse.json({
      message: `Backup created for ${stageData.length} stages`,
      backupId: result.insertedId.toString(),
      stageCount: stageData.length,
      engineCount: engineIds.length,
      targetInfo
    });
  } catch (error) {
    console.error('❌ Create bulk data backup error:', error);
    return NextResponse.json(
      { message: 'Failed to create backup', error: error.message },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/backup/bulk-data - Restore from bulk data backup
 * Request body:
 *   - backupId: ID of backup to restore
 */
export async function PUT(request) {
  const authResult = requireAdmin(request);
  if (authResult.error) {
    return NextResponse.json(
      { message: authResult.error },
      { status: authResult.status }
    );
  }

  try {
    const { backupId } = await request.json();

    if (!backupId) {
      return NextResponse.json(
        { message: 'Backup ID is required' },
        { status: 400 }
      );
    }

    const { ObjectId } = require('mongodb');
    const backupCol = await getCollection('bulk_data_backups');
    const stagesCol = await getCollection('stages');

    const backup = await backupCol.findOne({ _id: new ObjectId(backupId) });

    if (!backup) {
      return NextResponse.json(
        { message: 'Backup not found' },
        { status: 404 }
      );
    }

    const { dataType, data: stageData } = backup;

    // Build bulk operations to restore the data
    const bulkOperations = [];

    for (const stage of stageData) {
      const updateFields = {};

      if (dataType === 'price') {
        updateFields.price = stage.price;
      } else if (dataType === 'power') {
        updateFields.power = stage.power;
        updateFields.stockPower = stage.stockPower;
        updateFields.powerGain = stage.powerGain;
      } else if (dataType === 'torque') {
        updateFields.torque = stage.torque;
        updateFields.stockTorque = stage.stockTorque;
        updateFields.torqueGain = stage.torqueGain;
      }

      bulkOperations.push({
        updateOne: {
          filter: { id: stage.id },
          update: { $set: updateFields }
        }
      });
    }

    if (bulkOperations.length > 0) {
      const result = await stagesCol.bulkWrite(bulkOperations);
      console.log(`✅ Restored ${result.modifiedCount} stages from backup`);

      return NextResponse.json({
        message: `Restored ${result.modifiedCount} stages from backup`,
        restoredCount: result.modifiedCount,
        dataType,
        targetInfo: backup.targetInfo
      });
    }

    return NextResponse.json({
      message: 'No data to restore',
      restoredCount: 0
    });
  } catch (error) {
    console.error('❌ Restore bulk data error:', error);
    return NextResponse.json(
      { message: 'Failed to restore backup', error: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/backup/bulk-data - Delete a backup
 * Query params:
 *   - id: Backup ID to delete
 */
export async function DELETE(request) {
  const authResult = requireAdmin(request);
  if (authResult.error) {
    return NextResponse.json(
      { message: authResult.error },
      { status: authResult.status }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const backupId = searchParams.get('id');

    if (!backupId) {
      return NextResponse.json(
        { message: 'Backup ID is required' },
        { status: 400 }
      );
    }

    const { ObjectId } = require('mongodb');
    const backupCol = await getCollection('bulk_data_backups');

    const result = await backupCol.deleteOne({ _id: new ObjectId(backupId) });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { message: 'Backup not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Backup deleted successfully'
    });
  } catch (error) {
    console.error('❌ Delete bulk data backup error:', error);
    return NextResponse.json(
      { message: 'Failed to delete backup', error: error.message },
      { status: 500 }
    );
  }
}

