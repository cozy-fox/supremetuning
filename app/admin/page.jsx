'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthContext';
import { useLanguage } from '@/components/LanguageContext';
import { useProgress } from '@/components/ProgressContext';
import Header from '@/components/Header';
import {
  Shield, Key, RefreshCw, AlertCircle, Check, ChevronDown, ChevronUp,
  Trash2, Car, Edit2, Plus, MoveRight, DollarSign, Eye, EyeOff
} from 'lucide-react';
import Toast from '@/components/Toast';
import ConfirmDialog from '@/components/ConfirmDialog';
import EditDialog from '@/components/EditDialog';
import AddEngineDialog from '@/components/AddEngineDialog';
import AddGroupDialog from '@/components/AddGroupDialog';
import EditGroupDialog from '@/components/EditGroupDialog';
import BulkUpdateDialog from '@/components/BulkUpdateDialog';
import BackupSection from '@/components/BackupSection';

export default function AdminPage() {
  const router = useRouter();
  const { isAdmin, isLoading, fetchAPI, logout } = useAuth();
  const { t } = useLanguage();
  const { withProgress, startOperation, endOperation } = useProgress();

  // Data editor state
  const [jsonData, setJsonData] = useState('');
  const [dataLoading, setDataLoading] = useState(false);
  const [dataSaving, setDataSaving] = useState(false);
  const [dataMessage, setDataMessage] = useState({ type: '', text: '' });
  const [showDataEditor, setShowDataEditor] = useState(false);

  // Visual editor state - lazy loading approach
  const [showVisualEditor, setShowVisualEditor] = useState(false);
  const [brands, setBrands] = useState([]);
  const [groups, setGroups] = useState([]);
  const [models, setModels] = useState([]);
  const [types, setTypes] = useState([]);
  const [engines, setEngines] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedModel, setSelectedModel] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [selectedEngine, setSelectedEngine] = useState(null);
  const [brandsLoading, setBrandsLoading] = useState(false);
  const [groupsLoading, setGroupsLoading] = useState(false);
  const [modelsLoading, setModelsLoading] = useState(false);
  const [typesLoading, setTypesLoading] = useState(false);
  const [enginesLoading, setEnginesLoading] = useState(false);

  // Toast notification state
  const [toast, setToast] = useState({ show: false, message: '', type: '' });

  // Dialog state
  const [editDialog, setEditDialog] = useState({ show: false, title: '', value: '', onConfirm: null });
  const [deleteDialog, setDeleteDialog] = useState({ show: false, message: '', onConfirm: null });
  const [confirmDialog, setConfirmDialog] = useState({ show: false, message: '', onConfirm: null, confirmText: 'Confirm' });
  const [moveDialog, setMoveDialog] = useState({ show: false, itemType: '', itemId: null, itemName: '', targets: [] });
  const [addEngineDialog, setAddEngineDialog] = useState({ show: false });
  const [addGroupDialog, setAddGroupDialog] = useState({ show: false });
  const [editGroupDialog, setEditGroupDialog] = useState({ show: false, groupData: null });
  const [bulkUpdateDialog, setBulkUpdateDialog] = useState({ show: false });

  // Global operation loading state to prevent multiple simultaneous operations
  const [operationInProgress, setOperationInProgress] = useState(false);

  // Backup state
  const [showBackups, setShowBackups] = useState(false);
  const [backups, setBackups] = useState([]);
  const [fullBackups, setFullBackups] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [backupLoading, setBackupLoading] = useState(false);
  const [backupMessage, setBackupMessage] = useState({ type: '', text: '' });
  const [showAuditLogs, setShowAuditLogs] = useState(false);

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

  // Load groups for selected brand
  const loadGroups = async (brandId) => {
    setGroupsLoading(true);
    setGroups([]);
    setModels([]);
    setTypes([]);
    setEngines([]);
    setSelectedGroup(null);
    setSelectedModel(null);
    setSelectedType(null);
    setSelectedEngine(null);
    try {
      const data = await fetchAPI(`groups?brandId=${brandId}`, { isProtected: true });
      console.log('📊 Loaded groups for brand:', brandId, data.length);
      setGroups(data);
    } catch (error) {
      setDataMessage({ type: 'error', text: 'Failed to load groups: ' + error.message });
    }
    setGroupsLoading(false);
  };

  // Load models for selected brand or group
  const loadModels = async (brandId, groupId = null) => {
    setModelsLoading(true);
    setModels([]);
    setTypes([]);
    setEngines([]);
    setSelectedModel(null);
    setSelectedType(null);
    setSelectedEngine(null);
    try {
      const url = groupId
        ? `models?groupId=${groupId}`
        : `models?brandId=${brandId}`;
      const data = await fetchAPI(url, { isProtected: true });
      console.log('📊 Loaded models:', data.length);
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
    setSelectedGroup(null);
    setSelectedModel(null);
    setSelectedType(null);
    setSelectedEngine(null);
    loadGroups(brand.id);
  };

  // Handle group selection
  const handleGroupSelect = (group) => {
    setSelectedGroup(group);
    setSelectedModel(null);
    setSelectedType(null);
    setSelectedEngine(null);
    loadModels(selectedBrand.id, group.id);
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

  // Handle engine selection - navigate to results page
  const handleEngineSelect = async (engine) => {
    setSelectedEngine(engine);

    // Navigate to the engine's results page
    try {
      // Get the type, model, and brand information
      const type = types.find(t => t.id === engine.typeId);
      const model = models.find(m => m.id === type?.modelId);
      const brand = brands.find(b => b.id === model?.brandId);

      if (brand && model && type) {
        const url = `/${brand.name.toLowerCase()}/${encodeURIComponent(model.name)}/${encodeURIComponent(type.name)}/${engine.id}`;
        router.push(url);
      }
    } catch (error) {
      console.error('Failed to navigate to engine page:', error);
    }
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
    setConfirmDialog({
      show: true,
      message: t('confirmCreateBackup') || 'Create a backup of the current database? This will save all brands, models, engines, and stages.',
      confirmText: t('createBackup') || 'Create Backup',
      onConfirm: () => performCreateBackup()
    });
  };

  const performCreateBackup = async () => {
    setConfirmDialog({ show: false, message: '', onConfirm: null, confirmText: t('confirm') || 'Confirm' });
    setBackupLoading(true);
    setBackupMessage({ type: '', text: '' });
    try {
      await fetchAPI('backups', {
        method: 'POST',
        isProtected: true,
      });
      setBackupMessage({ type: 'success', text: 'Backup created successfully!' });
      showToast('Backup created successfully!', 'success');
      await loadBackups(); // Reload backup list
    } catch (error) {
      console.error('Backup creation error:', error);
      setBackupMessage({ type: 'error', text: 'Failed to create backup: ' + error.message });
      showToast('Failed to create backup: ' + error.message, 'error');
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
      message: t('confirmDeleteBackup') || 'Are you sure you want to delete this backup?',
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

  // Load full backups (new system)
  const loadFullBackups = async () => {
    setBackupLoading(true);
    setBackupMessage({ type: '', text: '' });
    try {
      const response = await fetchAPI('admin/backup/full', { isProtected: true });
      setFullBackups(response.backups || []);
      setBackupMessage({ type: 'success', text: `Loaded ${response.backups.length} full backups` });
    } catch (error) {
      setBackupMessage({ type: 'error', text: 'Failed to load full backups: ' + error.message });
    }
    setBackupLoading(false);
  };

  // Load audit logs
  const loadAuditLogs = async (limit = 100) => {
    setBackupLoading(true);
    try {
      const response = await fetchAPI(`admin/backup/audit?limit=${limit}`, { isProtected: true });
      setAuditLogs(response.logs || []);
    } catch (error) {
      setBackupMessage({ type: 'error', text: 'Failed to load audit logs: ' + error.message });
    }
    setBackupLoading(false);
  };

  // Create full backup with progress tracking
  const createFullBackup = async () => {
    setConfirmDialog({
      show: true,
      message: t('confirmCreateFullBackup') || 'Create a full database backup? This will create a complete snapshot using MongoDB utilities.',
      confirmText: t('createFullBackup') || 'Create Full Backup',
      onConfirm: () => performCreateFullBackup()
    });
  };

  const performCreateFullBackup = async () => {
    setConfirmDialog({ show: false, message: '', onConfirm: null, confirmText: t('confirm') || 'Confirm' });
    try {
      await withProgress(async () => {
        const response = await fetchAPI('admin/backup/full', {
          method: 'POST',
          isProtected: true,
          body: JSON.stringify({ description: 'Manual full backup from admin panel' })
        });

        setBackupMessage({ type: 'success', text: 'Full backup created successfully!' });
        showToast('Full backup created successfully!', 'success');

        // Reload backups
        await loadFullBackups();
      }, 'Creating Full Backup', 'Please wait while we create a complete database snapshot...');
    } catch (error) {
      setBackupMessage({ type: 'error', text: 'Failed to create backup: ' + error.message });
      showToast('Failed to create backup: ' + error.message, 'error');
    }
  };

  // Restore from full backup with progress tracking
  const restoreFullBackup = async (backupId) => {
    setConfirmDialog({
      show: true,
      message: t('confirmRestoreDatabase') || '⚠️ WARNING: This will restore the entire database from backup. All current data will be replaced. Are you absolutely sure?',
      confirmText: t('yesRestoreDatabase') || 'Yes, Restore Database',
      onConfirm: () => performRestoreFullBackup(backupId)
    });
  };

  const performRestoreFullBackup = async (backupId) => {
    setConfirmDialog({ show: false, message: '', onConfirm: null, confirmText: t('confirm') || 'Confirm' });
    try {
      await withProgress(async () => {
        await fetchAPI('admin/backup/restore', {
          method: 'POST',
          isProtected: true,
          body: JSON.stringify({ backupId }),
        });

        setBackupMessage({ type: 'success', text: 'Database restored successfully!' });
        showToast('Database restored successfully!', 'success');

        // Reload all data if visual editor is open
        if (showVisualEditor) {
          await loadBrands();
          setSelectedBrand(null);
          setSelectedModel(null);
          setSelectedType(null);
          setSelectedEngine(null);
          setModels([]);
          setTypes([]);
          setEngines([]);
        }
      }, 'Restoring Database', 'Please wait while we restore the database from backup. This may take a few minutes...');
    } catch (error) {
      setBackupMessage({ type: 'error', text: 'Failed to restore: ' + error.message });
      showToast('Failed to restore: ' + error.message, 'error');
    }
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
      message: t('confirmDeleteBrand') || 'Are you sure you want to delete this brand and ALL its data (models, types, engines, stages)?',
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
      message: t('confirmDeleteModel') || 'Are you sure you want to delete this model and ALL its data (types, engines, stages)?',
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
      message: t('confirmDeleteGeneration') || 'Are you sure you want to delete this generation and ALL its data (engines, stages)?',
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
      message: t('confirmDeleteEngine') || 'Are you sure you want to delete this engine and ALL its stages?',
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

  // Delete group (CASCADE: group → models → types → engines → stages)
  const deleteGroup = async (groupId) => {
    setDeleteDialog({
      show: true,
      message: t('confirmDeleteGroup') || 'Are you sure you want to delete this group and ALL its data (models, types, engines, stages)?',
      onConfirm: () => performDeleteGroup(groupId)
    });
  };

  const performDeleteGroup = async (groupId) => {
    try {
      await fetchAPI(`admin/group?id=${groupId}`, {
        method: 'DELETE',
        isProtected: true,
      });

      // Remove from local state
      setGroups(groups.filter(g => g.id !== groupId));
      setSelectedGroup(null);
      setSelectedModel(null);
      setSelectedType(null);
      setSelectedEngine(null);
      setModels([]);
      setTypes([]);
      setEngines([]);

      setDataMessage({ type: 'success', text: 'Group and all related data deleted successfully' });
      showToast('Group deleted successfully', 'success');
    } catch (error) {
      setDataMessage({ type: 'error', text: 'Failed to delete: ' + error.message });
      showToast('Failed to delete: ' + error.message, 'error');
    }
  };

  // Edit group
  const renameGroup = (groupId, currentName) => {
    // Find the full group data
    const group = groups.find(g => g.id === groupId);
    if (!group) return;

    setEditGroupDialog({
      show: true,
      groupData: group
    });
  };

  const performRenameGroup = async (groupId, formData) => {
    if (!formData.name || formData.name.trim() === '') return;

    try {
      await fetchAPI('admin/group', {
        method: 'PUT',
        isProtected: true,
        body: JSON.stringify({
          id: groupId,
          name: formData.name.trim(),
          displayName: formData.displayName?.trim() || null,
          description: formData.description?.trim() || null,
          isPerformance: formData.isPerformance || false,
          color: formData.color || null,
          icon: formData.icon || null,
          tagline: formData.tagline?.trim() || null,
          logo: formData.logo || null
        }),
      });

      // Update local state
      setGroups(groups.map(g =>
        g.id === groupId
          ? {
              ...g,
              name: formData.name.trim(),
              displayName: formData.displayName?.trim() || null,
              description: formData.description?.trim() || null,
              isPerformance: formData.isPerformance || false,
              color: formData.color || null,
              icon: formData.icon || null,
              tagline: formData.tagline?.trim() || null,
              logo: formData.logo || null,
              slug: formData.name.toLowerCase().replace(/\s+/g, '-')
            }
          : g
      ));

      // Update selected group if it's the one being edited
      if (selectedGroup?.id === groupId) {
        setSelectedGroup({
          ...selectedGroup,
          name: formData.name.trim(),
          displayName: formData.displayName?.trim() || null,
          description: formData.description?.trim() || null,
          isPerformance: formData.isPerformance || false,
          color: formData.color || null,
          icon: formData.icon || null,
          tagline: formData.tagline?.trim() || null,
          logo: formData.logo || null,
          slug: formData.name.toLowerCase().replace(/\s+/g, '-')
        });
      }

      setDataMessage({ type: 'success', text: 'Group updated successfully' });
      showToast('Group updated successfully', 'success');
      setEditGroupDialog({ show: false, groupData: null });
    } catch (error) {
      setDataMessage({ type: 'error', text: 'Failed to update group: ' + error.message });
      showToast('Failed to update group: ' + error.message, 'error');
    }
  };

  // Add new group
  const addGroup = () => {
    if (!selectedBrand) {
      showToast('Please select a brand first', 'error');
      return;
    }

    setAddGroupDialog({ show: true });
  };

  const performAddGroup = async (formData) => {
    if (!formData.name || formData.name.trim() === '') return;

    try {
      const response = await fetchAPI('admin/group', {
        method: 'POST',
        isProtected: true,
        body: JSON.stringify({
          brandId: selectedBrand.id,
          name: formData.name.trim(),
          displayName: formData.displayName?.trim() || null,
          description: formData.description?.trim() || null,
          isPerformance: formData.isPerformance || false,
          color: formData.color || null,
          icon: formData.icon || null,
          tagline: formData.tagline?.trim() || null,
          logo: formData.logo || null,
          order: groups.length
        }),
      });

      // Add to local state
      const newGroup = response.group;
      setGroups([...groups, newGroup]);

      setDataMessage({ type: 'success', text: 'Group added successfully' });
      showToast('Group added successfully', 'success');
      setAddGroupDialog({ show: false });
    } catch (error) {
      setDataMessage({ type: 'error', text: 'Failed to add group: ' + error.message });
      showToast('Failed to add group: ' + error.message, 'error');
    }
  };

  // Add new model
  const addModel = () => {
    if (!selectedGroup) {
      showToast('Please select a group first', 'error');
      return;
    }

    setEditDialog({
      show: true,
      title: 'Add New Model',
      value: '',
      onConfirm: (name) => performAddModel(name)
    });
  };

  const performAddModel = async (name) => {
    if (!name || name.trim() === '') return;

    try {
      const response = await fetchAPI('admin/model', {
        method: 'POST',
        isProtected: true,
        body: JSON.stringify({
          brandId: selectedBrand.id,
          groupId: selectedGroup.id,
          name: name.trim()
        }),
      });

      // Add to local state
      const newModel = response.model;
      setModels([...models, newModel]);

      setDataMessage({ type: 'success', text: 'Model added successfully' });
      showToast('Model added successfully', 'success');
    } catch (error) {
      setDataMessage({ type: 'error', text: 'Failed to add model: ' + error.message });
      showToast('Failed to add model: ' + error.message, 'error');
    }
  };

  // Add new type/generation
  const addType = () => {
    if (!selectedModel) {
      showToast('Please select a model first', 'error');
      return;
    }

    setEditDialog({
      show: true,
      title: 'Add New Generation',
      value: '',
      onConfirm: (name) => performAddType(name)
    });
  };

  const performAddType = async (name) => {
    if (!name || name.trim() === '') return;

    try {
      const response = await fetchAPI('admin/type', {
        method: 'POST',
        isProtected: true,
        body: JSON.stringify({
          modelId: selectedModel.id,
          name: name.trim()
        }),
      });

      // Add to local state
      const newType = response.type;
      setTypes([...types, newType]);

      setDataMessage({ type: 'success', text: 'Generation added successfully' });
      showToast('Generation added successfully', 'success');
    } catch (error) {
      setDataMessage({ type: 'error', text: 'Failed to add generation: ' + error.message });
      showToast('Failed to add generation: ' + error.message, 'error');
    }
  };

  // Add new engine
  const addEngine = () => {
    if (!selectedType) {
      showToast('Please select a generation first', 'error');
      return;
    }

    setAddEngineDialog({ show: true });
  };

  const performAddEngine = async (formData) => {
    if (!formData.name || formData.name.trim() === '') return;

    try {
      // Create the engine
      const engineResponse = await fetchAPI('admin/engine', {
        method: 'POST',
        isProtected: true,
        body: JSON.stringify({
          typeId: selectedType.id,
          name: formData.name.trim(),
          type: formData.engineType || 'Diesel',
          power: formData.stockPower ? parseInt(formData.stockPower) : null,
          torque: null
        }),
      });

      const newEngine = engineResponse.engine;

      // Create stages if requested
      if (formData.createStages) {
        const stagesToCreate = [];

        if (formData.stages.stage1) {
          stagesToCreate.push({
            stageName: 'Stage 1',
            stockHp: formData.stockPower ? parseInt(formData.stockPower) : 0,
            tunedHp: formData.tunedPower ? parseInt(formData.tunedPower) : 0,
            stockNm: 0,
            tunedNm: 0,
            price: 0,
            ecuUnlock: formData.ecuUnlock || false,
            cpcUpgrade: formData.cpcUpgrade || false
          });
        }

        if (formData.stages.stage1Plus) {
          stagesToCreate.push({
            stageName: 'Stage 1+',
            stockHp: formData.stockPower ? parseInt(formData.stockPower) : 0,
            tunedHp: formData.tunedPower ? Math.round(parseInt(formData.tunedPower) * 1.05) : 0,
            stockNm: 0,
            tunedNm: 0,
            price: 0,
            ecuUnlock: formData.ecuUnlock || false,
            cpcUpgrade: formData.cpcUpgrade || false
          });
        }

        if (formData.stages.stage2) {
          stagesToCreate.push({
            stageName: 'Stage 2',
            stockHp: formData.stockPower ? parseInt(formData.stockPower) : 0,
            tunedHp: formData.tunedPower ? Math.round(parseInt(formData.tunedPower) * 1.1) : 0,
            stockNm: 0,
            tunedNm: 0,
            price: 0,
            ecuUnlock: formData.ecuUnlock || false,
            cpcUpgrade: formData.cpcUpgrade || false
          });
        }

        if (formData.stages.stage2Plus) {
          stagesToCreate.push({
            stageName: 'Stage 2+',
            stockHp: formData.stockPower ? parseInt(formData.stockPower) : 0,
            tunedHp: formData.tunedPower ? Math.round(parseInt(formData.tunedPower) * 1.15) : 0,
            stockNm: 0,
            tunedNm: 0,
            price: 0,
            ecuUnlock: formData.ecuUnlock || false,
            cpcUpgrade: formData.cpcUpgrade || false
          });
        }

        // Create all stages
        for (const stageData of stagesToCreate) {
          await fetchAPI('admin/stage', {
            method: 'POST',
            isProtected: true,
            body: JSON.stringify({
              engineId: newEngine.id,
              ...stageData
            }),
          });
        }
      }

      // Add to local state
      setEngines([...engines, newEngine]);
      setAddEngineDialog({ show: false });

      setDataMessage({ type: 'success', text: `Engine added successfully${formData.createStages ? ' with stages' : ''}` });
      showToast(`Engine added successfully${formData.createStages ? ' with stages' : ''}`, 'success');
    } catch (error) {
      setDataMessage({ type: 'error', text: 'Failed to add engine: ' + error.message });
      showToast('Failed to add engine: ' + error.message, 'error');
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

  // Move item to different parent (same level only)
  const moveItem = async (itemType, itemId, targetParentType, targetParentId) => {
    if (operationInProgress) {
      showToast('Another operation is in progress. Please wait.', 'warning');
      return;
    }

    setOperationInProgress(true);
    try {
      await fetchAPI('admin/move', {
        method: 'POST',
        isProtected: true,
        body: JSON.stringify({
          itemType,
          itemId,
          targetParentType,
          targetParentId
        }),
      });

      setDataMessage({ type: 'success', text: `${itemType} moved successfully` });
      showToast(`${itemType} moved successfully`, 'success');
      setMoveDialog({ show: false });

      // Reload the appropriate data
      if (itemType === 'model' && selectedBrand) {
        if (selectedGroup) {
          await loadModels(selectedBrand.id, selectedGroup.id);
        } else {
          await loadGroups(selectedBrand.id);
        }
      } else if (itemType === 'type' && selectedModel) {
        await loadTypes(selectedModel.id);
      } else if (itemType === 'engine' && selectedType) {
        await loadEngines(selectedType.id);
      }
    } catch (error) {
      setDataMessage({ type: 'error', text: 'Failed to move: ' + error.message });
      showToast('Failed to move: ' + error.message, 'error');
    } finally {
      setOperationInProgress(false);
    }
  };

  // Open move dialog for model (step-by-step: brand → group)
  const openMoveModelDialog = async (model) => {
    setMoveDialog({
      show: true,
      itemType: 'model',
      itemId: model.id,
      itemName: model.name,
      currentGroupId: model.groupId,
      currentBrandId: model.brandId,
      // Step-by-step selection
      selectedBrand: null,
      selectedGroup: null,
      availableGroups: []
    });
  };

  // Open move dialog for type (step-by-step: brand → group → model)
  const openMoveTypeDialog = async (type) => {
    setMoveDialog({
      show: true,
      itemType: 'type',
      itemId: type.id,
      itemName: type.name,
      currentModelId: type.modelId,
      currentBrandId: type.brandId,
      // Step-by-step selection
      selectedBrand: null,
      selectedGroup: null,
      selectedModel: null,
      availableGroups: [],
      availableModels: []
    });
  };

  // Open move dialog for engine (step-by-step: brand → group → model → generation)
  const openMoveEngineDialog = async (engine) => {
    setMoveDialog({
      show: true,
      itemType: 'engine',
      itemId: engine.id,
      itemName: engine.name,
      currentTypeId: engine.typeId,
      currentBrandId: engine.brandId,
      // Step-by-step selection
      selectedBrand: null,
      selectedGroup: null,
      selectedModel: null,
      selectedType: null,
      availableGroups: [],
      availableModels: [],
      availableTypes: []
    });
  };

  // Bulk update prices
  const performBulkPriceUpdate = async ({ level, targetId, updateType, priceData }) => {
    if (operationInProgress) {
      showToast('Another operation is in progress. Please wait.', 'warning');
      return;
    }

    setOperationInProgress(true);
    startOperation();

    try {
      const result = await fetchAPI('admin/bulk-price', {
        method: 'PUT',
        isProtected: true,
        body: JSON.stringify({ level, targetId, updateType, priceData })
      });

      showToast(`Updated ${result.updatedCount} stage prices`, 'success');
      setDataMessage({ type: 'success', text: `Updated ${result.updatedCount} stage prices` });
    } catch (error) {
      console.error('Bulk price update failed:', error);
      showToast('Failed to update prices: ' + error.message, 'error');
      setDataMessage({ type: 'error', text: 'Failed to update prices: ' + error.message });
    } finally {
      setOperationInProgress(false);
      endOperation();
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

        {/* Backup Section - New Production System */}
        <BackupSection
          showBackups={showBackups}
          setShowBackups={setShowBackups}
          fullBackups={fullBackups}
          auditLogs={auditLogs}
          backupLoading={backupLoading}
          backupMessage={backupMessage}
          loadFullBackups={loadFullBackups}
          createFullBackup={createFullBackup}
          restoreFullBackup={restoreFullBackup}
          loadAuditLogs={loadAuditLogs}
          showAuditLogs={showAuditLogs}
          setShowAuditLogs={setShowAuditLogs}
        />

        {/* Visual Editor Section */}
        <VisualEditorSection
          showVisualEditor={showVisualEditor}
          setShowVisualEditor={setShowVisualEditor}
          brands={brands}
          groups={groups}
          models={models}
          types={types}
          engines={engines}
          brandsLoading={brandsLoading}
          groupsLoading={groupsLoading}
          modelsLoading={modelsLoading}
          typesLoading={typesLoading}
          enginesLoading={enginesLoading}
          dataMessage={dataMessage}
          deleteBrand={deleteBrand}
          deleteGroup={deleteGroup}
          deleteModel={deleteModel}
          deleteType={deleteType}
          deleteEngine={deleteEngine}
          renameBrand={renameBrand}
          renameGroup={renameGroup}
          renameModel={renameModel}
          renameType={renameType}
          renameEngine={renameEngine}
          addGroup={addGroup}
          addModel={addModel}
          addType={addType}
          addEngine={addEngine}
          openMoveModelDialog={openMoveModelDialog}
          openMoveTypeDialog={openMoveTypeDialog}
          openMoveEngineDialog={openMoveEngineDialog}
          selectedBrand={selectedBrand}
          handleBrandSelect={handleBrandSelect}
          selectedGroup={selectedGroup}
          handleGroupSelect={handleGroupSelect}
          selectedModel={selectedModel}
          handleModelSelect={handleModelSelect}
          selectedType={selectedType}
          handleTypeSelect={handleTypeSelect}
          selectedEngine={selectedEngine}
          handleEngineSelect={handleEngineSelect}
          openBulkUpdate={() => setBulkUpdateDialog({ show: true })}
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
        confirmText={t('delete') || 'Delete'}
        cancelText={t('cancel') || 'Cancel'}
        onConfirm={() => {
          if (deleteDialog.onConfirm) deleteDialog.onConfirm();
          setDeleteDialog({ show: false, message: '', onConfirm: null });
        }}
        onCancel={() => setDeleteDialog({ show: false, message: '', onConfirm: null })}
      />

      {/* General Confirm Dialog (for non-delete actions) */}
      <ConfirmDialog
        show={confirmDialog.show}
        message={confirmDialog.message}
        confirmText={confirmDialog.confirmText}
        cancelText={t('cancel') || 'Cancel'}
        onConfirm={() => {
          if (confirmDialog.onConfirm) confirmDialog.onConfirm();
          setConfirmDialog({ show: false, message: '', onConfirm: null, confirmText: t('confirm') || 'Confirm' });
        }}
        onCancel={() => setConfirmDialog({ show: false, message: '', onConfirm: null, confirmText: t('confirm') || 'Confirm' })}
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

      {/* Add Group Dialog */}
      <AddGroupDialog
        show={addGroupDialog.show}
        onConfirm={(formData) => {
          performAddGroup(formData);
        }}
        onCancel={() => setAddGroupDialog({ show: false })}
        brandName={selectedBrand?.name}
      />

      {/* Edit Group Dialog */}
      <EditGroupDialog
        show={editGroupDialog.show}
        onConfirm={(formData) => {
          performRenameGroup(editGroupDialog.groupData?.id, formData);
        }}
        onCancel={() => setEditGroupDialog({ show: false, groupData: null })}
        brandName={selectedBrand?.name}
        groupData={editGroupDialog.groupData}
      />

      {/* Add Engine Dialog */}
      <AddEngineDialog
        show={addEngineDialog.show}
        onConfirm={(formData) => {
          performAddEngine(formData);
        }}
        onCancel={() => setAddEngineDialog({ show: false })}
        brandName={selectedBrand?.name}
      />

      {/* Move Dialog */}
      {moveDialog.show && <MoveDialog
        moveDialog={moveDialog}
        setMoveDialog={setMoveDialog}
        moveItem={moveItem}
        operationInProgress={operationInProgress}
      />}

      {/* Bulk Update Dialog */}
      <BulkUpdateDialog
        show={bulkUpdateDialog.show}
        onClose={() => setBulkUpdateDialog({ show: false })}
        onUpdate={performBulkPriceUpdate}
        brands={brands}
        groups={groups}
        models={models}
        generations={types}
        engines={engines}
      />

      {/* Global Operation Loading Overlay */}
      {operationInProgress && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.85)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          flexDirection: 'column',
          gap: '20px'
        }}>
          <RefreshCw size={56} style={{ animation: 'spin 1s linear infinite', color: 'var(--primary)' }} />
          <p style={{ fontSize: '1.2rem', color: 'var(--text)', fontWeight: '600' }}>Processing operation...</p>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Please wait, do not close this window</p>
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}

// Step-by-step Move Dialog Component (like home selector)
function MoveDialog({ moveDialog, setMoveDialog, moveItem, operationInProgress }) {
  const [loading, setLoading] = useState(false);
  const [brands, setBrands] = useState([]);
  const [groups, setGroups] = useState([]);
  const [models, setModels] = useState([]);
  const [types, setTypes] = useState([]);
  const { t } = useLanguage();

  // Fetch brands on mount
  useEffect(() => {
    const loadBrands = async () => {
      try {
        const response = await fetch('/api/brands');
        const data = await response.json();
        setBrands(data);
      } catch (error) {
        console.error('Failed to load brands:', error);
      }
    };
    if (moveDialog.show) {
      loadBrands();
    }
  }, [moveDialog.show]);

  // Handle brand selection
  const handleBrandSelect = async (brandId) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/groups?brandId=${brandId}`);
      const data = await response.json();
      setGroups(data);
      setMoveDialog({ ...moveDialog, selectedBrand: brandId, selectedGroup: null, selectedModel: null, selectedType: null });
    } catch (error) {
      console.error('Failed to load groups:', error);
    }
    setLoading(false);
  };

  // Handle group selection
  const handleGroupSelect = async (groupId) => {
    if (moveDialog.itemType === 'model') {
      // For model move, store the selection and show confirmation
      setMoveDialog({ ...moveDialog, selectedGroup: groupId, showConfirmation: true });
      return;
    }

    // For type/engine, continue to model selection
    setLoading(true);
    try {
      const response = await fetch(`/api/models?brandId=${moveDialog.selectedBrand}&groupId=${groupId}`);
      const data = await response.json();
      setModels(data);
      setMoveDialog({ ...moveDialog, selectedGroup: groupId, selectedModel: null, selectedType: null });
    } catch (error) {
      console.error('Failed to load models:', error);
    }
    setLoading(false);
  };

  // Handle model selection
  const handleModelSelect = async (modelId) => {
    if (moveDialog.itemType === 'type') {
      // For type move, store the selection and show confirmation
      setMoveDialog({ ...moveDialog, selectedModel: modelId, showConfirmation: true });
      return;
    }

    // For engine, continue to type selection
    setLoading(true);
    try {
      const response = await fetch(`/api/types?modelId=${modelId}`);
      const data = await response.json();
      setTypes(data);
      setMoveDialog({ ...moveDialog, selectedModel: modelId, selectedType: null });
    } catch (error) {
      console.error('Failed to load types:', error);
    }
    setLoading(false);
  };

  // Handle type selection (for engine)
  const handleTypeSelect = async (typeId) => {
    // For engine move, store the selection and show confirmation
    setMoveDialog({ ...moveDialog, selectedType: typeId, showConfirmation: true });
  };

  // Confirm and execute the move
  const confirmMove = async () => {
    setLoading(true);

    if (moveDialog.itemType === 'model') {
      await moveItem('model', moveDialog.itemId, 'group', moveDialog.selectedGroup);
    } else if (moveDialog.itemType === 'type') {
      await moveItem('type', moveDialog.itemId, 'model', moveDialog.selectedModel);
    } else if (moveDialog.itemType === 'engine') {
      await moveItem('engine', moveDialog.itemId, 'type', moveDialog.selectedType);
    }

    setLoading(false);
  };

  const isDisabled = loading || operationInProgress;

  // Get destination name for confirmation
  const getDestinationName = () => {
    if (moveDialog.itemType === 'model') {
      const brand = brands.find(b => b.id === moveDialog.selectedBrand);
      const group = groups.find(g => g.id === moveDialog.selectedGroup);
      return `${brand?.name} → ${group?.name}`;
    } else if (moveDialog.itemType === 'type') {
      const brand = brands.find(b => b.id === moveDialog.selectedBrand);
      const group = groups.find(g => g.id === moveDialog.selectedGroup);
      const model = models.find(m => m.id === moveDialog.selectedModel);
      return `${brand?.name} → ${group?.name} → ${model?.name}`;
    } else if (moveDialog.itemType === 'engine') {
      const brand = brands.find(b => b.id === moveDialog.selectedBrand);
      const group = groups.find(g => g.id === moveDialog.selectedGroup);
      const model = models.find(m => m.id === moveDialog.selectedModel);
      const type = types.find(t => t.id === moveDialog.selectedType);
      return `${brand?.name} → ${group?.name} → ${model?.name} → ${type?.name}`;
    }
    return '';
  };

  return (
    <>
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        pointerEvents: isDisabled ? 'none' : 'auto'
      }}>
        <div className="dialog-content dialog-responsive-padding" style={{
          background: 'black',
          borderRadius: '12px',
          maxWidth: '600px',
          width: '90%',
          border: '1px solid var(--border)',
          maxHeight: '85vh',
          overflowY: 'auto'
        }}>
          {/* Confirmation View */}
          {moveDialog.showConfirmation ? (
            <>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '1.3rem', color: '#ff9800' }}>
                {t('confirmMove') || 'Confirm Move'}
              </h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '24px', fontSize: '0.9rem' }}>
                {t('confirmMoveQuestion') || 'Are you sure you want to move this item?'}
              </p>

              <div style={{
                background: 'rgba(255, 152, 0, 0.1)',
                border: '1px solid rgba(255, 152, 0, 0.3)',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '24px'
              }}>
                <div style={{ marginBottom: '12px' }}>
                  <strong style={{ color: '#00ff88' }}>{t('item') || 'Item'}:</strong>
                  <div style={{ marginTop: '4px', fontSize: '1.05rem' }}>{moveDialog.itemName}</div>
                </div>
                <div>
                  <strong style={{ color: '#00ff88' }}>{t('moveTo') || 'Move to'}:</strong>
                  <div style={{ marginTop: '4px', fontSize: '1.05rem' }}>{getDestinationName()}</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => setMoveDialog({ ...moveDialog, showConfirmation: false })}
                  disabled={isDisabled}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: 'transparent',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    color: 'var(--text)',
                    cursor: isDisabled ? 'not-allowed' : 'pointer',
                    fontSize: '0.95rem',
                    opacity: isDisabled ? 0.5 : 1
                  }}
                >
                  {t('back') || 'Back'}
                </button>
                <button
                  onClick={confirmMove}
                  disabled={isDisabled}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: '#ff9800',
                    border: 'none',
                    borderRadius: '8px',
                    color: 'black',
                    cursor: isDisabled ? 'not-allowed' : 'pointer',
                    fontSize: '0.95rem',
                    fontWeight: '600',
                    opacity: isDisabled ? 0.5 : 1
                  }}
                >
                  {loading ? (t('moving') || 'Moving...') : (t('confirmMove') || 'Confirm Move')}
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Selection View */}
              <h3 style={{ margin: '0 0 8px 0', fontSize: '1.3rem' }}>
                {t('move') || 'Move'} "{moveDialog.itemName}"
              </h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '24px', fontSize: '0.9rem' }}>
                {moveDialog.itemType === 'model' && (t('selectBrandAndGroup') || 'Select brand and group')}
                {moveDialog.itemType === 'type' && (t('selectBrandGroupModel') || 'Select brand, group, and model')}
                {moveDialog.itemType === 'engine' && (t('selectBrandGroupModelGeneration') || 'Select brand, group, model, and generation')}
              </p>

              {/* Brand Selection */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>{t('brand') || 'Brand'}</label>
                <select
                  value={moveDialog.selectedBrand || ''}
                  onChange={(e) => handleBrandSelect(parseInt(e.target.value))}
                  disabled={isDisabled}
                  className="move-select"
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: '#1a1a1a',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontSize: '0.95rem',
                    cursor: isDisabled ? 'not-allowed' : 'pointer',
                    opacity: isDisabled ? 0.6 : 1
                  }}
                >
                  <option value="" style={{ background: '#1a1a1a', color: '#888' }}>{t('selectBrand') || '-- Select Brand --'}</option>
                  {brands.map(brand => (
                    <option key={brand.id} value={brand.id} style={{ background: '#1a1a1a', color: '#ffffff' }}>
                      {brand.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Group Selection */}
              {moveDialog.selectedBrand && (
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>{t('group') || 'Group'}</label>
                  <select
                    value={moveDialog.selectedGroup || ''}
                    onChange={(e) => handleGroupSelect(parseInt(e.target.value))}
                    disabled={isDisabled || !moveDialog.selectedBrand}
                    className="move-select"
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: '#1a1a1a',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      color: '#ffffff',
                      fontSize: '0.95rem',
                      cursor: isDisabled ? 'not-allowed' : 'pointer',
                      opacity: isDisabled ? 0.6 : 1
                    }}
                  >
                    <option value="" style={{ background: '#1a1a1a', color: '#888' }}>{t('selectGroup') || '-- Select Group --'}</option>
                    {groups.filter(g => g.id !== moveDialog.currentGroupId).map(group => (
                      <option key={group.id} value={group.id} style={{ background: '#1a1a1a', color: '#ffffff' }}>
                        {group.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Model Selection (for type and engine) */}
              {(moveDialog.itemType === 'type' || moveDialog.itemType === 'engine') && moveDialog.selectedGroup && (
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>{t('model') || 'Model'}</label>
                  <select
                    value={moveDialog.selectedModel || ''}
                    onChange={(e) => handleModelSelect(parseInt(e.target.value))}
                    disabled={isDisabled || !moveDialog.selectedGroup}
                    className="move-select"
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: '#1a1a1a',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      color: '#ffffff',
                      fontSize: '0.95rem',
                      cursor: isDisabled ? 'not-allowed' : 'pointer',
                      opacity: isDisabled ? 0.6 : 1
                    }}
                  >
                    <option value="" style={{ background: '#1a1a1a', color: '#888' }}>{t('selectModel') || '-- Select Model --'}</option>
                    {models.filter(m => m.id !== moveDialog.currentModelId).map(model => (
                      <option key={model.id} value={model.id} style={{ background: '#1a1a1a', color: '#ffffff' }}>
                        {model.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Type/Generation Selection (for engine only) */}
              {moveDialog.itemType === 'engine' && moveDialog.selectedModel && (
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>{t('generation') || 'Generation'}</label>
                  <select
                    value={moveDialog.selectedType || ''}
                    onChange={(e) => handleTypeSelect(parseInt(e.target.value))}
                    disabled={isDisabled || !moveDialog.selectedModel}
                    className="move-select"
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: '#1a1a1a',
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      color: '#ffffff',
                      fontSize: '0.95rem',
                      cursor: isDisabled ? 'not-allowed' : 'pointer',
                      opacity: isDisabled ? 0.6 : 1
                    }}
                  >
                    <option value="" style={{ background: '#1a1a1a', color: '#888' }}>{t('selectGeneration') || '-- Select Generation --'}</option>
                    {types.filter(tp => tp.id !== moveDialog.currentTypeId).map(tp => (
                      <option key={tp.id} value={tp.id} style={{ background: '#1a1a1a', color: '#ffffff' }}>
                        {tp.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Cancel Button */}
              <button
                onClick={() => setMoveDialog({ show: false })}
                disabled={isDisabled}
                style={{
                  width: '100%',
                  padding: '12px',
                  marginTop: '8px',
                  background: 'transparent',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  color: 'var(--text)',
                  cursor: isDisabled ? 'not-allowed' : 'pointer',
                  fontSize: '0.95rem',
                  opacity: isDisabled ? 0.5 : 1
                }}
              >
                {t('cancel') || 'Cancel'}
              </button>
            </>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .move-select option {
          background: #1a1a1a !important;
          color: #ffffff !important;
        }

        .move-select option:hover {
          background: #2a2a2a !important;
        }
      `}</style>
    </>
  );
}



// Visual Editor Section Component
function VisualEditorSection({
  showVisualEditor, setShowVisualEditor,
  brands, groups, models, types, engines,
  brandsLoading, groupsLoading, modelsLoading, typesLoading, enginesLoading,
  dataMessage,
  deleteBrand, deleteGroup, deleteModel, deleteType, deleteEngine,
  renameBrand, renameGroup, renameModel, renameType, renameEngine,
  addGroup, addModel, addType, addEngine,
  openMoveModelDialog, openMoveTypeDialog, openMoveEngineDialog,
  selectedBrand, handleBrandSelect,
  selectedGroup, handleGroupSelect,
  selectedModel, handleModelSelect,
  selectedType, handleTypeSelect,
  selectedEngine, handleEngineSelect,
  openBulkUpdate
}) {
  const { t } = useLanguage();
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
          {t('dataManager') || 'Data Manager'}
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {showVisualEditor && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                openBulkUpdate();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                background: 'rgba(0, 255, 136, 0.1)',
                border: '1px solid rgba(0, 255, 136, 0.3)',
                borderRadius: '6px',
                color: '#00ff88',
                fontSize: '0.85rem',
                fontWeight: '500',
                cursor: 'pointer'
              }}
              title={t('bulkUpdatePrices') || 'Bulk update prices'}
            >
              <DollarSign size={16} />
              <span className="bulk-btn-text">{t('bulkPrices') || 'Bulk Prices'}</span>
            </button>
          )}
          {showVisualEditor ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
        </div>
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
              <p>{t('loadingBrands') || 'Loading brands...'}</p>
            </div>
          ) : (
            <div className="admin-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))', gap: '16px' }}>
              {/* Brands List */}
              <div style={{ background: 'rgba(50, 55, 60, 0.3)', borderRadius: '8px', padding: '16px' }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '0.9rem', color: 'var(--primary)' }}>
                  {t('brands') || 'Brands'} ({brands?.length || 0})
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
                          title={t('renameBrand') || 'Rename brand'}
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
                          title={t('deleteBrand') || 'Delete brand'}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Groups List */}
              {selectedBrand && (
                <div style={{ background: 'rgba(50, 55, 60, 0.3)', borderRadius: '8px', padding: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <h4 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--primary)' }}>
                      {t('groups') || 'Groups'} - {selectedBrand.name} ({groups?.length || 0})
                    </h4>
                    <button
                      onClick={addGroup}
                      style={{
                        background: 'var(--primary)',
                        border: 'none',
                        color: '#1a1a1a',
                        cursor: 'pointer',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: 'bold'
                      }}
                      title={t('addNewGroup') || 'Add new group'}
                    >
                      + {t('addGroup') || 'Add Group'}
                    </button>
                  </div>
                  {groupsLoading ? (
                    <div style={{ textAlign: 'center', padding: '20px' }}>
                      <RefreshCw size={16} className="spin" />
                    </div>
                  ) : (
                    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                      {groups?.map(group => (
                        <div
                          key={group.id}
                          style={{
                            padding: '8px',
                            marginBottom: '4px',
                            background: selectedGroup?.id === group.id ? 'rgba(184, 192, 200, 0.2)' : 'rgba(255,255,255,0.05)',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}
                          onClick={() => handleGroupSelect(group)}
                        >
                          <span style={{ fontSize: '0.85rem', flex: 1 }}>
                            {group.name} {group.isPerformance && '⚡'}
                          </span>
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                renameGroup(group.id, group.name);
                              }}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: '#00ff88',
                                cursor: 'pointer',
                                padding: '4px'
                              }}
                              title={t('renameGroup') || 'Rename group'}
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteGroup(group.id);
                              }}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: '#ff4444',
                                cursor: 'pointer',
                                padding: '4px'
                              }}
                              title={t('deleteGroup') || 'Delete group'}
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

              {/* Models List */}
              {selectedGroup && (
                <div style={{ background: 'rgba(50, 55, 60, 0.3)', borderRadius: '8px', padding: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <h4 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--primary)' }}>
                      {t('models') || 'Models'} - {selectedGroup.name} ({models?.length || 0})
                    </h4>
                    <button
                      onClick={addModel}
                      style={{
                        background: 'var(--primary)',
                        border: 'none',
                        color: '#1a1a1a',
                        cursor: 'pointer',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                      title={t('addNewModel') || 'Add new model'}
                    >
                      <Plus size={12} /> {t('add') || 'Add'}
                    </button>
                  </div>
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
                              openMoveModelDialog(model);
                            }}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#4488ff',
                              cursor: 'pointer',
                              padding: '4px'
                            }}
                            title={t('moveToAnotherGroup') || 'Move to another group'}
                          >
                            <MoveRight size={14} />
                          </button>
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
                            title={t('renameModel') || 'Rename model'}
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
                            title={t('deleteModel') || 'Delete model'}
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <h4 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--primary)' }}>
                      {t('generations') || 'Generations'} - {selectedModel.name} ({types?.length || 0})
                    </h4>
                    <button
                      onClick={addType}
                      style={{
                        background: 'var(--primary)',
                        border: 'none',
                        color: '#1a1a1a',
                        cursor: 'pointer',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                      title={t('addNewGeneration') || 'Add new generation'}
                    >
                      <Plus size={12} /> {t('add') || 'Add'}
                    </button>
                  </div>
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
                              openMoveTypeDialog(type);
                            }}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#4488ff',
                              cursor: 'pointer',
                              padding: '4px'
                            }}
                            title={t('moveToAnotherModel') || 'Move to another model'}
                          >
                            <MoveRight size={14} />
                          </button>
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
                            title={t('renameGeneration') || 'Rename generation'}
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
                            title={t('deleteGeneration') || 'Delete generation'}
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <h4 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--primary)' }}>
                      {t('engines') || 'Engines'} - {selectedType.name} ({engines?.length || 0})
                    </h4>
                    <button
                      onClick={addEngine}
                      style={{
                        background: 'var(--primary)',
                        border: 'none',
                        color: '#1a1a1a',
                        cursor: 'pointer',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                      title={t('addNewEngine') || 'Add new engine'}
                    >
                      <Plus size={12} /> {t('add') || 'Add'}
                    </button>
                  </div>
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
                              openMoveEngineDialog(engine);
                            }}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#4488ff',
                              cursor: 'pointer',
                              padding: '4px'
                            }}
                            title={t('moveToAnotherGeneration') || 'Move to another generation'}
                          >
                            <MoveRight size={14} />
                          </button>
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
                            title={t('renameEngine') || 'Rename engine'}
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
                            title={t('deleteEngine') || 'Delete engine'}
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
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
            <div style={{ position: 'relative' }}>
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                style={{ paddingRight: '48px', marginBottom: 0 }}
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-muted)',
                  transition: 'color 0.2s ease'
                }}
                onMouseOver={(e) => e.currentTarget.style.color = 'var(--primary)'}
                onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
              >
                {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
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
            <div style={{ position: 'relative' }}>
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
                style={{ paddingRight: '48px', marginBottom: 0 }}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-muted)',
                  transition: 'color 0.2s ease'
                }}
                onMouseOver={(e) => e.currentTarget.style.color = 'var(--primary)'}
                onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
              >
                {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label>{t('confirmNewPassword')}</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                style={{ paddingRight: '48px', marginBottom: 0 }}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-muted)',
                  transition: 'color 0.2s ease'
                }}
                onMouseOver={(e) => e.currentTarget.style.color = 'var(--primary)'}
                onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
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
