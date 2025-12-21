'use client';

import { useState, useEffect } from 'react';
import { Plus, Upload } from 'lucide-react';
import { useLanguage } from '@/components/LanguageContext';

export default function AddBrandDialog({ show, onConfirm, onCancel }) {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    logo: '',
    isTest: false
  });
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  useEffect(() => {
    if (show) {
      setFormData({ name: '', logo: '', isTest: false });
      setUploadError('');
    }
  }, [show]);

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setUploadError(t('invalidFileType') || 'Invalid file type. Only PNG, JPG, SVG, and WebP are allowed.');
      return;
    }

    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      setUploadError(t('fileTooLarge') || 'File too large. Maximum size is 2MB.');
      return;
    }

    setUploading(true);
    setUploadError('');

    try {
      const formDataToUpload = new FormData();
      formDataToUpload.append('file', file);

      const token = localStorage.getItem('authToken');

      const response = await fetch('/api/admin/upload-logo', {
        method: 'POST',
        body: formDataToUpload,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Upload failed');
      }

      const data = await response.json();
      setFormData({ ...formData, logo: data.dataUrl });
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError(error.message || t('uploadFailed') || 'Failed to upload logo');
    } finally {
      setUploading(false);
    }
  };

  if (!show) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name.trim()) {
      onConfirm(formData);
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
      onClick={onCancel}
    >
      <div
        className="dialog-content dialog-responsive-padding"
        style={{
          background: 'rgba(0,0,0,1)',
          borderRadius: '16px',
          maxWidth: '500px',
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
          <h3 style={{ margin: '0 0 8px 0' }}>{t('addNewBrand') || 'Add New Brand'}</h3>
          <p style={{ color: '#8a8a8a', fontSize: '0.9rem', margin: 0 }}>
            {t('configureBrandDetails') || 'Configure brand name and logo'}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Brand Name */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#b8c0c8' }}>
              {t('brandName') || 'Brand Name'} *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder={t('brandNamePlaceholder') || 'e.g. Toyota, Honda'}
              required
              autoFocus
              style={{
                width: '100%',
                padding: '12px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '1rem'
              }}
            />
          </div>

          {/* Logo Upload */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '12px', fontSize: '0.9rem', color: '#b8c0c8' }}>
              {t('brandLogo') || 'Brand Logo'}
            </label>

            <label
              style={{
                display: 'block',
                padding: '20px',
                background: formData.logo
                  ? 'rgba(0, 255, 136, 0.1)'
                  : 'rgba(255, 255, 255, 0.03)',
                border: formData.logo
                  ? '2px solid #00ff88'
                  : '1px dashed rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                textAlign: 'center',
                cursor: uploading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <input
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/svg+xml,image/webp"
                onChange={handleFileUpload}
                disabled={uploading}
                style={{ display: 'none' }}
              />

              {uploading ? (
                <>
                  <div className="spinner" style={{ marginBottom: '8px' }} />
                  <p style={{ margin: 0, color: '#8a8a8a', fontSize: '0.85rem' }}>{t('uploading') || 'Uploading...'}</p>
                </>
              ) : formData.logo ? (
                <>
                  <img
                    src={formData.logo}
                    alt="Uploaded logo"
                    style={{
                      maxWidth: '120px',
                      maxHeight: '80px',
                      marginBottom: '8px',
                      objectFit: 'contain'
                    }}
                  />
                  <p style={{ margin: 0, color: '#00ff88', fontSize: '0.85rem' }}>✓ {t('logoUploaded') || 'Logo uploaded'}</p>
                  <p style={{ margin: '4px 0 0 0', color: '#6a6a6a', fontSize: '0.75rem' }}>{t('clickToChange') || 'Click to change'}</p>
                </>
              ) : (
                <>
                  <Upload size={24} style={{ marginBottom: '8px', color: '#8a8a8a' }} />
                  <p style={{ margin: 0, color: '#8a8a8a', fontSize: '0.85rem' }}>
                    {t('clickToUpload') || 'Click to upload or drag and drop'}
                  </p>
                  <p style={{ margin: '4px 0 0 0', color: '#6a6a6a', fontSize: '0.75rem' }}>
                    {t('maxFileSize') || 'PNG, JPG, SVG, WebP (max 2MB)'}
                  </p>
                </>
              )}
            </label>

            {uploadError && (
              <p style={{ margin: '8px 0 0 0', color: '#ff4444', fontSize: '0.85rem' }}>
                ⚠️ {uploadError}
              </p>
            )}
          </div>

          {/* Test/Product Toggle */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '12px', fontSize: '0.9rem', color: '#b8c0c8' }}>
              {t('brandType') || 'Brand Type'}
            </label>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, isTest: false })}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: !formData.isTest ? 'rgba(0, 255, 136, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                  border: !formData.isTest ? '2px solid #00ff88' : '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  color: !formData.isTest ? '#00ff88' : '#8a8a8a',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: !formData.isTest ? '600' : '400',
                  transition: 'all 0.2s'
                }}
              >
                🏭 {t('production') || 'Production'}
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, isTest: true })}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: formData.isTest ? 'rgba(255, 170, 0, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                  border: formData.isTest ? '2px solid #ffaa00' : '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  color: formData.isTest ? '#ffaa00' : '#8a8a8a',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: formData.isTest ? '600' : '400',
                  transition: 'all 0.2s'
                }}
              >
                🧪 {t('test') || 'Test'}
              </button>
            </div>
            <p style={{ margin: '8px 0 0 0', color: '#6a6a6a', fontSize: '0.8rem' }}>
              {formData.isTest
                ? (t('testBrandDescription') || 'Test brands are hidden from the frontend website')
                : (t('productionBrandDescription') || 'Production brands are visible on the frontend website')
              }
            </p>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
            <button
              type="button"
              onClick={onCancel}
              className="btn"
              style={{
                flex: 1,
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                padding: '12px',
                borderRadius: '8px',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '1rem'
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
                fontWeight: '600',
                padding: '12px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '1rem'
              }}
              disabled={!formData.name.trim() || uploading}
            >
              {t('addBrand') || 'Add Brand'}
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

