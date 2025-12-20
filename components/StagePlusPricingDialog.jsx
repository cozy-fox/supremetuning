'use client';

import { useState, useEffect } from 'react';
import { Percent, Loader2 } from 'lucide-react';
import { useLanguage } from '@/components/LanguageContext';

export default function StagePlusPricingDialog({
  show,
  onClose,
  onApply,
  brands = [],
  groups = [],
  models = [],
  generations = [],
  engines = [],
  dataLoading = false
}) {
  const [applyMode, setApplyMode] = useState('all'); // 'all' or 'selection'
  const [level, setLevel] = useState('brand');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedGeneration, setSelectedGeneration] = useState('');
  const [selectedEngine, setSelectedEngine] = useState('');

  const [stage1PlusPercentage, setStage1PlusPercentage] = useState('15');
  const [stage2PlusPercentage, setStage2PlusPercentage] = useState('15');
  const [isApplying, setIsApplying] = useState(false);

  const { t } = useLanguage();

  // Reset form when dialog opens
  useEffect(() => {
    if (show) {
      setApplyMode('all');
      setLevel('brand');
      setSelectedBrand('');
      setSelectedGroup('');
      setSelectedModel('');
      setSelectedGeneration('');
      setSelectedEngine('');
      setStage1PlusPercentage('15');
      setStage2PlusPercentage('15');
    }
  }, [show, brands]);

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
    if (applyMode === 'all') return null;
    
    switch (level) {
      case 'engine': return selectedEngine;
      case 'generation': return selectedGeneration;
      case 'model': return selectedModel;
      case 'brand': return selectedBrand;
      default: return selectedBrand;
    }
  };

  const getTargetName = () => {
    if (applyMode === 'all') {
      return t('allBrands') || 'All Brands';
    }

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

    const percentage1Plus = parseFloat(stage1PlusPercentage);
    const percentage2Plus = parseFloat(stage2PlusPercentage);

    if (isNaN(percentage1Plus) || percentage1Plus < 0 || percentage1Plus > 100) {
      alert('Please enter a valid percentage for Stage 1+ (0-100)');
      return;
    }

    if (isNaN(percentage2Plus) || percentage2Plus < 0 || percentage2Plus > 100) {
      alert('Please enter a valid percentage for Stage 2+ (0-100)');
      return;
    }

    setIsApplying(true);
    try {
      const updatePayload = {
        stage1PlusPercentage: percentage1Plus,
        stage2PlusPercentage: percentage2Plus
      };

      // Add level and targetId if not "all"
      if (applyMode === 'selection') {
        updatePayload.level = level;
        const targetId = getTargetId();
        if (targetId) {
          updatePayload.targetId = parseInt(targetId);
        }
        
        // Add groupId filter if a group is selected
        if (selectedGroup) {
          updatePayload.groupId = parseInt(selectedGroup);
        }
      } else {
        updatePayload.level = 'all';
      }

      await onApply(updatePayload);
      onClose();
    } catch (error) {
      console.error('Failed to apply Stage+ pricing:', error);
    } finally {
      setIsApplying(false);
    }
  };

  const isValid = () => {
    // Check percentages
    if (!stage1PlusPercentage || !stage2PlusPercentage ||
        isNaN(parseFloat(stage1PlusPercentage)) ||
        isNaN(parseFloat(stage2PlusPercentage))) {
      return false;
    }

    // For "all" mode, just check percentages
    if (applyMode === 'all') {
      return true;
    }

    // For selection mode, check targetId
    const targetId = getTargetId();
    return !!targetId;
  };

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
              background: 'rgba(0, 170, 255, 0.1)',
              borderRadius: '50%',
              width: '64px',
              height: '64px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}
          >
            <Percent size={32} color="#00aaff" />
          </div>
          <h3 style={{ margin: '0 0 8px 0' }}>{t('stagePlusAutomaticPricing') || 'Stage+ Automatic Pricing'}</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0 }}>
            {t('stagePlusExplanation') || 'Stage 1+ = Stage 1 price + percentage | Stage 2+ = Stage 2 price + percentage'}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Apply Mode Selection: ALL or SELECTION */}
          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>{t('applyMode') || 'Apply To'}</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }} className="dialog-grid-2">
              <button
                type="button"
                onClick={() => {
                  setApplyMode('all');
                  setSelectedBrand('');
                  setSelectedGroup('');
                  setSelectedModel('');
                  setSelectedGeneration('');
                  setSelectedEngine('');
                }}
                style={{
                  padding: '10px 8px',
                  borderRadius: '8px',
                  border: applyMode === 'all' ? '2px solid #00aaff' : '1px solid var(--border)',
                  background: applyMode === 'all' ? 'rgba(0, 170, 255, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                  color: applyMode === 'all' ? '#00aaff' : 'var(--text-main)',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  fontWeight: '600',
                  textTransform: 'uppercase'
                }}
              >
                {t('all') || 'ALL'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setApplyMode('selection');
                }}
                style={{
                  padding: '10px 8px',
                  borderRadius: '8px',
                  border: applyMode === 'selection' ? '2px solid #00aaff' : '1px solid var(--border)',
                  background: applyMode === 'selection' ? 'rgba(0, 170, 255, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                  color: applyMode === 'selection' ? '#00aaff' : 'var(--text-main)',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  fontWeight: '600',
                  textTransform: 'uppercase'
                }}
              >
                {t('selection') || 'SELECTION'}
              </button>
            </div>
          </div>

          {/* Level Selection - Only show if SELECTION mode */}
          {applyMode === 'selection' && (
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
                      border: level === l ? '2px solid #00aaff' : '1px solid var(--border)',
                      background: level === l ? 'rgba(0, 170, 255, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                      color: level === l ? '#00aaff' : 'var(--text-main)',
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
          )}

          {/* Hierarchical Selectors - Only show if SELECTION mode */}
          {applyMode === 'selection' && (
            <>
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
            </>
          )}

          {/* Pricing Rules Section */}
          <div style={{ marginBottom: '16px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
            <label style={labelStyle}>{t('pricingRules') || 'Pricing Rules'}</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }} className="dialog-grid-2">
              <div>
                <label style={{ ...labelStyle, fontSize: '0.75rem' }}>Stage 1+ (%)</label>
                <input
                  type="number"
                  value={stage1PlusPercentage}
                  onChange={(e) => setStage1PlusPercentage(e.target.value)}
                  placeholder="e.g. 15"
                  style={inputStyle}
                  min="0"
                  max="100"
                  step="1"
                />
              </div>
              <div>
                <label style={{ ...labelStyle, fontSize: '0.75rem' }}>Stage 2+ (%)</label>
                <input
                  type="number"
                  value={stage2PlusPercentage}
                  onChange={(e) => setStage2PlusPercentage(e.target.value)}
                  placeholder="e.g. 15"
                  style={inputStyle}
                  min="0"
                  max="100"
                  step="1"
                />
              </div>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '8px', marginBottom: 0 }}>
              {t('stagePlusExplanation') || 'Stage 1+ = Stage 1 price + percentage | Stage 2+ = Stage 2 price + percentage'}
            </p>
          </div>

          {/* Price Preview */}
          {stage1PlusPercentage && stage2PlusPercentage && !isNaN(parseFloat(stage1PlusPercentage)) && !isNaN(parseFloat(stage2PlusPercentage)) && (
            <div style={{
              marginBottom: '16px',
              padding: '12px',
              background: 'rgba(0, 170, 255, 0.05)',
              borderRadius: '8px',
              border: '1px solid rgba(0, 170, 255, 0.2)'
            }}>
              <p style={{ margin: '0 0 8px 0', fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: '500' }}>
                {t('pricePreview') || 'Price Preview Example:'}
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.8rem' }}>
                <div>
                  <div style={{ color: 'var(--text-secondary)' }}>Stage 1: €600</div>
                  <div style={{ color: '#00aaff', fontWeight: '500' }}>
                    Stage 1+: €{Math.round(600 * (1 + parseFloat(stage1PlusPercentage) / 100))}
                  </div>
                </div>
                <div>
                  <div style={{ color: 'var(--text-secondary)' }}>Stage 2: €800</div>
                  <div style={{ color: '#00aaff', fontWeight: '500' }}>
                    Stage 2+: €{Math.round(800 * (1 + parseFloat(stage2PlusPercentage) / 100))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Summary Box */}
          {isValid() && (
            <div style={{
              padding: '12px 16px',
              background: 'rgba(0, 170, 255, 0.1)',
              border: '1px solid rgba(0, 170, 255, 0.3)',
              borderRadius: '8px',
              marginBottom: '16px'
            }}>
              <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                {t('willUpdatePricesFor') || 'This will update Stage+ prices for'} <strong style={{ color: '#00aaff' }}>{getTargetName()}</strong>
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
              disabled={isApplying}
            >
              {t('cancel') || 'Cancel'}
            </button>
            <button
              type="submit"
              className="btn"
              style={{
                flex: 1,
                background: isValid() ? '#00aaff' : 'rgba(0, 170, 255, 0.3)',
                color: isValid() ? '#1a1a1a' : '#666',
                border: 'none',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
              disabled={!isValid() || isApplying}
            >
              {isApplying ? (
                <>
                  <Loader2 size={16} className="spin" />
                  {t('applying') || 'Applying...'}
                </>
              ) : (
                t('applyPricing') || 'Apply Pricing'
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


