'use client';

import { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import { useLanguage } from '@/components/LanguageContext';

export default function AddEngineDialog({ show, onConfirm, onCancel, brandName }) {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    stockPower: '',
    tunedPower: '',
    engineType: 'Diesel',
    ecuUnlock: false,
    cpcUpgrade: false,
    createStages: true,
    stages: {
      stage1: true,
      stage1Plus: true,
      stage2: true,
      stage2Plus: true
    }
  });

  useEffect(() => {
    if (show) {
      // Reset form when dialog opens
      setFormData({
        name: '',
        stockPower: '',
        tunedPower: '',
        engineType: 'Diesel',
        ecuUnlock: false,
        cpcUpgrade: false,
        createStages: true,
        stages: {
          stage1: true,
          stage1Plus: true,
          stage2: true,
          stage2Plus: true
        }
      });
    }
  }, [show]);

  if (!show) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name.trim()) {
      onConfirm(formData);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleStageChange = (stage, value) => {
    setFormData(prev => ({
      ...prev,
      stages: { ...prev.stages, [stage]: value }
    }));
  };

  const isBMW = brandName?.toLowerCase().includes('bmw');
  const isMercedes = brandName?.toLowerCase().includes('mercedes');

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
        animation: 'fadeIn 0.2s ease-out',
        overflowY: 'auto'
      }}
      onClick={onCancel}
    >
      <div
        style={{
          background: '#1a1a1a',
          borderRadius: '16px',
          padding: '32px',
          maxWidth: '600px',
          width: '100%',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
          animation: 'scaleIn 0.2s ease-out',
          maxHeight: '90vh',
          overflowY: 'auto',
          margin: '20px 0'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div
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
            <Plus size={32} color="#00ff88" />
          </div>
          <h3 style={{ margin: '0 0 8px 0' }}>{t('addNewEngine') || 'Add New Engine'}</h3>
          <p style={{ color: '#8a8a8a', fontSize: '0.9rem', margin: 0 }}>
            {t('configureEngineDetails') || 'Configure engine details and initial stages'}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Engine Name */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#b8c0c8' }}>
              {t('engineName') || 'Engine Name'} *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder={t('engineNamePlaceholder') || 'e.g., 2.0 TDI 150hp'}
              required
              autoFocus
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                background: 'rgba(255, 255, 255, 0.05)',
                color: 'var(--text)',
                fontSize: '16px'
              }}
            />
          </div>

          {/* Stock Power and Tuned Power */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#b8c0c8' }}>
                {t('stockPower') || 'Stock Power (HP)'}
              </label>
              <input
                type="number"
                value={formData.stockPower}
                onChange={(e) => handleChange('stockPower', e.target.value)}
                placeholder="150"
                min="0"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: 'var(--text)',
                  fontSize: '16px'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#b8c0c8' }}>
                {t('tunedPower') || 'Tuned Power (HP)'}
              </label>
              <input
                type="number"
                value={formData.tunedPower}
                onChange={(e) => handleChange('tunedPower', e.target.value)}
                placeholder="190"
                min="0"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: '1px solid var(--border)',
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: 'var(--text)',
                  fontSize: '16px'
                }}
              />
            </div>
          </div>

          {/* Engine Type */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#b8c0c8' }}>
              {t('engineType') || 'Engine Type'}
            </label>
            <select
              value={formData.engineType}
              onChange={(e) => handleChange('engineType', e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                background: 'rgba(255, 255, 255, 0.05)',
                color: 'var(--text)',
                fontSize: '16px'
              }}
            >
              <option value="Diesel">{t('diesel') || 'Diesel'}</option>
              <option value="Petrol">{t('petrol') || 'Petrol'}</option>
              <option value="Hybrid">{t('hybrid') || 'Hybrid'}</option>
              <option value="Electric">{t('electric') || 'Electric'}</option>
            </select>
          </div>

          {/* BMW ECU Unlock */}
          {isBMW && (
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                padding: '12px',
                borderRadius: '8px',
                background: 'rgba(255, 170, 0, 0.1)',
                border: '1px solid rgba(255, 170, 0, 0.3)'
              }}>
                <input
                  type="checkbox"
                  checked={formData.ecuUnlock}
                  onChange={(e) => handleChange('ecuUnlock', e.target.checked)}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <span style={{ fontSize: '0.9rem', color: '#ffaa00' }}>
                  {t('ecuUnlockRequired') || 'ECU Unlock Required (BMW)'}
                </span>
              </label>
            </div>
          )}

          {/* Mercedes CPC Upgrade */}
          {isMercedes && (
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                padding: '12px',
                borderRadius: '8px',
                background: 'rgba(0, 212, 170, 0.1)',
                border: '1px solid rgba(0, 212, 170, 0.3)'
              }}>
                <input
                  type="checkbox"
                  checked={formData.cpcUpgrade}
                  onChange={(e) => handleChange('cpcUpgrade', e.target.checked)}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <span style={{ fontSize: '0.9rem', color: '#00d4aa' }}>
                  {t('cpcUpgradeRequired') || 'CPC Upgrade Required (Mercedes)'}
                </span>
              </label>
            </div>
          )}

          {/* Create Stages Section */}
          <div style={{
            marginBottom: '20px',
            padding: '16px',
            borderRadius: '8px',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              marginBottom: '12px'
            }}>
              <input
                type="checkbox"
                checked={formData.createStages}
                onChange={(e) => handleChange('createStages', e.target.checked)}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '0.95rem', fontWeight: '600' }}>
                {t('createInitialStages') || 'Create Initial Stages'}
              </span>
            </label>

            {formData.createStages && (
              <div style={{ marginLeft: '26px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.85rem' }}>
                  <input
                    type="checkbox"
                    checked={formData.stages.stage1}
                    onChange={(e) => handleStageChange('stage1', e.target.checked)}
                    style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                  />
                  {t('stage1') || 'Stage 1'}
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.85rem' }}>
                  <input
                    type="checkbox"
                    checked={formData.stages.stage1Plus}
                    onChange={(e) => handleStageChange('stage1Plus', e.target.checked)}
                    style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                  />
                  {t('stage1Plus') || 'Stage 1+'}
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.85rem' }}>
                  <input
                    type="checkbox"
                    checked={formData.stages.stage2}
                    onChange={(e) => handleStageChange('stage2', e.target.checked)}
                    style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                  />
                  {t('stage2') || 'Stage 2'}
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.85rem' }}>
                  <input
                    type="checkbox"
                    checked={formData.stages.stage2Plus}
                    onChange={(e) => handleStageChange('stage2Plus', e.target.checked)}
                    style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                  />
                  {t('stage2Plus') || 'Stage 2+'}
                </label>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              type="button"
              onClick={onCancel}
              className="btn"
              style={{
                flex: 1,
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}
            >
              {t('cancel') || 'Cancel'}
            </button>
            <button
              type="submit"
              className="btn"
              style={{
                flex: 1,
                background: '#00ff88',
                color: '#1a1a1a',
                border: 'none',
                fontWeight: '600'
              }}
              disabled={!formData.name.trim()}
            >
              {t('addEngine') || 'Add Engine'}
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
      `}</style>
    </div>
  );
}


