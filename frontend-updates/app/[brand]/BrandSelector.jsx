'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/components/LanguageContext';
import { Search, Car, Settings, Gauge, ChevronRight, Zap } from 'lucide-react';

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
                  if (groupName === 'RS') return '#ff0000';
                  if (groupName === 'M') return '#0066cc';
                  if (groupName === 'AMG') return '#00d4aa';
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
                if (groupName === 'RS') return '🏁';
                if (groupName === 'M') return '🏎️';
                if (groupName === 'AMG') return '⚡';
                return null;
              };

              const getGroupColor = () => {
                // Use color from database if available
                if (group.color) return group.color;
                const groupName = (group.name || '').toUpperCase();
                if (groupName === 'RS') return '#ff0000';
                if (groupName === 'M') return '#0066cc';
                if (groupName === 'AMG') return '#00d4aa';
                return 'var(--primary)';
              };

              return (
                <button
                  key={group.id}
                  style={getGroupStyle()}
                  onClick={() => handleGroup(group.id)}
                >
                  {group.isPerformance && <span style={{ fontSize: '1.2rem' }}>{getGroupIcon()}</span>}
                  {group.isPerformance && <Zap size={16} />}
                  <span>{group.displayName || group.name}</span>
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
                {e.name}{e.power ? ` ${e.power}${t('enginePowerUnit')}` : ''} - {e.description} ({e.type})
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
