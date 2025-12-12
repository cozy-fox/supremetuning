'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthContext';
import { useLanguage } from '@/components/LanguageContext';
import Header from '@/components/Header';
import {
  Shield, Database, Key, Save, RefreshCw, AlertCircle, Check, ChevronDown, ChevronUp,
  Download, Upload, Trash2, Car, Archive, Edit2
} from 'lucide-react';
import Toast from '@/components/Toast';
import ConfirmDialog from '@/components/ConfirmDialog';
import EditDialog from '@/components/EditDialog';

export default function AdminPage() {
  const router = useRouter();
  const { isAdmin, isLoading, fetchAPI, logout } = useAuth();
  const { t } = useLanguage();

  // Data editor state
  const [jsonData, setJsonData] = useState('');
  const [dataLoading, setDataLoading] = useState(false);
  const [dataSaving, setDataSaving] = useState(false);
  const [dataMessage, setDataMessage] = useState({ type: '', text: '' });
  const [showDataEditor, setShowDataEditor] = useState(false);

  // Visual editor state - lazy loading approach
  const [showVisualEditor, setShowVisualEditor] = useState(false);
  const [brands, setBrands] = useState([]);
  const [models, setModels] = useState([]);
  const [types, setTypes] = useState([]);
  const [engines, setEngines] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [selectedModel, setSelectedModel] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [selectedEngine, setSelectedEngine] = useState(null);
  const [brandsLoading, setBrandsLoading] = useState(false);
  const [modelsLoading, setModelsLoading] = useState(false);
  const [typesLoading, setTypesLoading] = useState(false);
  const [enginesLoading, setEnginesLoading] = useState(false);

  // Toast notification state
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  // Dialog state
  const [editDialog, setEditDialog] = useState({ show: false, title: '', value: '', onConfirm: null });
  const [deleteDialog, setDeleteDialog] = useState({ show: false, message: '', onConfirm: null });

  // Backup state
  const [showBackups, setShowBackups] = useState(false);
  const [backups, setBackups] = useState([]);
  const [backupLoading, setBackupLoading] = useState(false);
  const [backupMessage, setBackupMessage] = useState({ type: '', text: '' });

  // Credentials state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [credsSaving, setCredsSaving] = useState(false);
  const [credsMessage, setCredsMessage] = useState({ type: '', text: '' });
  const [showCredentials, setShowCredentials] = useState(false);

  // Redirect if not admin
  useEffect(() => {
    if (!isLoading && !isAdmin) {
      router.push('/login');
    }
  }, [isAdmin, isLoading, router]);

  // Toast helpers
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };

  const hideToast = () => {
    setToast({ show: false, message: '', type: '' });
  };

  // Load data
  const loadData = async () => {
    setDataLoading(true);
    setDataMessage({ type: '', text: '' });
    try {
      const data = await fetchAPI('data', { isProtected: true });
      setJsonData(JSON.stringify(data, null, 2));
    } catch (error) {
      setDataMessage({ type: 'error', text: t('failedToLoad') + ': ' + error.message });
    }
    setDataLoading(false);
  };

  // Save data
  const saveData = async () => {
    setDataSaving(true);
    setDataMessage({ type: '', text: '' });
    try {
      const parsedData = JSON.parse(jsonData);
      await fetchAPI('data', {
        method: 'POST',
        isProtected: true,
        body: JSON.stringify(parsedData),
      });
      setDataMessage({ type: 'success', text: t('dataSavedSuccessfully') });
    } catch (error) {
      if (error instanceof SyntaxError) {
        setDataMessage({ type: 'error', text: t('invalidJsonFormat') });
      } else {
        setDataMessage({ type: 'error', text: t('failedToSave') + ': ' + error.message });
      }
    }
    setDataSaving(false);
  };

  // Update credentials
  const updateCredentials = async (e) => {
    e.preventDefault();
    setCredsMessage({ type: '', text: '' });

    if (newPassword !== confirmPassword) {
      setCredsMessage({ type: 'error', text: t('passwordsDoNotMatch') });
      return;
    }

    if (newPassword.length < 6) {
      setCredsMessage({ type: 'error', text: t('passwordTooShort') });
      return;
    }

    setCredsSaving(true);
    try {
      await fetchAPI('auth/update-credentials', {
        method: 'POST',
        isProtected: true,
        body: JSON.stringify({ currentPassword, newUsername, newPassword }),
      });
      setCredsMessage({ type: 'success', text: t('credentialsUpdated') });
      setCurrentPassword('');
      setNewUsername('');
      setNewPassword('');
      setConfirmPassword('');
      // Logout after credential change
      setTimeout(() => {
        logout();
        router.push('/login');
      }, 2000);
    } catch (error) {
      setCredsMessage({ type: 'error', text: error.message });
    }
    setCredsSaving(false);
  };

  // Load brands (called on mount when visual editor is opened)
  const loadBrands = async () => {
    setBrandsLoading(true);
    try {
      const data = await fetchAPI('brands', { isProtected: true });
      console.log('📊 Loaded brands:', data.length);
      setBrands(data);
      setDataMessage({ type: 'success', text: `Loaded ${data.length} brands` });
    } catch (error) {
      setDataMessage({ type: 'error', text: 'Failed to load brands: ' + error.message });
    }
    setBrandsLoading(false);
  };

  // Load models for selected brand
  const loadModels = async (brandId) => {
    setModelsLoading(true);
    setModels([]);
    setTypes([]);
    setEngines([]);
    setSelectedModel(null);
    setSelectedType(null);
    setSelectedEngine(null);
    try {
      const data = await fetchAPI(`models?brandId=${brandId}`, { isProtected: true });
      console.log('📊 Loaded models for brand:', brandId, data.length);
      setModels(data);
    } catch (error) {
      setDataMessage({ type: 'error', text: 'Failed to load models: ' + error.message });
    }
    setModelsLoading(false);
  };

  // Load types for selected model
  const loadTypes = async (modelId) => {
    setTypesLoading(true);
    setTypes([]);
    setEngines([]);
    setSelectedType(null);
    setSelectedEngine(null);
    try {
      const data = await fetchAPI(`types?modelId=${modelId}`, { isProtected: true });
      console.log('📊 Loaded types for model:', modelId, data.length);
      setTypes(data);
    } catch (error) {
      setDataMessage({ type: 'error', text: 'Failed to load types: ' + error.message });
    }
    setTypesLoading(false);
  };

  // Load engines for selected type
  const loadEngines = async (typeId) => {
    setEnginesLoading(true);
    setEngines([]);
    setSelectedEngine(null);
    try {
      const data = await fetchAPI(`engines?typeId=${typeId}`, { isProtected: true });
      console.log('📊 Loaded engines for type:', typeId, data.length);
      setEngines(data);
    } catch (error) {
      setDataMessage({ type: 'error', text: 'Failed to load engines: ' + error.message });
    }
    setEnginesLoading(false);
  };

  // Load brands when visual editor is opened
  useEffect(() => {
    if (showVisualEditor && brands.length === 0) {
      loadBrands();
    }
  }, [showVisualEditor]);

  // Handle brand selection
  const handleBrandSelect = (brand) => {
    setSelectedBrand(brand);
    setSelectedModel(null);
    setSelectedType(null);
    setSelectedEngine(null);
    loadModels(brand.id);
  };

  // Handle model selection
  const handleModelSelect = (model) => {
    setSelectedModel(model);
    setSelectedType(null);
    setSelectedEngine(null);
    loadTypes(model.id);
  };

  // Handle type selection
  const handleTypeSelect = (type) => {
    setSelectedType(type);
    setSelectedEngine(null);
    loadEngines(type.id);
  };

  // Handle engine selection
  const handleEngineSelect = (engine) => {
    setSelectedEngine(engine);
  };

  // Load backup history
  const loadBackups = async () => {
    setBackupLoading(true);
    setBackupMessage({ type: '', text: '' });
    try {
      const backupList = await fetchAPI('backups', { isProtected: true });
      setBackups(backupList);
      setBackupMessage({ type: 'success', text: `Loaded ${backupList.length} backups` });
    } catch (error) {
      setBackupMessage({ type: 'error', text: 'Failed to load backups: ' + error.message });
    }
    setBackupLoading(false);
  };

  // Create manual backup
  const createBackup = async () => {
    setBackupLoading(true);
    setBackupMessage({ type: '', text: '' });
    try {
      await fetchAPI('backups', {
        method: 'POST',
        isProtected: true,
      });
      setBackupMessage({ type: 'success', text: 'Backup created successfully!' });
      await loadBackups(); // Reload backup list
    } catch (error) {
      setBackupMessage({ type: 'error', text: 'Failed to create backup: ' + error.message });
    }
    setBackupLoading(false);
  };

  // Restore from backup
  const restoreBackup = async (backupId) => {
    if (!confirm('Are you sure you want to restore from this backup? Current data will be replaced.')) return;

    setBackupLoading(true);
    setBackupMessage({ type: '', text: '' });
    try {
      await fetchAPI('backups/restore', {
        method: 'POST',
        isProtected: true,
        body: JSON.stringify({ backupId }),
      });
      setBackupMessage({ type: 'success', text: 'Database restored successfully!' });
      // Reload brands if visual editor is open
      if (showVisualEditor) {
        await loadBrands();
        // Reset selections
        setSelectedBrand(null);
        setSelectedModel(null);
        setSelectedType(null);
        setSelectedEngine(null);
        setModels([]);
        setTypes([]);
        setEngines([]);
      }
    } catch (error) {
      setBackupMessage({ type: 'error', text: 'Failed to restore: ' + error.message });
    }
    setBackupLoading(false);
  };

  // Delete backup
  const deleteBackup = async (backupId) => {
    setDeleteDialog({
      show: true,
      message: 'Are you sure you want to delete this backup?',
      onConfirm: () => performDeleteBackup(backupId)
    });
  };

  const performDeleteBackup = async (backupId) => {

    setBackupLoading(true);
    setBackupMessage({ type: '', text: '' });
    try {
      await fetchAPI(`backups?id=${backupId}`, {
        method: 'DELETE',
        isProtected: true,
      });
      setBackupMessage({ type: 'success', text: 'Backup deleted successfully!' });
      await loadBackups(); // Reload backup list
    } catch (error) {
      setBackupMessage({ type: 'error', text: 'Failed to delete: ' + error.message });
    }
    setBackupLoading(false);
  };

  // Download current data as JSON
  const downloadCurrentData = async () => {
    setBackupLoading(true);
    try {
      const data = await fetchAPI('data', { isProtected: true });
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `supreme-tuning-export-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setBackupMessage({ type: 'success', text: 'Data exported successfully!' });
    } catch (error) {
      setBackupMessage({ type: 'error', text: 'Failed to export: ' + error.message });
    }
    setBackupLoading(false);
  };

  // Delete brand (CASCADE: brand → models → types → engines → stages)
  const deleteBrand = async (brandId) => {
    setDeleteDialog({
      show: true,
      message: 'Are you sure you want to delete this brand and ALL its data (models, types, engines, stages)?',
      onConfirm: () => performDeleteBrand(brandId)
    });
  };

  const performDeleteBrand = async (brandId) => {
    try {
      await fetchAPI(`admin/brand?id=${brandId}`, {
        method: 'DELETE',
        isProtected: true,
      });

      // Remove from local state
      setBrands(brands.filter(b => b.id !== brandId));
      setSelectedBrand(null);
      setSelectedModel(null);
      setSelectedType(null);
      setSelectedEngine(null);
      setModels([]);
      setTypes([]);
      setEngines([]);

      setDataMessage({ type: 'success', text: 'Brand and all related data deleted successfully' });
      showToast('Brand deleted successfully', 'success');
    } catch (error) {
      setDataMessage({ type: 'error', text: 'Failed to delete: ' + error.message });
      showToast('Failed to delete: ' + error.message, 'error');
    }
  };

  // Delete model (CASCADE: model → types → engines → stages)
  const deleteModel = async (modelId) => {
    setDeleteDialog({
      show: true,
      message: 'Are you sure you want to delete this model and ALL its data (types, engines, stages)?',
      onConfirm: () => performDeleteModel(modelId)
    });
  };

  const performDeleteModel = async (modelId) => {
    try {
      await fetchAPI(`admin/model?id=${modelId}`, {
        method: 'DELETE',
        isProtected: true,
      });

      // Remove from local state
      setModels(models.filter(m => m.id !== modelId));
      setSelectedModel(null);
      setSelectedType(null);
      setSelectedEngine(null);
      setTypes([]);
      setEngines([]);

      setDataMessage({ type: 'success', text: 'Model and all related data deleted successfully' });
      showToast('Model deleted successfully', 'success');
    } catch (error) {
      setDataMessage({ type: 'error', text: 'Failed to delete: ' + error.message });
    }
  };

  // Delete type/generation (CASCADE: type → engines → stages)
  const deleteType = async (typeId) => {
    setDeleteDialog({
      show: true,
      message: 'Are you sure you want to delete this generation and ALL its data (engines, stages)?',
      onConfirm: () => performDeleteType(typeId)
    });
  };

  const performDeleteType = async (typeId) => {
    try {
      await fetchAPI(`admin/type?id=${typeId}`, {
        method: 'DELETE',
        isProtected: true,
      });

      // Remove from local state
      setTypes(types.filter(t => t.id !== typeId));
      setSelectedType(null);
      setSelectedEngine(null);
      setEngines([]);

      setDataMessage({ type: 'success', text: 'Generation and all related data deleted successfully' });
      showToast('Generation deleted successfully', 'success');
    } catch (error) {
      setDataMessage({ type: 'error', text: 'Failed to delete: ' + error.message });
    }
  };

  // Delete engine (CASCADE: engine → stages)
  const deleteEngine = async (engineId) => {
    setDeleteDialog({
      show: true,
      message: 'Are you sure you want to delete this engine and ALL its stages?',
      onConfirm: () => performDeleteEngine(engineId)
    });
  };

  const performDeleteEngine = async (engineId) => {
    try {
      await fetchAPI(`admin/engine?id=${engineId}`, {
        method: 'DELETE',
        isProtected: true,
      });

      // Remove from local state
      setEngines(engines.filter(e => e.id !== engineId));
      setSelectedEngine(null);

      setDataMessage({ type: 'success', text: 'Engine and all stages deleted successfully' });
      showToast('Engine deleted successfully', 'success');
    } catch (error) {
      setDataMessage({ type: 'error', text: 'Failed to delete: ' + error.message });
    }
  };

  // Rename brand
  const renameBrand = (brandId, currentName) => {
    setEditDialog({
      show: true,
      title: 'Rename Brand',
      value: currentName,
      onConfirm: (newName) => performRenameBrand(brandId, newName)
    });
  };

  const performRenameBrand = async (brandId, newName) => {
    if (!newName || newName.trim() === '') return;

    try {
      await fetchAPI('admin/brand', {
        method: 'PUT',
        isProtected: true,
        body: JSON.stringify({ id: brandId, name: newName.trim() }),
      });

      // Update local state
      setBrands(brands.map(b =>
        b.id === brandId
          ? { ...b, name: newName.trim(), slug: newName.toLowerCase().replace(/\s+/g, '-') }
          : b
      ));

      // Update selected brand if it's the one being renamed
      if (selectedBrand?.id === brandId) {
        setSelectedBrand({ ...selectedBrand, name: newName.trim(), slug: newName.toLowerCase().replace(/\s+/g, '-') });
      }

      setDataMessage({ type: 'success', text: 'Brand renamed successfully' });
      showToast('Brand renamed successfully', 'success');
    } catch (error) {
      setDataMessage({ type: 'error', text: 'Failed to rename: ' + error.message });
    }
  };

  // Rename model
  const renameModel = (modelId, currentName) => {
    setEditDialog({
      show: true,
      title: 'Rename Model',
      value: currentName,
      onConfirm: (newName) => performRenameModel(modelId, newName)
    });
  };

  const performRenameModel = async (modelId, newName) => {
    if (!newName || newName.trim() === '') return;

    try {
      await fetchAPI('admin/model', {
        method: 'PUT',
        isProtected: true,
        body: JSON.stringify({ id: modelId, name: newName.trim() }),
      });

      // Update local state
      setModels(models.map(m =>
        m.id === modelId
          ? { ...m, name: newName.trim(), slug: newName.toLowerCase().replace(/\s+/g, '-') }
          : m
      ));

      // Update selected model if it's the one being renamed
      if (selectedModel?.id === modelId) {
        setSelectedModel({ ...selectedModel, name: newName.trim(), slug: newName.toLowerCase().replace(/\s+/g, '-') });
      }

      setDataMessage({ type: 'success', text: 'Model renamed successfully' });
      showToast('Model renamed successfully', 'success');
    } catch (error) {
      setDataMessage({ type: 'error', text: 'Failed to rename: ' + error.message });
    }
  };

  // Rename type/generation
  const renameType = (typeId, currentName) => {
    setEditDialog({
      show: true,
      title: 'Rename Generation',
      value: currentName,
      onConfirm: (newName) => performRenameType(typeId, newName)
    });
  };

  const performRenameType = async (typeId, newName) => {
    if (!newName || newName.trim() === '') return;

    try {
      await fetchAPI('admin/type', {
        method: 'PUT',
        isProtected: true,
        body: JSON.stringify({ id: typeId, name: newName.trim() }),
      });

      // Update local state
      setTypes(types.map(t =>
        t.id === typeId
          ? { ...t, name: newName.trim(), slug: newName.toLowerCase().replace(/\s+/g, '-') }
          : t
      ));

      // Update selected type if it's the one being renamed
      if (selectedType?.id === typeId) {
        setSelectedType({ ...selectedType, name: newName.trim(), slug: newName.toLowerCase().replace(/\s+/g, '-') });
      }

      setDataMessage({ type: 'success', text: 'Generation renamed successfully' });
      showToast('Generation renamed successfully', 'success');
    } catch (error) {
      setDataMessage({ type: 'error', text: 'Failed to rename: ' + error.message });
    }
  };

  // Rename engine
  const renameEngine = (engineId, currentName) => {
    setEditDialog({
      show: true,
      title: 'Rename Engine',
      value: currentName,
      onConfirm: (newName) => performRenameEngine(engineId, newName)
    });
  };

  const performRenameEngine = async (engineId, newName) => {
    if (!newName || newName.trim() === '') return;

    try {
      await fetchAPI('admin/engine', {
        method: 'PUT',
        isProtected: true,
        body: JSON.stringify({ id: engineId, name: newName.trim() }),
      });

      // Update local state
      setEngines(engines.map(e =>
        e.id === engineId
          ? { ...e, name: newName.trim(), slug: newName.toLowerCase().replace(/\s+/g, '-') }
          : e
      ));

      // Update selected engine if it's the one being renamed
      if (selectedEngine?.id === engineId) {
        setSelectedEngine({ ...selectedEngine, name: newName.trim(), slug: newName.toLowerCase().replace(/\s+/g, '-') });
      }

      setDataMessage({ type: 'success', text: 'Engine renamed successfully' });
      showToast('Engine renamed successfully', 'success');
    } catch (error) {
      setDataMessage({ type: 'error', text: 'Failed to rename: ' + error.message });
    }
  };

  if (isLoading) {
    return (
      <>
        <Header />
        <main className="container" style={{ padding: '60px 24px', textAlign: 'center' }}>
          <p>{t('loading')}</p>
        </main>
      </>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <>
      <Header />
      <main className="container" style={{ padding: '40px 24px', maxWidth: '1200px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{
            background: 'linear-gradient(135deg, #a8b0b8 0%, #d0d8e0 100%)',
            borderRadius: '50%',
            width: '64px',
            height: '64px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
          }}>
            <Shield size={32} color="#1a1a1a" />
          </div>
          <h1>{t('adminDashboard')}</h1>
          <p style={{ color: 'var(--text-muted)' }}>{t('manageDatabaseAndCredentials')}</p>
        </div>

        {/* Backup Section */}
        <BackupSection
          t={t}
          showBackups={showBackups}
          setShowBackups={setShowBackups}
          backups={backups}
          backupLoading={backupLoading}
          backupMessage={backupMessage}
          loadBackups={loadBackups}
          createBackup={createBackup}
          restoreBackup={restoreBackup}
          deleteBackup={deleteBackup}
          downloadCurrentData={downloadCurrentData}
        />

        {/* Visual Editor Section */}
        <VisualEditorSection
          showVisualEditor={showVisualEditor}
          setShowVisualEditor={setShowVisualEditor}
          brands={brands}
          models={models}
          types={types}
          engines={engines}
          brandsLoading={brandsLoading}
          modelsLoading={modelsLoading}
          typesLoading={typesLoading}
          enginesLoading={enginesLoading}
          dataMessage={dataMessage}
          deleteBrand={deleteBrand}
          deleteModel={deleteModel}
          deleteType={deleteType}
          deleteEngine={deleteEngine}
          renameBrand={renameBrand}
          renameModel={renameModel}
          renameType={renameType}
          renameEngine={renameEngine}
          selectedBrand={selectedBrand}
          handleBrandSelect={handleBrandSelect}
          selectedModel={selectedModel}
          handleModelSelect={handleModelSelect}
          selectedType={selectedType}
          handleTypeSelect={handleTypeSelect}
          selectedEngine={selectedEngine}
          handleEngineSelect={handleEngineSelect}
        />

        {/* Data Editor Section
        <DataEditorSection
          t={t}
          showDataEditor={showDataEditor}
          setShowDataEditor={setShowDataEditor}
          jsonData={jsonData}
          setJsonData={setJsonData}
          dataLoading={dataLoading}
          dataSaving={dataSaving}
          dataMessage={dataMessage}
          loadData={loadData}
          saveData={saveData}
        /> */}

        {/* Credentials Section */}
        <CredentialsSection
          t={t}
          showCredentials={showCredentials}
          setShowCredentials={setShowCredentials}
          currentPassword={currentPassword}
          setCurrentPassword={setCurrentPassword}
          newUsername={newUsername}
          setNewUsername={setNewUsername}
          newPassword={newPassword}
          setNewPassword={setNewPassword}
          confirmPassword={confirmPassword}
          setConfirmPassword={setConfirmPassword}
          credsSaving={credsSaving}
          credsMessage={credsMessage}
          updateCredentials={updateCredentials}
        />
      </main>

      {/* Toast Notification */}
      <Toast 
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={hideToast}
      />

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        show={deleteDialog.show}
        message={deleteDialog.message}
        onConfirm={() => {
          if (deleteDialog.onConfirm) deleteDialog.onConfirm();
          setDeleteDialog({ show: false, message: '', onConfirm: null });
        }}
        onCancel={() => setDeleteDialog({ show: false, message: '', onConfirm: null })}
      />

      {/* Edit Dialog */}
      <EditDialog
        show={editDialog.show}
        title={editDialog.title}
        value={editDialog.value}
        onConfirm={(newValue) => {
          if (editDialog.onConfirm) editDialog.onConfirm(newValue);
          setEditDialog({ show: false, title: '', value: '', onConfirm: null });
        }}
        onCancel={() => setEditDialog({ show: false, title: '', value: '', onConfirm: null })}
      />
    </>
  );
}

// Backup Section Component
function BackupSection({
  t, showBackups, setShowBackups, backups, backupLoading, backupMessage,
  loadBackups, createBackup, restoreBackup, deleteBackup, downloadCurrentData
}) {
  return (
    <div className="card" style={{ marginBottom: '24px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer',
          padding: '8px 0'
        }}
        onClick={() => setShowBackups(!showBackups)}
      >
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: 0 }}>
          <Archive size={24} color="#a8b0b8" />
          Backup & Restore (MongoDB)
        </h3>
        {showBackups ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
      </div>

      {showBackups && (
        <div style={{ marginTop: '24px' }}>
          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
            <button
              onClick={loadBackups}
              disabled={backupLoading}
              className="btn"
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <RefreshCw size={16} className={backupLoading ? 'spin' : ''} />
              {backupLoading ? 'Loading...' : 'Load Backups'}
            </button>
            <button
              onClick={createBackup}
              disabled={backupLoading}
              className="btn btn-search"
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <Save size={16} />
              Create Backup
            </button>
            <button
              onClick={downloadCurrentData}
              disabled={backupLoading}
              className="btn"
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <Download size={16} />
              Export to JSON
            </button>
          </div>

          {/* Message */}
          {backupMessage.text && (
            <div style={{
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '20px',
              background: backupMessage.type === 'error'
                ? 'rgba(255, 68, 68, 0.1)'
                : 'rgba(0, 255, 136, 0.1)',
              border: `1px solid ${backupMessage.type === 'error' ? 'rgba(255, 68, 68, 0.3)' : 'rgba(0, 255, 136, 0.3)'}`,
              color: backupMessage.type === 'error' ? '#ff4444' : '#00ff88',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              {backupMessage.type === 'error' ? <AlertCircle size={16} /> : <Check size={16} />}
              {backupMessage.text}
            </div>
          )}

          {/* Backup History */}
          {backups.length > 0 && (
            <div>
              <h4 style={{ marginBottom: '16px', fontSize: '0.95rem', color: 'var(--primary)' }}>
                Backup History ({backups.length})
              </h4>
              <div style={{
                maxHeight: '400px',
                overflowY: 'auto',
                background: 'rgba(50, 55, 60, 0.3)',
                borderRadius: '8px',
                padding: '12px'
              }}>
                {backups.map((backup, index) => (
                  <div
                    key={backup.id}
                    style={{
                      padding: '12px',
                      marginBottom: '8px',
                      background: 'rgba(255,255,255,0.05)',
                      borderRadius: '6px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      border: '1px solid rgba(255,255,255,0.1)'
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.9rem', fontWeight: '500', marginBottom: '4px' }}>
                        Backup #{backups.length - index}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {new Date(backup.timestamp).toLocaleString()}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => restoreBackup(backup.id)}
                        disabled={backupLoading}
                        className="btn"
                        style={{
                          padding: '6px 12px',
                          fontSize: '0.8rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <Upload size={14} />
                        Restore
                      </button>
                      <button
                        onClick={() => deleteBackup(backup.id)}
                        disabled={backupLoading}
                        style={{
                          background: 'none',
                          border: '1px solid #ff4444',
                          color: '#ff4444',
                          cursor: 'pointer',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          fontSize: '0.8rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {backups.length === 0 && !backupLoading && (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px' }}>
              No backups found. Click "Load Backups" to refresh or "Create Backup" to create one.
            </p>
          )}

          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
            💡 <strong>Tip:</strong> Backups are automatically created before any data changes. You can also create manual backups and restore from any point in history.
          </p>
        </div>
      )}
    </div>
  );
}

// Visual Editor Section Component
function VisualEditorSection({
  showVisualEditor, setShowVisualEditor,
  brands, models, types, engines,
  brandsLoading, modelsLoading, typesLoading, enginesLoading,
  dataMessage,
  deleteBrand, deleteModel, deleteType, deleteEngine,
  renameBrand, renameModel, renameType, renameEngine,
  selectedBrand, handleBrandSelect,
  selectedModel, handleModelSelect,
  selectedType, handleTypeSelect,
  selectedEngine, handleEngineSelect
}) {
  return (
    <div className="card" style={{ marginBottom: '24px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer',
          padding: '8px 0'
        }}
        onClick={() => setShowVisualEditor(!showVisualEditor)}
      >
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: 0 }}>
          <Car size={24} color="#a8b0b8" />
          Data Manager
        </h3>
        {showVisualEditor ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
      </div>

      {showVisualEditor && (
        <div style={{ marginTop: '20px' }}>
          {dataMessage.text && (
            <div style={{
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '16px',
              background: dataMessage.type === 'error'
                ? 'rgba(255, 68, 68, 0.1)'
                : 'rgba(0, 255, 136, 0.1)',
              border: `1px solid ${dataMessage.type === 'error' ? 'rgba(255, 68, 68, 0.3)' : 'rgba(0, 255, 136, 0.3)'}`,
              color: dataMessage.type === 'error' ? '#ff4444' : '#00ff88',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              {dataMessage.type === 'error' ? <AlertCircle size={16} /> : <Check size={16} />}
              {dataMessage.text}
            </div>
          )}

          {brandsLoading ? (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <RefreshCw size={24} className="spin" />
              <p>Loading brands...</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
              {/* Brands List */}
              <div style={{ background: 'rgba(50, 55, 60, 0.3)', borderRadius: '8px', padding: '16px' }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '0.9rem', color: 'var(--primary)' }}>
                  Brands ({brands?.length || 0})
                </h4>
                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  {brands?.map(brand => (
                    <div
                      key={brand.id}
                      style={{
                        padding: '8px',
                        marginBottom: '4px',
                        background: selectedBrand?.id === brand.id ? 'rgba(184, 192, 200, 0.2)' : 'rgba(255,255,255,0.05)',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                      onClick={() => handleBrandSelect(brand)}
                    >
                      <span style={{ fontSize: '0.85rem', flex: 1 }}>{brand.name}</span>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            renameBrand(brand.id, brand.name);
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#00ff88',
                            cursor: 'pointer',
                            padding: '4px'
                          }}
                          title="Rename brand"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteBrand(brand.id);
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#ff4444',
                            cursor: 'pointer',
                            padding: '4px'
                          }}
                          title="Delete brand"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Models List */}
              {selectedBrand && (
                <div style={{ background: 'rgba(50, 55, 60, 0.3)', borderRadius: '8px', padding: '16px' }}>
                  <h4 style={{ margin: '0 0 12px 0', fontSize: '0.9rem', color: 'var(--primary)' }}>
                    Models - {selectedBrand.name} ({models?.length || 0})
                  </h4>
                  {modelsLoading ? (
                    <div style={{ textAlign: 'center', padding: '20px' }}>
                      <RefreshCw size={16} className="spin" />
                    </div>
                  ) : (
                    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                      {models?.map(model => (
                      <div
                        key={model.id}
                        style={{
                          padding: '8px',
                          marginBottom: '4px',
                          background: selectedModel?.id === model.id ? 'rgba(184, 192, 200, 0.2)' : 'rgba(255,255,255,0.05)',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                        onClick={() => handleModelSelect(model)}
                      >
                        <span style={{ fontSize: '0.85rem', flex: 1 }}>{model.name}</span>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              renameModel(model.id, model.name);
                            }}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#00ff88',
                              cursor: 'pointer',
                              padding: '4px'
                            }}
                            title="Rename model"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteModel(model.id);
                            }}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#ff4444',
                              cursor: 'pointer',
                              padding: '4px'
                            }}
                            title="Delete model"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  )}
                </div>
              )}

              {/* Types/Generations List */}
              {selectedModel && (
                <div style={{ background: 'rgba(50, 55, 60, 0.3)', borderRadius: '8px', padding: '16px' }}>
                  <h4 style={{ margin: '0 0 12px 0', fontSize: '0.9rem', color: 'var(--primary)' }}>
                    Generations - {selectedModel.name} ({types?.length || 0})
                  </h4>
                  {typesLoading ? (
                    <div style={{ textAlign: 'center', padding: '20px' }}>
                      <RefreshCw size={16} className="spin" />
                    </div>
                  ) : (
                    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                      {types?.map(type => (
                        <div
                          key={type.id}
                          style={{
                            padding: '8px',
                            marginBottom: '4px',
                            background: selectedType?.id === type.id ? 'rgba(184, 192, 200, 0.2)' : 'rgba(255,255,255,0.05)',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}
                          onClick={() => handleTypeSelect(type)}
                        >
                        <span style={{ fontSize: '0.85rem', flex: 1 }}>{type.name}</span>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              renameType(type.id, type.name);
                            }}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#00ff88',
                              cursor: 'pointer',
                              padding: '4px'
                            }}
                            title="Rename generation"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteType(type.id);
                            }}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#ff4444',
                              cursor: 'pointer',
                              padding: '4px'
                            }}
                            title="Delete generation"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Engines List */}
              {selectedType && (
                <div style={{ background: 'rgba(50, 55, 60, 0.3)', borderRadius: '8px', padding: '16px' }}>
                  <h4 style={{ margin: '0 0 12px 0', fontSize: '0.9rem', color: 'var(--primary)' }}>
                    Engines - {selectedType.name} ({engines?.length || 0})
                  </h4>
                  {enginesLoading ? (
                    <div style={{ textAlign: 'center', padding: '20px' }}>
                      <RefreshCw size={16} className="spin" />
                    </div>
                  ) : (
                    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                      {engines?.map(engine => (
                        <div
                          key={engine.id}
                          style={{
                            padding: '8px',
                            marginBottom: '4px',
                            background: selectedEngine?.id === engine.id ? 'rgba(184, 192, 200, 0.2)' : 'rgba(255,255,255,0.05)',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}
                          onClick={() => handleEngineSelect(engine)}
                        >
                        <div style={{ fontSize: '0.85rem', flex: 1 }}>
                          <div>{engine.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {engine.power}hp • {engine.type}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              renameEngine(engine.id, engine.name);
                            }}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#00ff88',
                              cursor: 'pointer',
                              padding: '4px'
                            }}
                            title="Rename engine"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteEngine(engine.id);
                            }}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#ff4444',
                              cursor: 'pointer',
                              padding: '4px'
                            }}
                            title="Delete engine"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Data Editor Section Component
// function DataEditorSection({
//   t, showDataEditor, setShowDataEditor, jsonData, setJsonData,
//   dataLoading, dataSaving, dataMessage, loadData, saveData
// }) {
//   return (
//     <div className="card" style={{ marginBottom: '24px' }}>
//       <div
//         style={{
//           display: 'flex',
//           justifyContent: 'space-between',
//           alignItems: 'center',
//           cursor: 'pointer',
//           padding: '8px 0'
//         }}
//         onClick={() => setShowDataEditor(!showDataEditor)}
//       >
//         <h3 style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: 0 }}>
//           <Database size={24} color="#a8b0b8" />
//           "JSON Editor"
//         </h3>
//         {showDataEditor ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
//       </div>
// {/* 
//       {showDataEditor && (
//         <div style={{ marginTop: '20px' }}>
//           <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
//             <button
//               onClick={loadData}
//               disabled={dataLoading}
//               className="btn"
//               style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
//             >
//               <RefreshCw size={16} className={dataLoading ? 'spin' : ''} />
//               {dataLoading ? t('loading') : t('loadData')}
//             </button>
//             <button
//               onClick={saveData}
//               disabled={dataSaving || !jsonData}
//               className="btn btn-search"
//               style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
//             >
//               <Save size={16} />
//               {dataSaving ? t('saving') : t('saveData')}
//             </button>
//           </div>

//           {dataMessage.text && (
//             <div style={{
//               padding: '12px',
//               borderRadius: '8px',
//               marginBottom: '16px',
//               background: dataMessage.type === 'error'
//                 ? 'rgba(255, 68, 68, 0.1)'
//                 : 'rgba(0, 255, 136, 0.1)',
//               border: `1px solid ${dataMessage.type === 'error' ? 'rgba(255, 68, 68, 0.3)' : 'rgba(0, 255, 136, 0.3)'}`,
//               color: dataMessage.type === 'error' ? '#ff4444' : '#00ff88',
//               display: 'flex',
//               alignItems: 'center',
//               gap: '8px'
//             }}>
//               {dataMessage.type === 'error' ? <AlertCircle size={16} /> : <Check size={16} />}
//               {dataMessage.text}
//             </div>
//           )}

//           <textarea
//             value={jsonData}
//             onChange={(e) => setJsonData(e.target.value)}
//             placeholder={t('loadDataPlaceholder')}
//             style={{
//               width: '100%',
//               minHeight: '400px',
//               fontFamily: 'monospace',
//               fontSize: '12px',
//               background: 'rgba(50, 55, 60, 0.5)',
//               border: '1px solid var(--border)',
//               borderRadius: '8px',
//               padding: '16px',
//               color: 'var(--text-main)',
//               resize: 'vertical'
//             }}
//           />
//           <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
//             {t('jsonWarning')}
//           </p>
//         </div>
//       )} */}
//     </div>
//   );
// }

// Credentials Section Component
function CredentialsSection({
  t, showCredentials, setShowCredentials,
  currentPassword, setCurrentPassword,
  newUsername, setNewUsername,
  newPassword, setNewPassword,
  confirmPassword, setConfirmPassword,
  credsSaving, credsMessage, updateCredentials
}) {
  return (
    <div className="card">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer',
          padding: '8px 0'
        }}
        onClick={() => setShowCredentials(!showCredentials)}
      >
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: 0 }}>
          <Key size={24} color="#a8b0b8" />
          {t('updateCredentials')}
        </h3>
        {showCredentials ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
      </div>

      {showCredentials && (
        <form onSubmit={updateCredentials} style={{ marginTop: '20px' }}>
          <div style={{ marginBottom: '16px' }}>
            <label>{t('currentPassword')}</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label>{t('newUsername')}</label>
            <input
              type="text"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              required
              minLength={3}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label>{t('newPassword')}</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label>{t('confirmNewPassword')}</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          {credsMessage.text && (
            <div style={{
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '16px',
              background: credsMessage.type === 'error'
                ? 'rgba(255, 68, 68, 0.1)'
                : 'rgba(0, 255, 136, 0.1)',
              border: `1px solid ${credsMessage.type === 'error' ? 'rgba(255, 68, 68, 0.3)' : 'rgba(0, 255, 136, 0.3)'}`,
              color: credsMessage.type === 'error' ? '#ff4444' : '#00ff88',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              {credsMessage.type === 'error' ? <AlertCircle size={16} /> : <Check size={16} />}
              {credsMessage.text}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-search"
            disabled={credsSaving}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Key size={16} />
            {credsSaving ? t('updating') : t('updateCredentials')}
          </button>
        </form>
      )}
    </div>
  );
}
