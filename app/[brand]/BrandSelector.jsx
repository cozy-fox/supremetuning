'use client';

import { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthContext';
import { useLanguage } from '@/components/LanguageContext';
import { Search, Car, Settings, Gauge, ChevronRight } from 'lucide-react';

export default function BrandSelector({ brand, models }) {
  const router = useRouter();
  const { fetchAPI } = useAuth();
  const { t } = useLanguage();

  const [types, setTypes] = useState([]);
  const [engines, setEngines] = useState([]);

  const [selModel, setSelModel] = useState(null);
  const [selType, setSelType] = useState(null);
  const [selEngine, setSelEngine] = useState(null);
  // const [engineType, setEngineType] = useState(null); // Fuel type filter disabled
  const [loading, setLoading] = useState(false);

  const handleModel = useCallback(async (e) => {
    const modelId = parseInt(e.target.value);
    const model = models.find(m => m.id === modelId);
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
  }, [models, fetchAPI]);

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
            disabled={loading}
            className="selector-select"
          >
            <option value="">{t('selectModel')}</option>
            {models.map(m => (
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

