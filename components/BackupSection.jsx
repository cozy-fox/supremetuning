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
              {backupLoading ? (
                <RefreshCw size={16} className="spin" />
              ) : (
                <History size={16} />
              )}
              {backupLoading
                ? (t('loadingHistory') || 'Loading History...')
                : showAuditLogs
                  ? (t('hideChangeHistory') || 'Hide Change History')
                  : (t('showChangeHistory') || 'Show Change History')
              }
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

          {/* Loading State for Change History */}
          {showAuditLogs && backupLoading && (
            <div style={{
              padding: '40px',
              textAlign: 'center',
              background: 'rgba(50, 55, 60, 0.3)',
              borderRadius: '8px'
            }}>
              <RefreshCw size={32} className="spin" style={{ color: 'var(--primary)', marginBottom: '12px' }} />
              <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                {t('loadingChangeHistory') || 'Loading change history...'}
              </div>
            </div>
          )}

          {/* Audit Logs / Change History */}
          {showAuditLogs && !backupLoading && auditLogs.length > 0 && (
            <div>
              <h4 style={{ marginBottom: '16px', fontSize: '0.95rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <History size={18} />
                {t('changeHistory') || 'Change History'} ({auditLogs.length} {t('recentChanges') || 'recent changes'})
              </h4>
              <div style={{
                maxHeight: '600px',
                overflowY: 'auto',
                background: 'rgba(50, 55, 60, 0.3)',
                borderRadius: '8px',
                padding: '12px'
              }}>
                {auditLogs.map((log, index) => (
                  <div
                    key={index}
                    style={{
                      padding: '16px',
                      marginBottom: '12px',
                      background: 'rgba(255,255,255,0.03)',
                      borderRadius: '8px',
                      borderLeft: `4px solid ${
                        log.action === 'create' ? '#00ff88' :
                        log.action === 'update' ? '#4a9eff' :
                        log.action === 'delete' ? '#ff4444' :
                        log.action === 'move' ? '#ffa500' :
                        '#888'
                      }`
                    }}
                  >
                    {/* Header with action and collection */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.9rem', fontWeight: '600', marginBottom: '6px', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                          <span style={{
                            padding: '3px 8px',
                            borderRadius: '4px',
                            background: log.action === 'create' ? 'rgba(0, 255, 136, 0.2)' :
                                       log.action === 'update' ? 'rgba(74, 158, 255, 0.2)' :
                                       log.action === 'delete' ? 'rgba(255, 68, 68, 0.2)' :
                                       log.action === 'move' ? 'rgba(255, 165, 0, 0.2)' :
                                       'rgba(136, 136, 136, 0.2)',
                            color: log.action === 'create' ? '#00ff88' :
                                  log.action === 'update' ? '#4a9eff' :
                                  log.action === 'delete' ? '#ff4444' :
                                  log.action === 'move' ? '#ffa500' :
                                  '#888',
                            fontSize: '0.7rem',
                            textTransform: 'uppercase',
                            fontWeight: '700',
                            letterSpacing: '0.5px'
                          }}>
                            {log.action}
                          </span>
                          <span style={{
                            padding: '3px 8px',
                            borderRadius: '4px',
                            background: 'rgba(255, 255, 255, 0.1)',
                            fontSize: '0.7rem',
                            textTransform: 'uppercase',
                            color: 'var(--text-muted)'
                          }}>
                            {log.collection}
                          </span>
                          <span style={{ color: 'var(--text-primary)' }}>
                            {log.documentName || `ID: ${log.documentId}`}
                          </span>
                        </div>

                        {/* Hierarchy Path */}
                        {log.hierarchyPath && (
                          <div style={{
                            fontSize: '0.8rem',
                            color: 'var(--primary)',
                            marginBottom: '8px',
                            padding: '6px 10px',
                            background: 'rgba(0, 255, 136, 0.05)',
                            borderRadius: '4px',
                            display: 'inline-block'
                          }}>
                            📍 {log.hierarchyPath}
                          </div>
                        )}

                        {/* Timestamp and metadata */}
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Clock size={12} />
                            {new Date(log.changedAt).toLocaleString()}
                          </span>
                          {log.changedBy && <span>• by {log.changedBy}</span>}
                          {log.version && <span>• v{log.version}</span>}
                        </div>
                      </div>
                    </div>

                    {/* Stage Details (for stages collection) */}
                    {log.stageDetails && (log.stageDetails.before || log.stageDetails.after) && (
                      <div style={{
                        marginTop: '12px',
                        padding: '12px',
                        background: 'rgba(74, 158, 255, 0.05)',
                        borderRadius: '6px',
                        border: '1px solid rgba(74, 158, 255, 0.1)'
                      }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: '600', marginBottom: '8px', color: '#4a9eff' }}>
                          ⚡ Stage Data
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '8px' }}>
                          {log.stageDetails.after && Object.entries(log.stageDetails.after).map(([key, value]) => {
                            const beforeValue = log.stageDetails.before?.[key];
                            const changed = beforeValue !== undefined && beforeValue !== value;
                            return (
                              <div key={key} style={{
                                padding: '6px 10px',
                                background: changed ? 'rgba(0, 255, 136, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                                borderRadius: '4px',
                                fontSize: '0.75rem'
                              }}>
                                <span style={{ color: 'var(--text-muted)' }}>{key}: </span>
                                {changed && (
                                  <>
                                    <span style={{ color: '#ff4444', textDecoration: 'line-through', marginRight: '4px' }}>
                                      {beforeValue}
                                    </span>
                                    →{' '}
                                  </>
                                )}
                                <span style={{ color: changed ? '#00ff88' : 'var(--text-primary)', fontWeight: changed ? '600' : '400' }}>
                                  {value}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Changed Fields */}
                    {log.changes && Object.keys(log.changes).length > 0 && (
                      <div style={{
                        fontSize: '0.75rem',
                        marginTop: '12px',
                        padding: '12px',
                        background: 'rgba(0,0,0,0.3)',
                        borderRadius: '6px'
                      }}>
                        <div style={{ fontWeight: '600', marginBottom: '8px', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span>📝</span> {t('changedFields') || 'Changed fields:'}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          {Object.entries(log.resolvedChanges || log.changes).map(([field, change]) => {
                            // Display field name without 'Id' suffix if it's an ID field
                            const displayField = field.endsWith('Id') ? field.replace('Id', '') : field;

                            // Handle logo fields specially - just show "Logo changed"
                            if (change.isLogo || field === 'logo' || field.includes('Logo')) {
                              return (
                                <div key={field} style={{
                                  padding: '6px 10px',
                                  background: 'rgba(138, 43, 226, 0.1)',
                                  borderRadius: '4px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '8px'
                                }}>
                                  <span style={{ fontSize: '1rem' }}>🖼️</span>
                                  <span style={{ color: '#a855f7', fontWeight: '500' }}>
                                    {t('logoChanged') || 'Logo changed'}
                                  </span>
                                </div>
                              );
                            }

                            // Use formatted values if available
                            const fromDisplay = change.fromName || change.fromFormatted || JSON.stringify(change.from);
                            const toDisplay = change.toName || change.toFormatted || JSON.stringify(change.to);

                            return (
                              <div key={field} style={{
                                padding: '6px 10px',
                                background: 'rgba(255,255,255,0.03)',
                                borderRadius: '4px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                flexWrap: 'wrap'
                              }}>
                                <span style={{
                                  color: 'var(--text-muted)',
                                  fontWeight: '500',
                                  minWidth: '80px'
                                }}>
                                  {displayField}:
                                </span>
                                <span style={{
                                  color: '#ff4444',
                                  textDecoration: 'line-through',
                                  opacity: 0.8
                                }}>
                                  {fromDisplay}
                                </span>
                                <span style={{ color: 'var(--text-muted)' }}>→</span>
                                <span style={{
                                  color: '#00ff88',
                                  fontWeight: '600'
                                }}>
                                  {toDisplay}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Create action - show created data */}
                    {log.action === 'create' && log.after && !log.changes && (
                      <div style={{
                        fontSize: '0.75rem',
                        marginTop: '12px',
                        padding: '12px',
                        background: 'rgba(0, 255, 136, 0.05)',
                        borderRadius: '6px',
                        border: '1px solid rgba(0, 255, 136, 0.1)'
                      }}>
                        <div style={{ fontWeight: '600', marginBottom: '8px', color: '#00ff88' }}>
                          ✨ {t('createdWith') || 'Created with:'}
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '6px' }}>
                          {Object.entries(log.after).filter(([k]) => !k.startsWith('_') && k !== 'id').map(([key, value]) => {
                            // Handle logo fields - just show indicator
                            const isLogo = key === 'logo' || key.includes('Logo') || key.includes('logo');
                            const displayValue = isLogo
                              ? (value && value !== '[Logo Data]' ? '✓ Set' : '—')
                              : (typeof value === 'object' ? JSON.stringify(value) : String(value));

                            return (
                              <div key={key} style={{
                                padding: '4px 8px',
                                background: isLogo ? 'rgba(138, 43, 226, 0.1)' : 'rgba(255,255,255,0.05)',
                                borderRadius: '4px'
                              }}>
                                <span style={{ color: 'var(--text-muted)' }}>{key}: </span>
                                <span style={{ color: isLogo ? '#a855f7' : 'var(--text-primary)' }}>
                                  {displayValue}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Delete action - show deleted data */}
                    {log.action === 'delete' && log.before && (
                      <div style={{
                        fontSize: '0.75rem',
                        marginTop: '12px',
                        padding: '12px',
                        background: 'rgba(255, 68, 68, 0.05)',
                        borderRadius: '6px',
                        border: '1px solid rgba(255, 68, 68, 0.1)'
                      }}>
                        <div style={{ fontWeight: '600', marginBottom: '8px', color: '#ff4444' }}>
                          🗑️ {t('deletedData') || 'Deleted data:'}
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '6px' }}>
                          {Object.entries(log.before).filter(([k]) => !k.startsWith('_') && k !== 'id').map(([key, value]) => {
                            // Handle logo fields - just show indicator
                            const isLogo = key === 'logo' || key.includes('Logo') || key.includes('logo');
                            const displayValue = isLogo
                              ? (value && value !== '[Logo Data]' ? '✓ Had logo' : '—')
                              : (typeof value === 'object' ? JSON.stringify(value) : String(value));

                            return (
                              <div key={key} style={{
                                padding: '4px 8px',
                                background: isLogo ? 'rgba(138, 43, 226, 0.1)' : 'rgba(255,255,255,0.05)',
                                borderRadius: '4px',
                                textDecoration: isLogo ? 'none' : 'line-through',
                                opacity: 0.7
                              }}>
                                <span style={{ color: 'var(--text-muted)' }}>{key}: </span>
                                <span style={{ color: isLogo ? '#a855f7' : 'var(--text-primary)' }}>
                                  {displayValue}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
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

