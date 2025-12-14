# Admin Page Changes Summary

## File Modified: `app/admin/page.jsx`

### 1. State Variables Added

```javascript
// Added group-related state
const [groups, setGroups] = useState([]);
const [selectedGroup, setSelectedGroup] = useState(null);
const [groupsLoading, setGroupsLoading] = useState(false);
```

### 2. Functions Added

#### Load Groups
```javascript
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
```

#### Handle Group Selection
```javascript
const handleGroupSelect = (group) => {
  setSelectedGroup(group);
  setSelectedModel(null);
  setSelectedType(null);
  setSelectedEngine(null);
  loadModels(selectedBrand.id, group.id);
};
```

#### Delete Group (CASCADE)
```javascript
const deleteGroup = async (groupId) => {
  setDeleteDialog({
    show: true,
    message: 'Are you sure you want to delete this group and ALL its data (models, types, engines, stages)?',
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
```

#### Rename Group
```javascript
const renameGroup = (groupId, currentName) => {
  setEditDialog({
    show: true,
    title: 'Rename Group',
    value: currentName,
    onConfirm: (newName) => performRenameGroup(groupId, newName)
  });
};

const performRenameGroup = async (groupId, newName) => {
  if (!newName || newName.trim() === '') return;

  try {
    await fetchAPI('admin/group', {
      method: 'PUT',
      isProtected: true,
      body: JSON.stringify({ id: groupId, name: newName.trim() }),
    });

    // Update local state
    setGroups(groups.map(g =>
      g.id === groupId
        ? { ...g, name: newName.trim(), slug: newName.toLowerCase().replace(/\s+/g, '-') }
        : g
    ));

    // Update selected group if it's the one being renamed
    if (selectedGroup?.id === groupId) {
      setSelectedGroup({ ...selectedGroup, name: newName.trim(), slug: newName.toLowerCase().replace(/\s+/g, '-') });
    }

    setDataMessage({ type: 'success', text: 'Group renamed successfully' });
    showToast('Group renamed successfully', 'success');
  } catch (error) {
    setDataMessage({ type: 'error', text: 'Failed to rename: ' + error.message });
  }
};
```

#### Add New Group
```javascript
const addGroup = () => {
  if (!selectedBrand) {
    showToast('Please select a brand first', 'error');
    return;
  }

  setEditDialog({
    show: true,
    title: 'Add New Group',
    value: '',
    onConfirm: (name) => performAddGroup(name)
  });
};

const performAddGroup = async (name) => {
  if (!name || name.trim() === '') return;

  try {
    const response = await fetchAPI('admin/group', {
      method: 'POST',
      isProtected: true,
      body: JSON.stringify({ 
        brandId: selectedBrand.id, 
        name: name.trim(),
        isPerformance: false,
        order: groups.length
      }),
    });

    // Add to local state
    const newGroup = response.group;
    setGroups([...groups, newGroup]);

    setDataMessage({ type: 'success', text: 'Group added successfully' });
    showToast('Group added successfully', 'success');
  } catch (error) {
    setDataMessage({ type: 'error', text: 'Failed to add group: ' + error.message });
    showToast('Failed to add group: ' + error.message, 'error');
  }
};
```

#### Move Item (Generic)
```javascript
const moveItem = async (itemType, itemId, targetParentType, targetParentId) => {
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
  }
};
```

### 3. Modified Functions

#### Updated `handleBrandSelect`
```javascript
// OLD: Loaded models directly
const handleBrandSelect = (brand) => {
  setSelectedBrand(brand);
  setSelectedModel(null);
  setSelectedType(null);
  setSelectedEngine(null);
  loadModels(brand.id);
};

// NEW: Loads groups instead
const handleBrandSelect = (brand) => {
  setSelectedBrand(brand);
  setSelectedGroup(null);
  setSelectedModel(null);
  setSelectedType(null);
  setSelectedEngine(null);
  loadGroups(brand.id);
};
```

#### Updated `loadModels`
```javascript
// OLD: Only accepted brandId
const loadModels = async (brandId) => {
  // ...
  const data = await fetchAPI(`models?brandId=${brandId}`, { isProtected: true });
  // ...
};

// NEW: Accepts optional groupId
const loadModels = async (brandId, groupId = null) => {
  // ...
  const url = groupId 
    ? `models?groupId=${groupId}` 
    : `models?brandId=${brandId}`;
  const data = await fetchAPI(url, { isProtected: true });
  // ...
};
```

### 4. UI Components Added

#### Groups Section (Between Brands and Models)
- Displays all groups for selected brand
- Shows group count
- "Add Group" button
- Performance indicator (⚡) for `isPerformance: true`
- Rename button (green edit icon)
- Delete button (red trash icon)
- Click to select group and load models

#### Updated Props for VisualEditorSection
```javascript
<VisualEditorSection
  // ... existing props ...
  groups={groups}
  groupsLoading={groupsLoading}
  deleteGroup={deleteGroup}
  renameGroup={renameGroup}
  addGroup={addGroup}
  moveItem={moveItem}
  selectedGroup={selectedGroup}
  handleGroupSelect={handleGroupSelect}
/>
```

## Visual Changes

### Before:
```
Brands → Models → Types → Engines
```

### After:
```
Brands → Groups (+ Add Group) → Models → Types → Engines
              ↓
         ⚡ Performance indicator
         ✏️ Rename
         🗑️ Delete
```

## Testing Checklist

- [ ] Select brand → Groups load
- [ ] Click "Add Group" → Dialog appears
- [ ] Enter group name → Group created
- [ ] Click rename → Group renamed
- [ ] Click delete → Confirmation dialog
- [ ] Confirm delete → Group and related data deleted
- [ ] Select group → Models load for that group
- [ ] Performance groups show ⚡ icon

