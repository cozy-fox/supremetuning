'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/components/LanguageContext';
import { Search, Car, Settings, Gauge, ChevronRight, Zap } from 'lucide-react';

// Performance Brand Logos
const BMWMLogo = ({ size = 40 }) => (
  <svg width={size} height={size * 0.6} viewBox="0 0 100 60" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 50 L10 10 L25 35 L40 10 L40 50 L32 50 L32 25 L25 40 L18 25 L18 50 Z" fill="#0066cc" stroke="#0066cc" strokeWidth="1" />
    <path d="M45 50 L45 10 L60 35 L75 10 L75 50 L67 50 L67 25 L60 40 L53 25 L53 50 Z" fill="#0066cc" stroke="#0066cc" strokeWidth="1" />
    <rect x="0" y="0" width="100" height="4" fill="#0066cc" />
    <rect x="0" y="4" width="100" height="4" fill="#cc0000" />
    <rect x="0" y="56" width="100" height="4" fill="#0066cc" />
  </svg>
);

const AudiRSLogo = ({ size = 40 }) => (
  <svg width={size} height={size * 0.5} viewBox="0 0 100 50" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="rsGradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" style={{ stopColor: '#ff0000', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#cc0000', stopOpacity: 1 }} />
      </linearGradient>
    </defs>
    <path d="M5 40 L5 10 L20 10 Q28 10 28 18 Q28 24 22 25 L30 40 L22 40 L15 26 L13 26 L13 40 Z M13 18 L13 20 L20 20 Q20 18 18 18 Z" fill="url(#rsGradient)" stroke="#ff0000" strokeWidth="0.5" />
    <path d="M35 40 Q32 40 32 37 L32 35 L40 35 L40 37 Q40 38 42 38 L48 38 Q50 38 50 36 Q50 34 48 34 L40 34 Q35 34 35 28 Q35 22 40 22 L50 22 Q55 22 55 27 L55 29 L47 29 L47 27 Q47 26 45 26 L42 26 Q40 26 40 28 Q40 30 42 30 L50 30 Q55 30 55 36 Q55 40 50 40 Z" fill="url(#rsGradient)" stroke="#ff0000" strokeWidth="0.5" />
    <path d="M0 45 L100 45" stroke="#ff0000" strokeWidth="2" strokeLinecap="square" />
    <path d="M0 48 L20 48 L25 50 L100 50" stroke="#ff0000" strokeWidth="1" opacity="0.6" />
  </svg>
);

const MercedesAMGLogo = ({ size = 40 }) => (
  <svg width={size * 1.5} height={size * 0.5} viewBox="0 0 150 50" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="amgGradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" style={{ stopColor: '#00d4aa', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#008866', stopOpacity: 1 }} />
      </linearGradient>
    </defs>
    <path d="M5 40 L15 10 L25 10 L35 40 L27 40 L24 30 L16 30 L13 40 Z M18 24 L22 24 L20 16 Z" fill="url(#amgGradient)" stroke="#00d4aa" strokeWidth="0.5" />
    <path d="M40 40 L40 10 L48 10 L55 28 L62 10 L70 10 L70 40 L63 40 L63 20 L57 35 L53 35 L47 20 L47 40 Z" fill="url(#amgGradient)" stroke="#00d4aa" strokeWidth="0.5" />
    <path d="M75 40 Q72 40 72 37 L72 13 Q72 10 75 10 L95 10 Q98 10 98 13 L98 18 L90 18 L90 15 Q90 14 88 14 L77 14 Q75 14 75 16 L75 34 Q75 36 77 36 L88 36 Q90 36 90 34 L90 28 L82 28 L82 24 L98 24 L98 37 Q98 40 95 40 Z" fill="url(#amgGradient)" stroke="#00d4aa" strokeWidth="0.5" />
    <path d="M0 45 L150 45" stroke="#00d4aa" strokeWidth="2" strokeLinecap="square" />
    <path d="M0 48 L150 48" stroke="#00d4aa" strokeWidth="1" opacity="0.5" />
  </svg>
);

export default function BrandSelector({ brand, models: initialModels, brandGroups }) {
  const router = useRouter();
  const { t } = useLanguage();

  // Group selection state (for Audi RS, BMW M, Mercedes-AMG)
  const [selGroup, setSelGroup] = useState(null);
  const [filteredModels, setFilteredModels] = useState(initialModels);

  const [types, setTypes] = useState([]);
  const [engines, setEngines] = useState([]);

  const [selModel, setSelModel] = useState(null);
  const [selType, setSelType] = useState(null);
  const [selEngine, setSelEngine] = useState(null);
  const [engineType, setEngineType] = useState(null);
  const [loading, setLoading] = useState(false);

  // Check if this brand has groups (from database)
  const hasGroups = brandGroups?.hasGroups || false;
  const groups = brandGroups?.groups || [];
  const defaultGroupId = brandGroups?.defaultGroupId || null;

  // Handle group selection (for brands with performance divisions)
  // Now uses database groupId instead of filter functions
  const handleGroup = useCallback(async (groupId) => {
    setSelGroup(groupId);
    setSelModel(null);
    setTypes([]);
    setSelType(null);
    setEngines([]);
    setSelEngine(null);

    if (groupId) {
      setLoading(true);
      try {
        // Now uses groupId from database instead of string identifier
        const res = await fetch(`/api/models?brandId=${brand.id}&groupId=${groupId}`);
        const data = await res.json();
        setFilteredModels(data);
      } catch (error) {
        console.error("Error fetching models by group:", error);
        setFilteredModels(initialModels);
      }
      setLoading(false);
    } else {
      setFilteredModels(initialModels);
    }
  }, [brand.id, initialModels]);

  // Auto-select default group on mount for brands without performance divisions
  useEffect(() => {
    if (!hasGroups && defaultGroupId && !selGroup) {
      // Auto-load models for the default group
      handleGroup(defaultGroupId);
    }
  }, [hasGroups, defaultGroupId, selGroup, handleGroup]);

  const handleModel = useCallback(async (e) => {
    const modelId = parseInt(e.target.value);
    const model = filteredModels.find(m => m.id === modelId);
    setSelModel(model);
    setTypes([]);
    setSelType(null);
    setEngines([]);
    setSelEngine(null);

    if (model) {
      setLoading(true);
      try {
        const res = await fetch(`/api/types?modelId=${modelId}`);
        const data = await res.json();
        setTypes(data);
      } catch (error) {
        console.error("Error fetching types:", error);
      }
      setLoading(false);
    }
  }, [filteredModels]);

  const handleType = useCallback(async (e) => {
    const typeId = parseInt(e.target.value);
    const type = types.find(t => t.id === typeId);
    setSelType(type);
    setEngines([]);
    setSelEngine(null);
    setEngineType(null);

    if (type) {
      setLoading(true);
      try {
        const res = await fetch(`/api/engines?typeId=${typeId}`);
        const data = await res.json();
        setEngines(data);
      } catch (error) {
        console.error("Error fetching engines:", error);
      }
      setLoading(false);
    }
  }, [types]);

  const handleEngine = useCallback((e) => {
    const engineId = parseInt(e.target.value);
    const engine = engines.find(eng => eng.id === engineId);
    setSelEngine(engine);
  }, [engines]);

  const filteredEngines = useMemo(() => {
    if (!engineType) return engines;
    return engines.filter(e => e.type === engineType);
  }, [engines, engineType]);

  const canSearch = selModel && selType && selEngine;

  const handleSearch = useCallback(() => {
    if (!canSearch) return;
    const url = `/${brand.name.toLowerCase()}/${encodeURIComponent(selModel.name)}/${encodeURIComponent(selType.name)}/${selEngine.id}`;
    router.push(url);
  }, [canSearch, brand, selModel, selType, selEngine, router]);

  return (
    <div className="selector-container animate-in" style={{ marginTop: '32px' }}>
      {/* Group Selection for brands with performance divisions */}
      {hasGroups && (
        <div className="group-selector-row" style={{ marginBottom: '24px' }}>
          <div className="group-buttons" style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {groups.map(group => {
              // Performance group styling
              const getGroupStyle = () => {
                const baseStyle = {
                  padding: '12px 24px',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  transition: 'all 0.2s ease',
                  minWidth: '120px',
                  justifyContent: 'center'
                };

                if (!group.isPerformance) {
                  return {
                    ...baseStyle,
                    background: selGroup === group.id ? 'rgba(184, 192, 200, 0.3)' : 'rgba(255,255,255,0.1)',
                    color: selGroup === group.id ? '#fff' : 'rgba(255,255,255,0.7)',
                    border: selGroup === group.id ? '2px solid var(--primary)' : '2px solid transparent'
                  };
                }

                // Use color from database if available, otherwise use defaults
                const activeColor = group.color || (() => {
                  const groupName = (group.name || '').toUpperCase();
                  // if (groupName === 'RS') return '#ff0000';
                  // if (groupName === 'M') return '#0066cc';
                  // if (groupName === 'AMG') return '#00d4aa';
                  return 'var(--primary)';
                })();

                const bgColor = 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)';

                return {
                  ...baseStyle,
                  background: bgColor,
                  color: selGroup === group.id ? activeColor : 'rgba(255,255,255,0.9)',
                  border: selGroup === group.id ? `2px solid ${activeColor}` : '2px solid rgba(255,255,255,0.2)',
                  boxShadow: selGroup === group.id ? `0 0 20px ${activeColor}40` : 'none'
                };
              };

              const getGroupIcon = () => {
                // Use icon from database if available, otherwise use defaults
                if (group.icon) return group.icon;
                const groupName = (group.name || '').toUpperCase();
                return null;
              };

              const getGroupColor = () => {
                // Use color from database if available
                if (group.color) return group.color;
                const groupName = (group.name || '').toUpperCase();
                // if (groupName === 'RS') return '#ff0000';
                // if (groupName === 'M') return '#0066cc';
                // if (groupName === 'AMG') return '#00d4aa';
                return 'var(--primary)';
              };

              // Get the appropriate logo for performance groups
              const getGroupLogo = () => {
                if (!group.isPerformance) return null;
                const groupName = (group.name || '').toUpperCase();
                const logoSize = 32;

                if (groupName === 'M') {
                  return <BMWMLogo size={logoSize} />;
                } else if (groupName === 'RS') {
                  return <AudiRSLogo size={logoSize} />;
                } else if (groupName === 'AMG') {
                  return <MercedesAMGLogo size={logoSize} />;
                }
                // return <Zap size={16} />;
                <img src="/assets/logo.png" alt="Supreme Tuning Logo" width={30} />
              };

              return (
                <button
                  key={group.id}
                  style={getGroupStyle()}
                  onClick={() => handleGroup(group.id)}
                >
                  {group.isPerformance && getGroupLogo()}
                  {!group.isPerformance && <span>{group.displayName || group.name}</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Horizontal Selector Row */}
      <div className="selector-row">
        {/* Model Selector */}
        <div className="selector-item">
          <label className="selector-label">
            <Car size={16} />
            <span>{t('model')}</span>
          </label>
          <select
            onChange={handleModel}
            value={selModel?.id || ''}
            disabled={loading || (hasGroups && !selGroup)}
            className="selector-select"
          >
            <option value="">{hasGroups && !selGroup ? t('selectGroupFirst') || 'Select category first' : t('selectModel')}</option>
            {filteredModels.map(m => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>

        <ChevronRight size={24} className="selector-arrow" />

        {/* Type/Generation Selector */}
        <div className="selector-item">
          <label className="selector-label">
            <Settings size={16} />
            <span>{t('generation')}</span>
          </label>
          <select
            onChange={handleType}
            value={selType?.id || ''}
            disabled={loading || !selModel}
            className="selector-select"
          >
            <option value="">{t('selectGeneration')}</option>
            {types.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>

        <ChevronRight size={24} className="selector-arrow" />

        {/* Engine Selector */}
        <div className="selector-item">
          <label className="selector-label">
            <Gauge size={16} />
            <span>{t('engine')}</span>
          </label>
          <select
            onChange={handleEngine}
            value={selEngine?.id || ''}
            disabled={loading || !selType || filteredEngines.length === 0}
            className="selector-select"
          >
            <option value="">{t('selectEngine')}</option>
            {filteredEngines.map(e => (
              
              <option key={e.id} value={e.id}>
                {e.name}{e.power ? ` ${e.power}` : ''}{t('enginePowerUnit')}  - {e.description} ({e.type})
                
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Search Button */}
      <div className="search-row">
        <button
          onClick={handleSearch}
          className="btn-search-modern"
          disabled={!canSearch}
        >
          <Search size={22} />
          <span>{t('search')}</span>
          <div className="btn-arrow">
            <ChevronRight size={20} />
          </div>
        </button>
      </div>

      {loading && (
        <div className="flex-center" style={{ padding: '20px 0' }}>
          <div className="spinner"></div>
        </div>
      )}
    </div>
  );
}
