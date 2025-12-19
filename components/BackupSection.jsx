'use client';

import { Archive, RefreshCw, Save, Download, Upload, Trash2, History, Clock, ChevronDown, ChevronUp, AlertCircle, Check, Database } from 'lucide-react';
import { useLanguage } from '@/components/LanguageContext';

/**
 * Production-Grade Backup Section Component
 * Shows full backups, audit logs, and change history
 */
export default function BackupSection({
  showBackups,
  setShowBackups,
  fullBackups,
  auditLogs,
  backupLoading,
  backupMessage,
  loadFullBackups,
  createFullBackup,
  restoreFullBackup,
  loadAuditLogs,
  showAuditLogs,
  setShowAuditLogs
}) {
  const { t } = useLanguage();

  return (
    <div className="card" style={{ marginBottom: '24px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer',
          padding: '8px 0'
        }}
        onClick={() => setShowBackups(!showBackups)}
      >
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: 0 }}>
          <Database size={24} color="#a8b0b8" />
          {t('productionBackupSystem') || 'Production Backup System'}
        </h3>
        {showBackups ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
      </div>

      {showBackups && (
        <div style={{ marginTop: '24px' }}>
          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
            {/* <button
              onClick={loadFullBackups}
              disabled={backupLoading}
              className="btn"
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <RefreshCw size={16} className={backupLoading ? 'spin' : ''} />
              {backupLoading ? 'Loading...' : 'Load Backups'}
            </button>
            <button
              onClick={createFullBackup}
              disabled={backupLoading}
              className="btn btn-search"
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <Save size={16} />
              Create Full Backup
            </button> */}
            <button
              onClick={() => {
                setShowAuditLogs(!showAuditLogs);
                if (!showAuditLogs) loadAuditLogs();
              }}
              disabled={backupLoading}
              className="btn"
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <History size={16} />
              {showAuditLogs ? (t('hideChangeHistory') || 'Hide Change History') : (t('showChangeHistory') || 'Show Change History')}
            </button>
          </div>

          {/* Message */}
          {backupMessage.text && (
            <div style={{
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '20px',
              background: backupMessage.type === 'error'
                ? 'rgba(255, 68, 68, 0.1)'
                : 'rgba(0, 255, 136, 0.1)',
              border: `1px solid ${backupMessage.type === 'error' ? 'rgba(255, 68, 68, 0.3)' : 'rgba(0, 255, 136, 0.3)'}`,
              color: backupMessage.type === 'error' ? '#ff4444' : '#00ff88',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              {backupMessage.type === 'error' ? <AlertCircle size={16} /> : <Check size={16} />}
              {backupMessage.text}
            </div>
          )}

          {/* Full Backups List */}
          {fullBackups.length > 0 && (
            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ marginBottom: '16px', fontSize: '0.95rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Archive size={18} />
                {t('fullDatabaseBackups') || 'Full Database Backups'} ({fullBackups.length})
              </h4>
              <div style={{
                maxHeight: '400px',
                overflowY: 'auto',
                background: 'rgba(50, 55, 60, 0.3)',
                borderRadius: '8px',
                padding: '12px'
              }}>
                {fullBackups.map((backup, index) => (
                  <div
                    key={backup.id}
                    style={{
                      padding: '16px',
                      marginBottom: '12px',
                      background: backup.status === 'completed' 
                        ? 'rgba(0, 255, 136, 0.05)' 
                        : backup.status === 'failed'
                        ? 'rgba(255, 68, 68, 0.05)'
                        : 'rgba(255, 255, 255, 0.05)',
                      borderRadius: '8px',
                      border: `1px solid ${
                        backup.status === 'completed' 
                          ? 'rgba(0, 255, 136, 0.2)' 
                          : backup.status === 'failed'
                          ? 'rgba(255, 68, 68, 0.2)'
                          : 'rgba(255, 255, 255, 0.1)'
                      }`
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Database size={16} color="var(--primary)" />
                          {t('fullBackup') || 'Full Backup'} #{fullBackups.length - index}
                          <span style={{
                            fontSize: '0.75rem',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            background: backup.status === 'completed' ? 'rgba(0, 255, 136, 0.2)' : 'rgba(255, 68, 68, 0.2)',
                            color: backup.status === 'completed' ? '#00ff88' : '#ff4444'
                          }}>
                            {backup.status}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Clock size={14} />
                          {new Date(backup.timestamp).toLocaleString()}
                        </div>
                        {backup.description && (
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                            {backup.description}
                          </div>
                        )}
                        {backup.collections && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                            {Object.entries(backup.collections).map(([coll, count]) => (
                              <span key={coll} style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                                {coll}: {count}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      {backup.status === 'completed' && (
                        <button
                          onClick={() => restoreFullBackup(backup.id)}
                          disabled={backupLoading}
                          className="btn"
                          style={{
                            padding: '8px 16px',
                            fontSize: '0.85rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                        >
                          <Upload size={14} />
                          {t('restore') || 'Restore'}
                        </button>
                      )}
                    </div>
                    {backup.size && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Size: {(backup.size / 1024 / 1024).toFixed(2)} MB
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Audit Logs / Change History */}
          {showAuditLogs && auditLogs.length > 0 && (
            <div>
              <h4 style={{ marginBottom: '16px', fontSize: '0.95rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <History size={18} />
                {t('changeHistory') || 'Change History'} ({auditLogs.length} {t('recentChanges') || 'recent changes'})
              </h4>
              <div style={{
                maxHeight: '500px',
                overflowY: 'auto',
                background: 'rgba(50, 55, 60, 0.3)',
                borderRadius: '8px',
                padding: '12px'
              }}>
                {auditLogs.map((log, index) => (
                  <div
                    key={index}
                    style={{
                      padding: '12px',
                      marginBottom: '8px',
                      background: 'rgba(255,255,255,0.03)',
                      borderRadius: '6px',
                      borderLeft: `3px solid ${
                        log.action === 'create' ? '#00ff88' :
                        log.action === 'update' ? '#4a9eff' :
                        log.action === 'delete' ? '#ff4444' :
                        '#ffa500'
                      }`
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: '500', marginBottom: '4px' }}>
                          <span style={{
                            padding: '2px 6px',
                            borderRadius: '4px',
                            background: log.action === 'create' ? 'rgba(0, 255, 136, 0.2)' :
                                       log.action === 'update' ? 'rgba(74, 158, 255, 0.2)' :
                                       log.action === 'delete' ? 'rgba(255, 68, 68, 0.2)' :
                                       'rgba(255, 165, 0, 0.2)',
                            color: log.action === 'create' ? '#00ff88' :
                                  log.action === 'update' ? '#4a9eff' :
                                  log.action === 'delete' ? '#ff4444' :
                                  '#ffa500',
                            fontSize: '0.75rem',
                            textTransform: 'uppercase',
                            marginRight: '8px'
                          }}>
                            {log.action}
                          </span>
                          {log.collection} / {log.documentName || `ID: ${log.documentId}`}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Clock size={12} />
                          {new Date(log.changedAt).toLocaleString()}
                          {log.changedBy && ` • by ${log.changedBy}`}
                          {log.version && ` • v${log.version}`}
                        </div>
                        {log.changes && Object.keys(log.changes).length > 0 && (
                          <div style={{ fontSize: '0.75rem', marginTop: '8px', padding: '8px', background: 'rgba(0,0,0,0.3)', borderRadius: '4px' }}>
                            <div style={{ fontWeight: '600', marginBottom: '4px', color: 'var(--primary)' }}>{t('changedFields') || 'Changed fields:'}</div>
                            {Object.entries(log.resolvedChanges || log.changes).map(([field, change]) => {
                              // Display field name without 'Id' suffix if it's an ID field
                              const displayField = field.endsWith('Id') ? field.replace('Id', '') : field;

                              return (
                                <div key={field} style={{ marginBottom: '4px', paddingLeft: '8px' }}>
                                  <span style={{ color: 'var(--text-muted)' }}>{displayField}:</span>{' '}
                                  <span style={{ color: '#ff4444', textDecoration: 'line-through' }}>
                                    {change.fromName || JSON.stringify(change.from)}
                                  </span>
                                  {' → '}
                                  <span style={{ color: '#00ff88' }}>
                                    {change.toName || JSON.stringify(change.to)}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

