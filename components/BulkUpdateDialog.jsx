'use client';

import { useState, useEffect } from 'react';
import { DollarSign, ChevronDown, Loader2 } from 'lucide-react';
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
  initialTargetId = null
}) {
  const [level, setLevel] = useState(initialLevel);
  const [selectedBrand, setSelectedBrand] = useState(initialTargetId || '');
  const [selectedGroup, setSelectedGroup] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedGeneration, setSelectedGeneration] = useState('');
  const [selectedEngine, setSelectedEngine] = useState('');
  
  const [updateType, setUpdateType] = useState('percentage');
  const [operation, setOperation] = useState('increase');
  const [percentageValue, setPercentageValue] = useState('');
  const [absolutePrice, setAbsolutePrice] = useState('');
  
  // Individual stage prices for absolute mode
  const [stagePrices, setStagePrices] = useState({
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
      setSelectedBrand(initialTargetId || (brands[0]?.id || ''));
      setSelectedGroup('');
      setSelectedModel('');
      setSelectedGeneration('');
      setSelectedEngine('');
      setUpdateType('percentage');
      setOperation('increase');
      setPercentageValue('');
      setAbsolutePrice('');
      setStagePrices({ stage1: '', stage1plus: '', stage2: '', stage2plus: '' });
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
    switch (level) {
      case 'engine': 
        return engines.find(e => e.id === parseInt(selectedEngine))?.name || 'Engine';
      case 'generation':
        return generations.find(g => g.id === parseInt(selectedGeneration))?.name || 'Generation';
      case 'model':
        return models.find(m => m.id === parseInt(selectedModel))?.name || 'Model';
      case 'brand':
        return brands.find(b => b.id === parseInt(selectedBrand))?.name || 'Brand';
      default:
        return 'Selection';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const targetId = getTargetId();
    if (!targetId) return;

    setIsUpdating(true);
    
    try {
      let priceData = {};
      
      if (updateType === 'percentage') {
        priceData = {
          percentage: parseFloat(percentageValue),
          operation
        };
      } else if (updateType === 'absolute') {
        priceData = {
          prices: {
            stage1: stagePrices.stage1 ? parseInt(stagePrices.stage1) : undefined,
            stage1plus: stagePrices.stage1plus ? parseInt(stagePrices.stage1plus) : undefined,
            stage2: stagePrices.stage2 ? parseInt(stagePrices.stage2) : undefined,
            stage2plus: stagePrices.stage2plus ? parseInt(stagePrices.stage2plus) : undefined
          }
        };
      } else if (updateType === 'fixed') {
        priceData = {
          price: parseInt(absolutePrice)
        };
      }

      await onUpdate({
        level,
        targetId: parseInt(targetId),
        updateType,
        priceData
      });
      
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
      return absolutePrice && !isNaN(parseInt(absolutePrice));
    } else if (updateType === 'absolute') {
      return Object.values(stagePrices).some(p => p && !isNaN(parseInt(p)));
    }
    return false;
  };

  const selectStyle = {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid var(--border)',
    background: 'rgba(255, 255, 255, 0.05)',
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
              background: 'rgba(0, 255, 136, 0.1)',
              borderRadius: '50%',
              width: '64px',
              height: '64px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}
          >
            <DollarSign size={32} color="#00ff88" />
          </div>
          <h3 style={{ margin: '0 0 8px 0' }}>{t('bulkPriceUpdate') || 'Bulk Price Update'}</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0 }}>
            {t('updatePricesMultiple') || 'Update prices for multiple stages at once'}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
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
                    border: level === l ? '2px solid #00ff88' : '1px solid var(--border)',
                    background: level === l ? 'rgba(0, 255, 136, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                    color: level === l ? '#00ff88' : 'var(--text-main)',
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
            >
              <option value="">{t('selectBrand') || '-- Select Brand --'}</option>
              {brands.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>

          {level !== 'brand' && selectedBrand && (
            <>
              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>{t('groupOptionalFilter') || 'Group (Optional Filter)'}</label>
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
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={labelStyle}>{t('model') || 'Model'}</label>
                <select
                  value={selectedModel}
                  onChange={(e) => {
                    setSelectedModel(e.target.value);
                    setSelectedGeneration('');
                    setSelectedEngine('');
                  }}
                  style={selectStyle}
                  disabled={level === 'brand'}
                >
                  <option value="">{t('selectModel') || '-- Select Model --'}</option>
                  {filteredModels.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>
            </>
          )}

          {(level === 'generation' || level === 'engine') && selectedModel && (
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>{t('generation') || 'Generation'}</label>
              <select
                value={selectedGeneration}
                onChange={(e) => {
                  setSelectedGeneration(e.target.value);
                  setSelectedEngine('');
                }}
                style={selectStyle}
              >
                <option value="">{t('selectGeneration') || '-- Select Generation --'}</option>
                {filteredGenerations.map(g => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
              </select>
            </div>
          )}

          {level === 'engine' && selectedGeneration && (
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>{t('engine') || 'Engine'}</label>
              <select
                value={selectedEngine}
                onChange={(e) => setSelectedEngine(e.target.value)}
                style={selectStyle}
              >
                <option value="">{t('selectEngine') || '-- Select Engine --'}</option>
                {filteredEngines.map(e => (
                  <option key={e.id} value={e.id}>{e.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Update Type Selection */}
          <div style={{ marginBottom: '16px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
            <label style={labelStyle}>{t('updateType') || 'Update Type'}</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }} className="dialog-grid-3">
              {[
                { value: 'percentage', label: t('percentage') || 'Percentage' },
                { value: 'fixed', label: t('fixedPrice') || 'Fixed Price' },
                { value: 'absolute', label: t('perStage') || 'Per Stage' }
              ].map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setUpdateType(type.value)}
                  style={{
                    padding: '10px 8px',
                    borderRadius: '8px',
                    border: updateType === type.value ? '2px solid #00ff88' : '1px solid var(--border)',
                    background: updateType === type.value ? 'rgba(0, 255, 136, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                    color: updateType === type.value ? '#00ff88' : 'var(--text-main)',
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

          {/* Fixed Price Update */}
          {updateType === 'fixed' && (
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>{t('setAllPricesTo') || 'Set All Prices To (€)'}</label>
              <input
                type="number"
                value={absolutePrice}
                onChange={(e) => setAbsolutePrice(e.target.value)}
                placeholder="e.g. 500"
                style={inputStyle}
                min="0"
              />
            </div>
          )}

          {/* Per-Stage Price Update */}
          {updateType === 'absolute' && (
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>{t('stagePricesLeaveEmpty') || 'Stage Prices (€) - Leave empty to skip'}</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }} className="dialog-grid-2">
                <div>
                  <label style={{ ...labelStyle, fontSize: '0.75rem' }}>Stage 1</label>
                  <input
                    type="number"
                    value={stagePrices.stage1}
                    onChange={(e) => setStagePrices(p => ({ ...p, stage1: e.target.value }))}
                    placeholder="Price"
                    style={inputStyle}
                    min="0"
                  />
                </div>
                <div>
                  <label style={{ ...labelStyle, fontSize: '0.75rem' }}>Stage 1+</label>
                  <input
                    type="number"
                    value={stagePrices.stage1plus}
                    onChange={(e) => setStagePrices(p => ({ ...p, stage1plus: e.target.value }))}
                    placeholder="Price"
                    style={inputStyle}
                    min="0"
                  />
                </div>
                <div>
                  <label style={{ ...labelStyle, fontSize: '0.75rem' }}>Stage 2</label>
                  <input
                    type="number"
                    value={stagePrices.stage2}
                    onChange={(e) => setStagePrices(p => ({ ...p, stage2: e.target.value }))}
                    placeholder="Price"
                    style={inputStyle}
                    min="0"
                  />
                </div>
                <div>
                  <label style={{ ...labelStyle, fontSize: '0.75rem' }}>Stage 2+</label>
                  <input
                    type="number"
                    value={stagePrices.stage2plus}
                    onChange={(e) => setStagePrices(p => ({ ...p, stage2plus: e.target.value }))}
                    placeholder="Price"
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
              background: 'rgba(0, 255, 136, 0.05)',
              borderRadius: '8px',
              border: '1px solid rgba(0, 255, 136, 0.2)'
            }}>
              <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                {t('willUpdatePricesFor') || 'This will update prices for all stages under'} <strong style={{ color: '#00ff88' }}>{getTargetName()}</strong>
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
                background: isValid() ? '#00ff88' : 'rgba(0, 255, 136, 0.3)',
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
                t('updatePrices') || 'Update Prices'
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
