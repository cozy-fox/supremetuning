'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthContext';
import { useLanguage } from '@/components/LanguageContext';
import { Search, Car, Settings, Gauge, ChevronRight, Zap } from 'lucide-react';
import { BMWMLogo, AudiRSLogo, MercedesAMGLogo } from '@/components/BrandLogos';

export default function BrandSelector({
  brand,
  models: initialModels,
  brandGroups,
  selectedGroupId = null,
  hideGroupSelector = false
}) {
  const router = useRouter();
  const { fetchAPI } = useAuth();
  const { t } = useLanguage();

  // Group selection state (for Audi RS, BMW M, Mercedes-AMG)
  const [selGroup, setSelGroup] = useState(selectedGroupId);
  const [filteredModels, setFilteredModels] = useState(initialModels);

  const [types, setTypes] = useState([]);
  const [engines, setEngines] = useState([]);

  const [selModel, setSelModel] = useState(null);
  const [selType, setSelType] = useState(null);
  const [selEngine, setSelEngine] = useState(null);
  // const [engineType, setEngineType] = useState(null); // Fuel type filter disabled
  const [loading, setLoading] = useState(false);

  // Extract group configuration
  const hasGroups = brandGroups?.hasGroups || false;
  const groups = brandGroups?.groups || [];
  const defaultGroupId = selectedGroupId || brandGroups?.defaultGroupId || null;

  // Handle group selection (for brands with performance divisions)
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
        // Fetch models filtered by groupId
        const data = await fetchAPI(`models?brandId=${brand.id}&groupId=${groupId}`);
        setFilteredModels(data);
      } catch (error) {
        console.error("Error fetching models by group:", error);
        setFilteredModels(initialModels);
      }
      setLoading(false);
    } else {
      setFilteredModels(initialModels);
    }
  }, [brand.id, initialModels, fetchAPI]);

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
        const data = await fetchAPI(`types?modelId=${modelId}`);
        setTypes(data);
      } catch (error) {
        console.error("Error fetching types:", error);
      }
      setLoading(false);
    }
  }, [filteredModels, fetchAPI]);

  const handleType = useCallback(async (e) => {
    const typeId = parseInt(e.target.value);
    const type = types.find(t => t.id === typeId);
    setSelType(type);
    setEngines([]);
    setSelEngine(null);
    // setEngineType(null); // Fuel type filter disabled

    if (type) {
      setLoading(true);
      try {
        const data = await fetchAPI(`engines?typeId=${typeId}`);
        setEngines(data);
      } catch (error) {
        console.error("Error fetching engines:", error);
      }
      setLoading(false);
    }
  }, [types, fetchAPI]);

  const handleEngine = useCallback((e) => {
    const engineId = parseInt(e.target.value);
    const engine = engines.find(eng => eng.id === engineId);
    setSelEngine(engine);
  }, [engines]);

  // Fuel type filter disabled - show all engines
  const filteredEngines = useMemo(() => {
    return engines;
  }, [engines]);

  // const engineTypes = useMemo(() => {
  //   const types = [...new Set(engines.map(e => e.type).filter(Boolean))];
  //   return types;
  // }, [engines]);

  const canSearch = selModel && selType && selEngine;

  const handleSearch = useCallback(() => {
    if (!canSearch) return;
    const url = `/${brand.name.toLowerCase()}/${encodeURIComponent(selModel.name)}/${encodeURIComponent(selType.name)}/${selEngine.id}`;
    router.push(url);
  }, [canSearch, brand, selModel, selType, selEngine, router]);

  return (
    <div className="selector-container animate-in" style={{ marginTop: '32px' }}>
      {/* Group Selection for brands with performance divisions */}
      {hasGroups && !hideGroupSelector && (
        <div className="group-selector-row" style={{ marginBottom: '32px' }}>
          <div className="group-buttons" style={{
            display: 'flex',
            gap: '16px',
            justifyContent: 'center',
            flexWrap: 'wrap',
            padding: '8px'
          }}>
            {groups.map(group => {
              // Performance group styling
              const getGroupStyle = () => {
                const isSelected = selGroup === group.id;
                const baseStyle = {
                  padding: '16px 32px',
                  borderRadius: '12px',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontSize: '1.05rem',
                  fontWeight: '600',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  minWidth: '140px',
                  justifyContent: 'center',
                  position: 'relative',
                  overflow: 'hidden',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                };

                if (!group.isPerformance) {
                  return {
                    ...baseStyle,
                    background: isSelected
                      ? 'linear-gradient(135deg, rgba(184, 192, 200, 0.25) 0%, rgba(184, 192, 200, 0.15) 100%)'
                      : 'rgba(255,255,255,0.08)',
                    color: isSelected ? '#fff' : 'rgba(255,255,255,0.7)',
                    border: isSelected ? '2px solid var(--primary)' : '2px solid rgba(255,255,255,0.15)',
                    boxShadow: isSelected
                      ? '0 8px 24px rgba(184, 192, 200, 0.3), 0 0 0 1px rgba(184, 192, 200, 0.1) inset'
                      : '0 2px 8px rgba(0,0,0,0.1)',
                    transform: isSelected ? 'translateY(-2px) scale(1.02)' : 'translateY(0) scale(1)'
                  };
                }

                // Use color from database if available, otherwise use defaults
                const activeColor = group.color || 'var(--primary)';

                return {
                  ...baseStyle,
                  background: isSelected
                    ? `linear-gradient(135deg, ${activeColor}25 0%, ${activeColor}15 100%)`
                    : 'linear-gradient(135deg, rgba(30, 30, 30, 0.9) 0%, rgba(20, 20, 20, 0.9) 100%)',
                  color: isSelected ? activeColor : 'rgba(255,255,255,0.85)',
                  border: isSelected
                    ? `2px solid ${activeColor}`
                    : '2px solid rgba(255,255,255,0.2)',
                  boxShadow: isSelected
                    ? `0 8px 32px ${activeColor}40, 0 0 0 1px ${activeColor}20 inset`
                    : '0 4px 12px rgba(0,0,0,0.3)',
                  transform: isSelected ? 'translateY(-3px) scale(1.05)' : 'translateY(0) scale(1)',
                  backdropFilter: 'blur(10px)'
                };
              };

              const getHoverStyle = () => {
                return {
                  transform: selGroup === group.id ? 'translateY(-3px) scale(1.05)' : 'translateY(-2px) scale(1.02)',
                  boxShadow: group.isPerformance
                    ? `0 12px 40px ${group.color || 'var(--primary)'}50`
                    : '0 8px 24px rgba(184, 192, 200, 0.4)'
                };
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
                return <Zap size={18} style={{ filter: 'drop-shadow(0 0 4px currentColor)' }} />;
              };

              return (
                <button
                  key={group.id}
                  style={getGroupStyle()}
                  onClick={() => handleGroup(group.id)}
                  onMouseEnter={(e) => {
                    Object.assign(e.currentTarget.style, getHoverStyle());
                  }}
                  onMouseLeave={(e) => {
                    Object.assign(e.currentTarget.style, getGroupStyle());
                  }}
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
            <option value="">{t('selectModel')}</option>
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
                {e.name}{e.power ? ` ${e.power}${t('hp')}` : ''} - {e.description} ({e.type})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Fuel Type Filter - DISABLED per user request */}
      {/* {selType && engineTypes.length > 1 && (
        <div className="fuel-filter animate-in">
          <label className="selector-label">
            <Zap size={16} />
            <span>{t('fuelType')}</span>
          </label>
          <div className="fuel-buttons">
            <button
              className={`fuel-btn ${!engineType ? 'active' : ''}`}
              onClick={() => { setEngineType(null); setSelEngine(null); }}
            >
              {t('allTypes')}
            </button>
            {engineTypes.map(type => (
              <button
                key={type}
                className={`fuel-btn ${engineType === type ? 'active' : ''}`}
                onClick={() => { setEngineType(type); setSelEngine(null); }}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      )} */}

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

