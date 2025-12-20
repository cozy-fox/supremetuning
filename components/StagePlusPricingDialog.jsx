'use client';

import { useState, useEffect } from 'react';
import { Percent, AlertCircle, X } from 'lucide-react';
import { useLanguage } from '@/components/LanguageContext';

export default function StagePlusPricingDialog({
  show,
  onClose,
  onApply,
  brands = [],
  models = [],
  generations = []
}) {
  const [stage1PlusPercentage, setStage1PlusPercentage] = useState('15');
  const [stage2PlusPercentage, setStage2PlusPercentage] = useState('15');
  const [isApplying, setIsApplying] = useState(false);

  // Selection state
  const [scope, setScope] = useState('all'); // 'all', 'brand', 'model', 'generation'
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedGeneration, setSelectedGeneration] = useState('');

  const { t } = useLanguage();

  // Reset selections when dialog opens
  useEffect(() => {
    if (show) {
      setScope('all');
      setSelectedBrand('');
      setSelectedModel('');
      setSelectedGeneration('');
      setStage1PlusPercentage('15');
      setStage2PlusPercentage('15');
    }
  }, [show]);

  // Filter data based on selections
  const filteredModels = models.filter(m =>
    selectedBrand ? m.brandId === parseInt(selectedBrand) : true
  );
  const filteredGenerations = generations.filter(g =>
    selectedModel ? g.modelId === parseInt(selectedModel) : true
  );

  if (!show) return null;

  const handleApply = async () => {
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
      await onApply({
        stage1PlusPercentage: percentage1Plus,
        stage2PlusPercentage: percentage2Plus
      });
      onClose();
    } catch (error) {
      console.error('Failed to apply Stage+ pricing:', error);
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div
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
          maxWidth: '600px',
          width: '100%',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
          animation: 'scaleIn 0.2s ease-out'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div
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
          <h3 style={{ margin: '0 0 8px 0' }}>
            {t('stagePlusPricing') || 'Stage+ Automatic Pricing'}
          </h3>
        </div>

        <div>
          {/* Info Box */}
          <div style={{
            padding: '16px',
            background: 'rgba(0, 170, 255, 0.1)',
            border: '1px solid rgba(0, 170, 255, 0.3)',
            borderRadius: '8px',
            marginBottom: '24px'
          }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <AlertCircle size={20} color="#00aaff" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>
                <h4 style={{ margin: '0 0 8px 0', color: '#00aaff', fontSize: '14px' }}>
                  {t('automaticPricingInfo') || 'Automatic Pricing Rule'}
                </h4>
                <p style={{ margin: 0, fontSize: '13px', color: '#b0b0b0', lineHeight: '1.5' }}>
                  {t('stagePlusDescription') || 'This will automatically calculate Stage 1+ and Stage 2+ prices based on a percentage increase over Stage 1 and Stage 2 prices for ALL engines in the database.'}
                </p>
              </div>
            </div>
          </div>

          {/* Stage 1+ Percentage */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
              {t('stage1PlusPercentage') || 'Stage 1+ Price Increase (%)'}
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <input
                type="number"
                value={stage1PlusPercentage}
                onChange={(e) => setStage1PlusPercentage(e.target.value)}
                min="0"
                max="100"
                step="1"
                style={{
                  flex: 1,
                  padding: '12px',
                  fontSize: '16px',
                  borderRadius: '6px',
                  border: '1px solid var(--border)',
                  background: 'var(--bg-input)',
                  color: 'var(--text-main)'
                }}
                placeholder="15"
              />
              <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>%</span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px' }}>
              {t('example') || 'Example'}: Stage 1 = €600 → Stage 1+ = €{Math.round(600 * (1 + parseFloat(stage1PlusPercentage || 0) / 100))}
            </p>
          </div>

          {/* Stage 2+ Percentage */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
              {t('stage2PlusPercentage') || 'Stage 2+ Price Increase (%)'}
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <input
                type="number"
                value={stage2PlusPercentage}
                onChange={(e) => setStage2PlusPercentage(e.target.value)}
                min="0"
                max="100"
                step="1"
                style={{
                  flex: 1,
                  padding: '12px',
                  fontSize: '16px',
                  borderRadius: '6px',
                  border: '1px solid var(--border)',
                  background: 'var(--bg-input)',
                  color: 'var(--text-main)'
                }}
                placeholder="15"
              />
              <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>%</span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '6px' }}>
              {t('example') || 'Example'}: Stage 2 = €900 → Stage 2+ = €{Math.round(900 * (1 + parseFloat(stage2PlusPercentage || 0) / 100))}
            </p>
          </div>

          {/* Warning */}
          <div style={{
            padding: '12px',
            background: 'rgba(255, 170, 0, 0.1)',
            border: '1px solid rgba(255, 170, 0, 0.3)',
            borderRadius: '6px',
            marginBottom: '20px'
          }}>
            <p style={{ margin: 0, fontSize: '13px', color: '#ffaa00' }}>
              ⚠️ {t('stagePlusWarning') || 'This will update ALL Stage 1+ and Stage 2+ prices in the entire database. This action cannot be undone.'}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
          <button
            onClick={onClose}
            disabled={isApplying}
            style={{
              padding: '12px 24px',
              borderRadius: '8px',
              border: '1px solid var(--border)',
              background: 'transparent',
              color: 'var(--text-main)',
              cursor: isApplying ? 'not-allowed' : 'pointer',
              opacity: isApplying ? 0.5 : 1,
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            {t('cancel') || 'Cancel'}
          </button>
          <button
            onClick={handleApply}
            disabled={isApplying}
            style={{
              padding: '12px 24px',
              borderRadius: '8px',
              border: 'none',
              background: isApplying ? '#666' : '#00aaff',
              color: '#fff',
              cursor: isApplying ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '600'
            }}
          >
            {isApplying ? t('applying') || 'Applying...' : t('applyPricing') || 'Apply Pricing Rule'}
          </button>
        </div>
      </div>
    </div>
  );
}

