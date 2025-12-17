'use client';

import { useState, useEffect } from 'react';
import { Edit2, Upload } from 'lucide-react';
import { useLanguage } from '@/components/LanguageContext';
import { BMWLogo, BMWMLogo, AudiLogo, AudiRSLogo, MercedesLogo, MercedesAMGLogo } from '@/components/BrandLogos';

export default function EditGroupDialog({ show, onConfirm, onCancel, brandName, groupData }) {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    displayName: '',
    description: '',
    isPerformance: false,
    color: '#00ff88',
    icon: '🏁',
    tagline: '',
    logo: '',
    logoType: 'builtin'
  });
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  useEffect(() => {
    if (show && groupData) {
      // Populate form with existing group data
      // Detect if logo is a data URL (custom) or a built-in logo name
      const isCustomLogo = groupData.logo && groupData.logo.startsWith('data:');

      setFormData({
        name: groupData.name || '',
        displayName: groupData.displayName || '',
        description: groupData.description || '',
        isPerformance: groupData.isPerformance || false,
        color: groupData.color || '#00ff88',
        icon: groupData.icon || '🏁',
        tagline: groupData.tagline || '',
        logo: groupData.logo || '',
        logoType: isCustomLogo ? 'custom' : 'builtin'
      });
      setUploadError('');
    }
  }, [show, groupData]);

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setUploadError('Invalid file type. Only PNG, JPG, SVG, and WebP are allowed.');
      return;
    }

    // Validate file size (max 2MB)
    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      setUploadError('File too large. Maximum size is 2MB.');
      return;
    }

    setUploading(true);
    setUploadError('');

    try {
      const formDataToUpload = new FormData();
      formDataToUpload.append('file', file);
      formDataToUpload.append('groupId', groupData?.id || '');

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

      // Set the uploaded logo data URL
      setFormData({
        ...formData,
        logo: data.dataUrl,
        logoType: 'custom'
      });
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError(error.message || 'Failed to upload logo');
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

  // Get available built-in logos based on brand
  const getBuiltInLogos = () => {
    const brand = (brandName || '').toUpperCase();
    const logos = [];

    if (brand === 'BMW') {
      logos.push({ name: 'Standard', component: <BMWLogo size={60} />, value: 'bmw-standard' });
      logos.push({ name: 'M', component: <BMWMLogo size={60} />, value: 'bmw-m' });
    } else if (brand === 'AUDI') {
      logos.push({ name: 'Standard', component: <AudiLogo size={60} />, value: 'audi-standard' });
      logos.push({ name: 'RS', component: <AudiRSLogo size={60} />, value: 'audi-rs' });
    } else if (brand === 'MERCEDES' || brand === 'MERCEDES-BENZ') {
      logos.push({ name: 'Standard', component: <MercedesLogo size={60} />, value: 'mercedes-standard' });
      logos.push({ name: 'AMG', component: <MercedesAMGLogo size={60} />, value: 'mercedes-amg' });
    }

    return logos;
  };

  const builtInLogos = getBuiltInLogos();

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
          background: 'rgba(0,0,0,1)',
          borderRadius: '16px',
          padding: '32px',
          maxWidth: '600px',
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
            <Edit2 size={32} color="#00ff88" />
          </div>
          <h3 style={{ margin: '0 0 8px 0' }}>Edit Group</h3>
          <p style={{ color: '#8a8a8a', fontSize: '0.9rem', margin: 0 }}>
            {brandName}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Group Name */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#b8c0c8' }}>
              {t('groupName') || 'Group Name'} *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder={t('groupNamePlaceholder') || 'e.g. M, RS, AMG'}
              required
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

          {/* Display Name */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#b8c0c8' }}>
              {t('displayName') || 'Display Name'}
            </label>
            <input
              type="text"
              value={formData.displayName}
              onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
              placeholder={t('displayNamePlaceholder') || 'e.g. M Performance'}
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

          {/* Description */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: '#b8c0c8' }}>
              {t('description') || 'Description'}
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder={t('descriptionPlaceholder') || 'Optional description'}
              rows={3}
              style={{
                width: '100%',
                padding: '12px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '1rem',
                resize: 'vertical'
              }}
            />
          </div>

          {/* Performance Group Checkbox */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={formData.isPerformance}
                onChange={(e) => setFormData({ ...formData, isPerformance: e.target.checked })}
                style={{ marginRight: '8px', width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '0.9rem', color: '#b8c0c8' }}>
                {t('isPerformance') || 'Performance Group'}
              </span>
            </label>
          </div>

          {/* Logo Selection */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '12px', fontSize: '0.9rem', color: '#b8c0c8' }}>
              {t('logoImage') || 'Logo Image'}
            </label>

            {/* Built-in Logos */}
            {builtInLogos.length > 0 && (
              <div style={{ marginBottom: '16px' }}>
                <p style={{ fontSize: '0.85rem', color: '#8a8a8a', marginBottom: '8px' }}>
                  {t('selectLogo') || 'Select Logo'}
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '12px' }}>
                  {builtInLogos.map((logo) => (
                    <div
                      key={logo.value}
                      onClick={() => setFormData({ ...formData, logo: logo.value, logoType: 'builtin' })}
                      style={{
                        padding: '16px',
                        background: formData.logo === logo.value && formData.logoType === 'builtin'
                          ? 'rgba(0, 255, 136, 0.1)'
                          : 'rgba(255, 255, 255, 0.05)',
                        border: formData.logo === logo.value && formData.logoType === 'builtin'
                          ? '2px solid #00ff88'
                          : '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'all 0.2s'
                      }}
                    >
                      <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'center' }}>
                        {logo.component}
                      </div>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: '#b8c0c8' }}>{logo.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Custom Logo Upload */}
            <div>
              <p style={{ fontSize: '0.85rem', color: '#8a8a8a', marginBottom: '8px' }}>
                {t('uploadCustomLogo') || 'Upload Custom Logo'}
              </p>

              {/* Upload Button */}
              <label
                style={{
                  display: 'block',
                  padding: '20px',
                  background: formData.logoType === 'custom' && formData.logo
                    ? 'rgba(0, 255, 136, 0.1)'
                    : 'rgba(255, 255, 255, 0.03)',
                  border: formData.logoType === 'custom' && formData.logo
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
                ) : formData.logoType === 'custom' && formData.logo ? (
                  <>
                    <img
                      src={formData.logo}
                      alt="Uploaded logo"
                      style={{
                        maxWidth: '100px',
                        maxHeight: '60px',
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

              {/* Upload Error */}
              {uploadError && (
                <p style={{ margin: '8px 0 0 0', color: '#ff4444', fontSize: '0.85rem' }}>
                  ⚠️ {uploadError}
                </p>
              )}
            </div>
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
              disabled={!formData.name.trim()}
            >
              {t('save') || 'Save Changes'}
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
