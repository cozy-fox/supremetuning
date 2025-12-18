# React Components Reference

## Complete Component Documentation for Supreme Tuning

---

## Table of Contents

1. [Component Overview](#1-component-overview)
2. [Page Components](#2-page-components)
3. [Dialog Components](#3-dialog-components)
4. [UI Components](#4-ui-components)
5. [Form Components](#5-form-components)
6. [Layout Components](#6-layout-components)
7. [Component Patterns](#7-component-patterns)

---

## 1. Component Overview

### Component Architecture

```
components/
├── Header.jsx           # Navigation header
├── LanguageSelector.jsx # Language switcher
├── EditDialog.jsx       # Generic edit dialog
├── ConfirmDialog.jsx    # Confirmation dialog
├── BulkUpdateDialog.jsx # Bulk price update
├── MoveDialog.jsx       # Move items dialog
├── AddGroupDialog.jsx   # Add group dialog
├── AddEngineDialog.jsx  # Add engine dialog
├── BackupSection.jsx    # Backup management
└── ...
```

### Common Props Pattern

All dialog components follow this pattern:

```javascript
{
  isOpen: boolean,      // Controls visibility
  onClose: function,    // Called when dialog closes
  onConfirm: function,  // Called on confirmation
  data: object,         // Data to edit/display
  loading: boolean      // Loading state
}
```

---

## 2. Page Components

### Home Page (`app/page.jsx`)

Main landing page with brand cards and calculator.

**Features:**
- Brand card grid
- Hierarchical calculator (Brand → Group → Model → Generation → Engine)
- Stage results display
- Responsive layout

**State:**
```javascript
const [brands, setBrands] = useState([]);
const [selectedBrand, setSelectedBrand] = useState(null);
const [selectedGroup, setSelectedGroup] = useState(null);
const [selectedModel, setSelectedModel] = useState(null);
const [selectedType, setSelectedType] = useState(null);
const [selectedEngine, setSelectedEngine] = useState(null);
const [stages, setStages] = useState([]);
```

**Usage:**
```jsx
// Automatically rendered at /
export default function HomePage() { ... }
```

### Admin Page (`app/admin/page.jsx`)

Main admin dashboard with data management.

**Features:**
- Visual data editor (tree view)
- CRUD operations for all entities
- Bulk price updates
- Move operations
- Backup management

**State:**
```javascript
const [data, setData] = useState(null);
const [selectedItem, setSelectedItem] = useState(null);
const [editDialog, setEditDialog] = useState({ open: false, type: null, item: null });
const [globalProgress, setGlobalProgress] = useState(false);
```

**Key Functions:**
- `handleAdd(type, parentId)` - Add new item
- `handleEdit(type, item)` - Edit existing item
- `handleDelete(type, item)` - Delete item
- `handleMove(type, item)` - Move item
- `refreshData()` - Reload all data

### Login Page (`app/login/page.jsx`)

Authentication page.

**Features:**
- Username/password form
- Error display
- Redirect on success

---

## 3. Dialog Components

### EditDialog

Generic dialog for editing any entity.

**File:** `components/EditDialog.jsx`

**Props:**
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| isOpen | boolean | Yes | Dialog visibility |
| onClose | function | Yes | Close handler |
| onSave | function | Yes | Save handler |
| type | string | Yes | Entity type (brand, model, etc.) |
| item | object | No | Item to edit (null for create) |
| parentData | object | No | Parent entity data |

**Usage:**
```jsx
<EditDialog
  isOpen={editDialog.open}
  onClose={() => setEditDialog({ open: false })}
  onSave={handleSave}
  type="model"
  item={selectedModel}
  parentData={{ brandId: 1, groupId: 1 }}
/>
```

**Supported Types:**
- `brand` - Brand name
- `group` - Group name, isPerformance
- `model` - Model name
- `type` - Generation name
- `engine` - Engine details (name, type, power, years)
- `stage` - Stage details (power, torque, price)

### ConfirmDialog

Confirmation dialog for destructive actions.

**File:** `components/ConfirmDialog.jsx`

**Props:**
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| isOpen | boolean | Yes | Dialog visibility |
| onClose | function | Yes | Close handler |
| onConfirm | function | Yes | Confirm handler |
| title | string | Yes | Dialog title |
| message | string | Yes | Confirmation message |
| confirmText | string | No | Confirm button text (default: "Delete") |
| type | string | No | "danger" or "warning" |

**Usage:**
```jsx
<ConfirmDialog
  isOpen={deleteDialog.open}
  onClose={() => setDeleteDialog({ open: false })}
  onConfirm={handleDelete}
  title="Delete Model"
  message="Are you sure you want to delete this model? This will also delete all generations, engines, and stages."
  confirmText="Delete"
  type="danger"
/>
```

### BulkUpdateDialog

Dialog for bulk price updates.

**File:** `components/BulkUpdateDialog.jsx` (575 lines)

**Props:**
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| isOpen | boolean | Yes | Dialog visibility |
| onClose | function | Yes | Close handler |
| onUpdate | function | Yes | Update handler |
| data | object | Yes | Full data hierarchy |

**Features:**
- Step-by-step selection (Brand → Group → Model → Generation → Engine)
- Three update modes:
  - Percentage (increase/decrease)
  - Fixed price (all stages same price)
  - Per-stage prices (individual prices)
- Preview of affected items
- Loading states

**Usage:**
```jsx
<BulkUpdateDialog
  isOpen={bulkDialog.open}
  onClose={() => setBulkDialog({ open: false })}
  onUpdate={handleBulkUpdate}
  data={allData}
/>
```

### MoveDialog

Dialog for moving items between parents.

**File:** `components/MoveDialog.jsx`

**Props:**
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| isOpen | boolean | Yes | Dialog visibility |
| onClose | function | Yes | Close handler |
| onMove | function | Yes | Move handler |
| type | string | Yes | Item type (model, type, engine) |
| item | object | Yes | Item to move |
| data | object | Yes | Full data hierarchy |

**Move Targets by Type:**
- `model` → Select Brand + Group
- `type` → Select Brand + Group + Model
- `engine` → Select Brand + Group + Model + Generation

### AddGroupDialog

Dialog for adding new groups.

**File:** `components/AddGroupDialog.jsx`

**Props:**
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| isOpen | boolean | Yes | Dialog visibility |
| onClose | function | Yes | Close handler |
| onAdd | function | Yes | Add handler |
| brandId | number | Yes | Parent brand ID |

**Fields:**
- Group name
- Is Performance (checkbox)
- Logo upload (optional)

### AddEngineDialog

Dialog for adding new engines.

**File:** `components/AddEngineDialog.jsx`

**Props:**
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| isOpen | boolean | Yes | Dialog visibility |
| onClose | function | Yes | Close handler |
| onAdd | function | Yes | Add handler |
| typeId | number | Yes | Parent generation ID |

**Fields:**
- Engine name
- Engine code
- Fuel type (petrol, diesel, hybrid, electric)
- Stock power (HP)
- Start year
- End year

---

## 4. UI Components

### Header

Navigation header with responsive design.

**File:** `components/Header.jsx`

**Features:**
- Logo and brand name
- Navigation links
- Language selector
- Hamburger menu for <380px screens

**Props:**
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| showAdmin | boolean | No | Show admin link |

**Usage:**
```jsx
<Header showAdmin={true} />
```

**Responsive Behavior:**
- Desktop (>768px): Full navigation bar
- Tablet (380-768px): Compact navigation
- Mobile (<380px): Hamburger menu

### LanguageSelector

Language switcher component.

**File:** `components/LanguageSelector.jsx`

**Features:**
- Dropdown with flag icons
- Supports Dutch (NL) and English (EN)
- Persists selection to localStorage

**Usage:**
```jsx
<LanguageSelector />
```

### BackupSection

Backup management panel.

**File:** `components/BackupSection.jsx` (287 lines)

**Features:**
- View recent changes (audit logs)
- Create full backups
- Restore from backups
- View backup history

**Props:**
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| onRefresh | function | No | Callback after restore |

---

## 5. Form Components

### Form Field Patterns

All forms use consistent patterns:

```jsx
// Text Input
<div className="form-group">
  <label htmlFor="name">Name</label>
  <input
    type="text"
    id="name"
    value={formData.name}
    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
    required
  />
</div>

// Select
<div className="form-group">
  <label htmlFor="type">Fuel Type</label>
  <select
    id="type"
    value={formData.type}
    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
  >
    <option value="petrol">Petrol</option>
    <option value="diesel">Diesel</option>
    <option value="hybrid">Hybrid</option>
    <option value="electric">Electric</option>
  </select>
</div>

// Checkbox
<div className="form-group checkbox">
  <input
    type="checkbox"
    id="isPerformance"
    checked={formData.isPerformance}
    onChange={(e) => setFormData({ ...formData, isPerformance: e.target.checked })}
  />
  <label htmlFor="isPerformance">Performance Group</label>
</div>
```

---

## 6. Layout Components

### Page Layout Pattern

```jsx
export default function Page() {
  return (
    <div className="page-container">
      <Header />
      <main className="main-content">
        {/* Page content */}
      </main>
      <footer className="footer">
        {/* Footer content */}
      </footer>
    </div>
  );
}
```

### Admin Layout Pattern

```jsx
export default function AdminPage() {
  return (
    <div className="admin-container">
      <Header showAdmin={true} />
      <div className="admin-content">
        <aside className="sidebar">
          {/* Navigation tree */}
        </aside>
        <main className="main-panel">
          {/* Content area */}
        </main>
      </div>
    </div>
  );
}
```

---

## 7. Component Patterns

### Loading State Pattern

```jsx
const [loading, setLoading] = useState(false);

const handleAction = async () => {
  setLoading(true);
  try {
    await performAction();
  } finally {
    setLoading(false);
  }
};

return (
  <button disabled={loading}>
    {loading ? 'Loading...' : 'Submit'}
  </button>
);
```

### Error Handling Pattern

```jsx
const [error, setError] = useState(null);

const handleAction = async () => {
  try {
    setError(null);
    await performAction();
  } catch (err) {
    setError(err.message);
  }
};

return (
  <>
    {error && <div className="error-message">{error}</div>}
    {/* Form content */}
  </>
);
```

### Dialog Pattern

```jsx
const [dialogOpen, setDialogOpen] = useState(false);
const [dialogData, setDialogData] = useState(null);

const openDialog = (data) => {
  setDialogData(data);
  setDialogOpen(true);
};

const closeDialog = () => {
  setDialogOpen(false);
  setDialogData(null);
};

return (
  <>
    <button onClick={() => openDialog(item)}>Edit</button>
    <EditDialog
      isOpen={dialogOpen}
      onClose={closeDialog}
      item={dialogData}
    />
  </>
);
```

### Global Progress Lock Pattern

```jsx
const [globalProgress, setGlobalProgress] = useState(false);

const handleBulkOperation = async () => {
  setGlobalProgress(true);
  try {
    await bulkUpdate();
  } finally {
    setGlobalProgress(false);
  }
};

return (
  <div className={globalProgress ? 'locked' : ''}>
    {globalProgress && <div className="progress-overlay">Processing...</div>}
    {/* Content */}
  </div>
);
```

---

*For function-level documentation, see [FUNCTIONS.md](./FUNCTIONS.md)*

