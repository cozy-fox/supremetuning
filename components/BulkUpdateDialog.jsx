'use client';

import { useState, useEffect } from 'react';
import { RefreshCw, Zap, Gauge, ChevronDown, Loader2 } from 'lucide-react';
import { useLanguage } from '@/components/LanguageContext';

export default function BulkUpdateDialog({
  show,
  onClose,
  onUpdate,
  brands = [],
  groups = [],
  models = [],
  generations = [],
  engines = [],
  initialLevel = 'brand',
  initialTargetId = null,
  dataLoading = false
}) {
  const [level, setLevel] = useState(initialLevel);
  const [selectedBrand, setSelectedBrand] = useState(initialTargetId || '');
  const [selectedGroup, setSelectedGroup] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedGeneration, setSelectedGeneration] = useState('');
  const [selectedEngine, setSelectedEngine] = useState('');

  // Data type to update: 'price', 'power', 'torque'
  const [dataType, setDataType] = useState('price');

  const [updateType, setUpdateType] = useState('percentage');
  const [operation, setOperation] = useState('increase');
  const [percentageValue, setPercentageValue] = useState('');
  const [absoluteValue, setAbsoluteValue] = useState('');

  // Individual stage values for absolute mode
  const [stageValues, setStageValues] = useState({
    stage1: '',
    stage1plus: '',
    stage2: '',
    stage2plus: ''
  });

  const [isUpdating, setIsUpdating] = useState(false);

  const { t } = useLanguage();

  // Reset form when dialog opens
  useEffect(() => {
    if (show) {
      setLevel(initialLevel);
      setSelectedBrand(initialTargetId || '');
      setSelectedGroup('');
      setSelectedModel('');
      setSelectedGeneration('');
      setSelectedEngine('');
      setDataType('price');
      setUpdateType('percentage');
      setOperation('increase');
      setPercentageValue('');
      setAbsoluteValue('');
      setStageValues({ stage1: '', stage1plus: '', stage2: '', stage2plus: '' });
    }
  }, [show, initialLevel, initialTargetId, brands]);

  if (!show) return null;

  // Filter data based on selections
  const filteredGroups = groups.filter(g => g.brandId === parseInt(selectedBrand));
  const filteredModels = models.filter(m => 
    m.brandId === parseInt(selectedBrand) && 
    (selectedGroup ? m.groupId === parseInt(selectedGroup) : true)
  );
  const filteredGenerations = generations.filter(g => g.modelId === parseInt(selectedModel));
  const filteredEngines = engines.filter(e => e.typeId === parseInt(selectedGeneration));

  const getTargetId = () => {
    switch (level) {
      case 'engine': return selectedEngine;
      case 'generation': return selectedGeneration;
      case 'model': return selectedModel;
      case 'brand': return selectedBrand;
      default: return selectedBrand;
    }
  };

  const getTargetName = () => {
    let name = '';
    switch (level) {
      case 'engine':
        name = engines.find(e => e.id === parseInt(selectedEngine))?.name || 'Engine';
        break;
      case 'generation':
        name = generations.find(g => g.id === parseInt(selectedGeneration))?.name || 'Generation';
        break;
      case 'model':
        name = models.find(m => m.id === parseInt(selectedModel))?.name || 'Model';
        break;
      case 'brand':
        name = brands.find(b => b.id === parseInt(selectedBrand))?.name || 'Brand';
        break;
      default:
        name = 'Selection';
    }

    // Add group filter info if selected
    if (selectedGroup && (level === 'brand' || level === 'model')) {
      const groupName = groups.find(g => g.id === parseInt(selectedGroup))?.name;
      if (groupName) {
        name += ` (${groupName} group only)`;
      }
    }

    return name;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const targetId = getTargetId();
    if (!targetId) return;

    setIsUpdating(true);

    try {
      let updateData = {};

      if (updateType === 'percentage') {
        updateData = {
          percentage: parseFloat(percentageValue),
          operation
        };
      } else if (updateType === 'absolute') {
        updateData = {
          values: {
            stage1: stageValues.stage1 ? parseInt(stageValues.stage1) : undefined,
            stage1plus: stageValues.stage1plus ? parseInt(stageValues.stage1plus) : undefined,
            stage2: stageValues.stage2 ? parseInt(stageValues.stage2) : undefined,
            stage2plus: stageValues.stage2plus ? parseInt(stageValues.stage2plus) : undefined
          }
        };
      } else if (updateType === 'fixed') {
        updateData = {
          value: parseInt(absoluteValue)
        };
      }

      // Include groupId if selected (for brand-level filtering)
      const updatePayload = {
        level,
        targetId: parseInt(targetId),
        dataType, // 'price', 'power', or 'torque'
        updateType,
        updateData
      };

      // Add groupId filter if a group is selected
      if (selectedGroup) {
        updatePayload.groupId = parseInt(selectedGroup);
        console.log('🔍 Bulk update with group filter:', {
          level,
          targetId,
          dataType,
          groupId: selectedGroup,
          groupName: groups.find(g => g.id === parseInt(selectedGroup))?.name
        });
      } else {
        console.log('🔍 Bulk update without group filter:', { level, targetId, dataType });
      }

      await onUpdate(updatePayload);

      onClose();
    } catch (error) {
      console.error('Bulk update failed:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const isValid = () => {
    const targetId = getTargetId();
    if (!targetId) return false;

    if (updateType === 'percentage') {
      return percentageValue && !isNaN(parseFloat(percentageValue));
    } else if (updateType === 'fixed') {
      return absoluteValue && !isNaN(parseInt(absoluteValue));
    } else if (updateType === 'absolute') {
      return Object.values(stageValues).some(v => v && !isNaN(parseInt(v)));
    }
    return false;
  };

  // Get data type specific labels and units
  const getDataTypeInfo = () => {
    switch (dataType) {
      case 'power':
        return {
          title: t('bulkPowerUpdate') || 'Bulk Power Update',
          subtitle: t('updatePowerMultiple') || 'Update tuned HP for multiple stages at once',
          unit: 'HP',
          icon: <Zap size={32} color="#00aaff" />,
          color: '#00aaff',
          fixedLabel: t('setAllPowerTo') || 'Set All Tuned HP To'
        };
      case 'torque':
        return {
          title: t('bulkTorqueUpdate') || 'Bulk Torque Update',
          subtitle: t('updateTorqueMultiple') || 'Update tuned Nm for multiple stages at once',
          unit: 'Nm',
          icon: <Gauge size={32} color="#ff8800" />,
          color: '#ff8800',
          fixedLabel: t('setAllTorqueTo') || 'Set All Tuned Nm To'
        };
      default:
        return {
          title: t('bulkPriceUpdate') || 'Bulk Price Update',
          subtitle: t('updatePricesMultiple') || 'Update prices for multiple stages at once',
          unit: '€',
          icon: <RefreshCw size={32} color="#00ff88" />,
          color: '#00ff88',
          fixedLabel: t('setAllPricesTo') || 'Set All Prices To (€)'
        };
    }
  };

  const dataTypeInfo = getDataTypeInfo();

  const selectStyle = {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid var(--border)',
    background: 'rgba(50, 55, 60, 0.8)',
    color: 'var(--text-main)',
    fontSize: '14px',
    cursor: 'pointer'
  };

  const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid var(--border)',
    background: 'rgba(255, 255, 255, 0.05)',
    color: 'var(--text-main)',
    fontSize: '14px'
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '6px',
    fontSize: '0.85rem',
    color: 'var(--text-secondary)'
  };

  return (
    <div
      className="dialog-container"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 10000,
        background: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        animation: 'fadeIn 0.2s ease-out'
      }}
      onClick={onClose}
    >
      <div
        className="dialog-content dialog-responsive-padding"
        style={{
          background: 'rgba(0,0,0,1)',
          borderRadius: '16px',
          maxWidth: '550px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
          animation: 'scaleIn 0.2s ease-out'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div
            className="dialog-icon"
            style={{
              background: `${dataTypeInfo.color}15`,
              borderRadius: '50%',
              width: '64px',
              height: '64px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}
          >
            {dataTypeInfo.icon}
          </div>
          <h3 style={{ margin: '0 0 8px 0' }}>{dataTypeInfo.title}</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0 }}>
            {dataTypeInfo.subtitle}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Data Type Selection */}
          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>{t('dataType') || 'Data Type'}</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }} className="dialog-grid-3">
              {[
                { value: 'price', label: t('price') || 'Price', icon: '€', color: '#00ff88' },
                { value: 'power', label: t('power') || 'Power', icon: 'HP', color: '#00aaff' },
                { value: 'torque', label: t('torque') || 'Torque', icon: 'Nm', color: '#ff8800' }
              ].map((dt) => (
                <button
                  key={dt.value}
                  type="button"
                  onClick={() => setDataType(dt.value)}
                  style={{
                    padding: '10px 8px',
                    borderRadius: '8px',
                    border: dataType === dt.value ? `2px solid ${dt.color}` : '1px solid var(--border)',
                    background: dataType === dt.value ? `${dt.color}15` : 'rgba(255, 255, 255, 0.05)',
                    color: dataType === dt.value ? dt.color : 'var(--text-main)',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <span style={{ fontWeight: '600', fontSize: '0.75rem' }}>{dt.icon}</span>
                  {dt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Level Selection */}
          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>{t('updateLevel') || 'Update Level'}</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }} className="dialog-grid-4">
              {['brand', 'model', 'generation', 'engine'].map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLevel(l)}
                  style={{
                    padding: '10px 8px',
                    borderRadius: '8px',
                    border: level === l ? `2px solid ${dataTypeInfo.color}` : '1px solid var(--border)',
                    background: level === l ? `${dataTypeInfo.color}15` : 'rgba(255, 255, 255, 0.05)',
                    color: level === l ? dataTypeInfo.color : 'var(--text-main)',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    textTransform: 'capitalize'
                  }}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* Loading Overlay for Data */}
          {dataLoading && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              padding: '20px',
              background: 'rgba(0, 170, 255, 0.05)',
              borderRadius: '8px',
              marginBottom: '16px',
              border: '1px solid rgba(0, 170, 255, 0.2)'
            }}>
              <Loader2 size={20} color="#00aaff" style={{ animation: 'spin 1s linear infinite' }} />
              <span style={{ color: '#00aaff', fontSize: '0.9rem' }}>
                {t('loadingData') || 'Loading data...'}
              </span>
            </div>
          )}

          {/* Hierarchical Selectors */}
          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>{t('brand') || 'Brand'}</label>
            <select
              value={selectedBrand}
              onChange={(e) => {
                setSelectedBrand(e.target.value);
                setSelectedGroup('');
                setSelectedModel('');
                setSelectedGeneration('');
                setSelectedEngine('');
              }}
              style={selectStyle}
              disabled={dataLoading}
            >
              <option value="">{t('selectBrand') || '-- Select Brand --'}</option>
              {brands.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>

          {/* Group Selector - Optional filter for all levels */}
          {selectedBrand && (
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>{t('groupOptionalFilter') || 'Group (Optional Filter)'}</label>
              {dataLoading ? (
                <div style={{
                  ...selectStyle,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: 'var(--text-secondary)'
                }}>
                  <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                  {t('loadingGroups') || 'Loading groups...'}
                </div>
              ) : (
                <select
                  value={selectedGroup}
                  onChange={(e) => {
                    setSelectedGroup(e.target.value);
                    setSelectedModel('');
                    setSelectedGeneration('');
                    setSelectedEngine('');
                  }}
                  style={selectStyle}
                >
                  <option value="">{t('allGroups') || 'All Groups'}</option>
                  {filteredGroups.map(g => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
              )}
            </div>
          )}

          {/* Model Selector - Required for model, generation, and engine levels */}
          {(level === 'model' || level === 'generation' || level === 'engine') && (
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>{t('model') || 'Model'} *</label>
              {dataLoading ? (
                <div style={{
                  ...selectStyle,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: 'var(--text-secondary)'
                }}>
                  <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                  {t('loadingModels') || 'Loading models...'}
                </div>
              ) : (
                <select
                  value={selectedModel}
                  onChange={(e) => {
                    setSelectedModel(e.target.value);
                    setSelectedGeneration('');
                    setSelectedEngine('');
                  }}
                  style={selectStyle}
                  required
                >
                  <option value="">{t('selectModel') || '-- Select Model --'}</option>
                  {filteredModels.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              )}
            </div>
          )}

          {/* Generation Selector - Required for generation and engine levels */}
          {(level === 'generation' || level === 'engine') && (
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>{t('generation') || 'Generation'} *</label>
              {dataLoading ? (
                <div style={{
                  ...selectStyle,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: 'var(--text-secondary)'
                }}>
                  <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                  {t('loadingGenerations') || 'Loading generations...'}
                </div>
              ) : (
                <select
                  value={selectedGeneration}
                  onChange={(e) => {
                    setSelectedGeneration(e.target.value);
                    setSelectedEngine('');
                  }}
                  style={selectStyle}
                  required
                  disabled={!selectedModel}
                >
                  <option value="">{selectedModel ? (t('selectGeneration') || '-- Select Generation --') : (t('selectModelFirst') || '-- Select Model First --')}</option>
                  {filteredGenerations.map(g => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
              )}
            </div>
          )}

          {/* Engine Selector - Required for engine level */}
          {level === 'engine' && (
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>{t('engine') || 'Engine'} *</label>
              {dataLoading ? (
                <div style={{
                  ...selectStyle,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: 'var(--text-secondary)'
                }}>
                  <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                  {t('loadingEngines') || 'Loading engines...'}
                </div>
              ) : (
                <select
                  value={selectedEngine}
                  onChange={(e) => setSelectedEngine(e.target.value)}
                  style={selectStyle}
                  required
                  disabled={!selectedGeneration}
                >
                  <option value="">{selectedGeneration ? (t('selectEngine') || '-- Select Engine --') : (t('selectGenerationFirst') || '-- Select Generation First --')}</option>
                  {filteredEngines.map(e => (
                    <option key={e.id} value={e.id}>{e.name}</option>
                  ))}
                </select>
              )}
            </div>
          )}

          {/* Update Type Selection */}
          <div style={{ marginBottom: '16px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
            <label style={labelStyle}>{t('updateType') || 'Update Type'}</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }} className="dialog-grid-3">
              {[
                { value: 'percentage', label: t('percentage') || 'Percentage' },
                { value: 'fixed', label: dataType === 'price' ? (t('fixedPrice') || 'Fixed Price') : (t('fixedValue') || 'Fixed Value') },
                { value: 'absolute', label: t('perStage') || 'Per Stage' }
              ].map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setUpdateType(type.value)}
                  style={{
                    padding: '10px 8px',
                    borderRadius: '8px',
                    border: updateType === type.value ? `2px solid ${dataTypeInfo.color}` : '1px solid var(--border)',
                    background: updateType === type.value ? `${dataTypeInfo.color}15` : 'rgba(255, 255, 255, 0.05)',
                    color: updateType === type.value ? dataTypeInfo.color : 'var(--text-main)',
                    fontSize: '0.85rem',
                    cursor: 'pointer'
                  }}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Percentage Update */}
          {updateType === 'percentage' && (
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }} className="dialog-grid-2">
                <div>
                  <label style={labelStyle}>{t('operation') || 'Operation'}</label>
                  <select
                    value={operation}
                    onChange={(e) => setOperation(e.target.value)}
                    style={selectStyle}
                  >
                    <option value="increase">{t('increase') || 'Increase'}</option>
                    <option value="decrease">{t('decrease') || 'Decrease'}</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>{t('percentageLabel') || 'Percentage (%)'}</label>
                  <input
                    type="number"
                    value={percentageValue}
                    onChange={(e) => setPercentageValue(e.target.value)}
                    placeholder="e.g. 10"
                    style={inputStyle}
                    min="0"
                    max="100"
                    step="0.1"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Fixed Value Update */}
          {updateType === 'fixed' && (
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>{dataTypeInfo.fixedLabel}</label>
              <input
                type="number"
                value={absoluteValue}
                onChange={(e) => setAbsoluteValue(e.target.value)}
                placeholder={dataType === 'price' ? 'e.g. 500' : dataType === 'power' ? 'e.g. 300' : 'e.g. 450'}
                style={inputStyle}
                min="0"
              />
            </div>
          )}

          {/* Per-Stage Value Update */}
          {updateType === 'absolute' && (
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>
                {dataType === 'price'
                  ? (t('stagePricesLeaveEmpty') || 'Stage Prices (€) - Leave empty to skip')
                  : dataType === 'power'
                  ? (t('stagePowerLeaveEmpty') || 'Stage Power (HP) - Leave empty to skip')
                  : (t('stageTorqueLeaveEmpty') || 'Stage Torque (Nm) - Leave empty to skip')
                }
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }} className="dialog-grid-2">
                <div>
                  <label style={{ ...labelStyle, fontSize: '0.75rem' }}>Stage 1</label>
                  <input
                    type="number"
                    value={stageValues.stage1}
                    onChange={(e) => setStageValues(v => ({ ...v, stage1: e.target.value }))}
                    placeholder={dataTypeInfo.unit}
                    style={inputStyle}
                    min="0"
                  />
                </div>
                <div>
                  <label style={{ ...labelStyle, fontSize: '0.75rem' }}>Stage 1+</label>
                  <input
                    type="number"
                    value={stageValues.stage1plus}
                    onChange={(e) => setStageValues(v => ({ ...v, stage1plus: e.target.value }))}
                    placeholder={dataTypeInfo.unit}
                    style={inputStyle}
                    min="0"
                  />
                </div>
                <div>
                  <label style={{ ...labelStyle, fontSize: '0.75rem' }}>Stage 2</label>
                  <input
                    type="number"
                    value={stageValues.stage2}
                    onChange={(e) => setStageValues(v => ({ ...v, stage2: e.target.value }))}
                    placeholder={dataTypeInfo.unit}
                    style={inputStyle}
                    min="0"
                  />
                </div>
                <div>
                  <label style={{ ...labelStyle, fontSize: '0.75rem' }}>Stage 2+</label>
                  <input
                    type="number"
                    value={stageValues.stage2plus}
                    onChange={(e) => setStageValues(v => ({ ...v, stage2plus: e.target.value }))}
                    placeholder={dataTypeInfo.unit}
                    style={inputStyle}
                    min="0"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Summary */}
          {getTargetId() && (
            <div style={{
              marginBottom: '20px',
              padding: '12px',
              background: `${dataTypeInfo.color}10`,
              borderRadius: '8px',
              border: `1px solid ${dataTypeInfo.color}30`
            }}>
              <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                {dataType === 'price'
                  ? (t('willUpdatePricesFor') || 'This will update prices for all stages under')
                  : dataType === 'power'
                  ? (t('willUpdatePowerFor') || 'This will update tuned HP for all stages under')
                  : (t('willUpdateTorqueFor') || 'This will update tuned Nm for all stages under')
                } <strong style={{ color: dataTypeInfo.color }}>{getTargetName()}</strong>
              </p>
            </div>
          )}

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              type="button"
              onClick={onClose}
              className="btn"
              style={{
                flex: 1,
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}
              disabled={isUpdating}
            >
              {t('cancel') || 'Cancel'}
            </button>
            <button
              type="submit"
              className="btn"
              style={{
                flex: 1,
                background: isValid() ? dataTypeInfo.color : `${dataTypeInfo.color}50`,
                color: '#1a1a1a',
                border: 'none',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
              disabled={!isValid() || isUpdating}
            >
              {isUpdating ? (
                <>
                  <Loader2 size={16} className="spin" />
                  {t('updating') || 'Updating...'}
                </>
              ) : (
                dataType === 'price'
                  ? (t('updatePrices') || 'Update Prices')
                  : dataType === 'power'
                  ? (t('updatePower') || 'Update Power')
                  : (t('updateTorque') || 'Update Torque')
              )}
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from {
            transform: scale(0.9);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        .spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
