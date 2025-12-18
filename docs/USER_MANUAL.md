# User Manual

## Complete Guide for Supreme Tuning Admin Panel

**For Non-Technical Users**

---

## Table of Contents

1. [Getting Started](#1-getting-started)
2. [Understanding the Dashboard](#2-understanding-the-dashboard)
3. [Managing Your Data](#3-managing-your-data)
4. [Adding New Items](#4-adding-new-items)
5. [Editing Items](#5-editing-items)
6. [Deleting Items](#6-deleting-items)
7. [Bulk Price Updates](#7-bulk-price-updates)
8. [Moving Items](#8-moving-items)
9. [Backups and History](#9-backups-and-history)
10. [Account Settings](#10-account-settings)
11. [Troubleshooting](#11-troubleshooting)
12. [Glossary](#12-glossary)

---

## 1. Getting Started

### What is Supreme Tuning Admin Panel?

The Supreme Tuning Admin Panel is a web application that helps you manage your car chiptuning business data. You can:

- ✅ Add, edit, and delete car brands, models, and engines
- ✅ Set tuning stage prices and specifications
- ✅ Update prices in bulk (all at once)
- ✅ Move items between categories
- ✅ View change history and restore previous versions

### How to Access

1. Open your web browser (Chrome, Firefox, Safari, or Edge)
2. Go to: `https://yourdomain.com/admin` (or the URL provided by your developer)
3. You will see the login page

### Logging In

1. Enter your **Username** (default: `admin`)
2. Enter your **Password** (provided by your developer)
3. Click the **Login** button
4. You will be taken to the admin dashboard

![Login Screen](images/login.png)

> **Tip:** If you forget your password, contact your developer to reset it.

---

## 2. Understanding the Dashboard

### Main Sections

When you log in, you'll see the admin dashboard with these sections:

```
┌─────────────────────────────────────────────────────────────┐
│  Header: Logo, Navigation, Language Selector                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────┐  ┌─────────────────────────────────┐  │
│  │                 │  │                                 │  │
│  │   Data Tree     │  │      Details Panel              │  │
│  │   (Left Side)   │  │      (Right Side)               │  │
│  │                 │  │                                 │  │
│  │   - Audi        │  │   Shows details of selected     │  │
│  │     - Standard  │  │   item and action buttons       │  │
│  │       - A3      │  │                                 │  │
│  │       - A4      │  │                                 │  │
│  │     - RS        │  │                                 │  │
│  │       - RS3     │  │                                 │  │
│  │   - BMW         │  │                                 │  │
│  │     ...         │  │                                 │  │
│  │                 │  │                                 │  │
│  └─────────────────┘  └─────────────────────────────────┘  │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  Action Buttons: Add, Edit, Delete, Move, Bulk Prices       │
└─────────────────────────────────────────────────────────────┘
```

### The Data Tree (Left Side)

The data tree shows all your data organized like a folder structure:

- **Brand** (e.g., Audi, BMW, Mercedes)
  - **Group** (e.g., Standard, RS, M, AMG)
    - **Model** (e.g., A3, A4, 3 Series)
      - **Generation** (e.g., 8Y - 2020 →)
        - **Engine** (e.g., 35 TFSI 1.5T 150HP)
          - **Stage** (e.g., Stage 1, Stage 2)

### Clicking on Items

- **Click once** on any item to select it
- The details will appear on the right side
- Action buttons will become available

### Icons Meaning

| Icon | Meaning |
|------|---------|
| 🚗 | Brand |
| 📁 | Group |
| 🚙 | Model |
| 📅 | Generation |
| ⚙️ | Engine |
| ⚡ | Stage |
| ✏️ | Edit |
| 🗑️ | Delete |
| ➡️ | Move |
| 💰 | Bulk Prices |

---

## 3. Managing Your Data

### Data Hierarchy Explained

Your data is organized in levels, like a family tree:

```
Brand (Parent)
  └── Group (Child of Brand)
       └── Model (Child of Group)
            └── Generation (Child of Model)
                 └── Engine (Child of Generation)
                      └── Stage (Child of Engine)
```

**Example:**
```
Audi (Brand)
  └── Standard (Group)
       └── A3 (Model)
            └── 8Y - 2020 → (Generation)
                 └── 35 TFSI 1.5T 150HP (Engine)
                      └── Stage 1 (Stage)
                      └── Stage 2 (Stage)
```

### Standard vs Performance Groups

- **Standard Groups:** Regular models (A3, A4, 3 Series)
- **Performance Groups:** High-performance variants (RS, M, AMG)

Standard groups always appear first in lists.

---

## 4. Adding New Items

### Adding a New Brand

1. Click the **"+ Add Brand"** button at the top
2. Enter the brand name (e.g., "Porsche")
3. Click **Save**
4. The new brand appears in the tree

### Adding a New Group

1. Click on a **Brand** in the tree
2. Click **"+ Add Group"** button
3. Enter the group name (e.g., "GT")
4. Check **"Performance Group"** if it's a performance variant
5. Click **Save**

### Adding a New Model

1. Click on a **Group** in the tree
2. Click **"+ Add Model"** button
3. Enter the model name (e.g., "911")
4. Click **Save**

### Adding a New Generation

1. Click on a **Model** in the tree
2. Click **"+ Add Generation"** button
3. Enter the generation name (e.g., "992 - 2019 →")
4. Click **Save**

### Adding a New Engine

1. Click on a **Generation** in the tree
2. Click **"+ Add Engine"** button
3. Fill in the details:
   - **Name:** Engine name (e.g., "Carrera 3.0T")
   - **Code:** Engine code (optional)
   - **Type:** Petrol, Diesel, Hybrid, or Electric
   - **Power:** Stock horsepower (e.g., 385)
   - **Start Year:** When production started
   - **End Year:** When production ended (or "now")
4. Click **Save**

### Adding a New Stage

1. Click on an **Engine** in the tree
2. Click **"+ Add Stage"** button
3. Fill in the details:
   - **Stage Name:** Stage 1, Stage 1+, Stage 2, or Stage 2+
   - **Stock HP:** Original horsepower
   - **Stock Nm:** Original torque
   - **Tuned HP:** Horsepower after tuning
   - **Tuned Nm:** Torque after tuning
   - **Price:** Price in euros
4. Click **Save**

---

## 5. Editing Items

### How to Edit Any Item

1. Click on the item you want to edit in the tree
2. Click the **Edit** button (✏️ pencil icon)
3. A dialog box will open with the current values
4. Make your changes
5. Click **Save**

### What You Can Edit

| Item Type | Editable Fields |
|-----------|-----------------|
| Brand | Name |
| Group | Name, Performance status |
| Model | Name |
| Generation | Name |
| Engine | Name, Code, Type, Power, Years |
| Stage | All power values, Price |

> **Note:** Changes are saved immediately. If you make a mistake, you can use the backup system to restore previous values.

---

## 6. Deleting Items

### ⚠️ Important Warning

When you delete an item, **all items inside it are also deleted!**

For example:
- Deleting a **Brand** deletes all its Groups, Models, Generations, Engines, and Stages
- Deleting a **Model** deletes all its Generations, Engines, and Stages

### How to Delete

1. Click on the item you want to delete
2. Click the **Delete** button (🗑️ trash icon)
3. A confirmation dialog will appear
4. Read the warning carefully
5. Click **Delete** to confirm, or **Cancel** to go back

### Can I Undo a Delete?

Yes! The system keeps a history of all changes. Go to the **Backups** section to restore deleted items.

---

## 7. Bulk Price Updates

### What is Bulk Update?

Bulk update lets you change prices for many items at once. Instead of editing each stage one by one, you can:

- Update all prices for an entire brand
- Update all prices for a specific model
- Update all prices for a generation
- Update all prices for an engine

### How to Use Bulk Update

1. Click the **"Bulk Prices"** button (💰) in the header
2. A dialog will open with step-by-step selection

### Step 1: Choose What to Update

Select the level you want to update:
- **Brand:** Update all stages for all models of a brand
- **Model:** Update all stages for a specific model
- **Generation:** Update all stages for a specific generation
- **Engine:** Update all stages for a specific engine

### Step 2: Select the Items

Use the dropdown menus to select:
1. First, select the **Brand**
2. Then select the **Group** (if needed)
3. Then select the **Model** (if needed)
4. Then select the **Generation** (if needed)
5. Then select the **Engine** (if needed)

### Step 3: Choose Update Type

**Option A: Percentage Change**
- Increase or decrease all prices by a percentage
- Example: Increase all Audi prices by 10%

**Option B: Fixed Price**
- Set the same price for all stages
- Example: Set all stages to €599

**Option C: Per-Stage Prices**
- Set different prices for each stage type
- Example: Stage 1 = €499, Stage 2 = €799

### Step 4: Review and Confirm

1. Review the summary showing what will be updated
2. Click **Update** to apply changes
3. Wait for the operation to complete
4. A success message will show how many stages were updated

### Example: Increase All Audi Prices by 10%

1. Click **Bulk Prices**
2. Select Level: **Brand**
3. Select Brand: **Audi**
4. Select Update Type: **Percentage**
5. Enter: **10** percent
6. Select: **Increase**
7. Click **Update**
8. Result: All Audi stage prices increased by 10%

---

## 8. Moving Items

### What is Moving?

Moving lets you relocate items to different parents. For example:
- Move a model from one group to another
- Move a generation from one model to another
- Move an engine from one generation to another

### How to Move an Item

1. Click on the item you want to move
2. Click the **Move** button (➡️ arrow icon)
3. A dialog will open
4. Select the new location using the dropdown menus
5. Click **Move**

### What Can Be Moved?

| Item Type | Can Move To |
|-----------|-------------|
| Model | Different Group (same or different Brand) |
| Generation | Different Model |
| Engine | Different Generation |

> **Note:** Brands and Groups cannot be moved. Stages are always tied to their engine.

---

## 9. Backups and History

### Viewing Change History

1. Click on **"Backups"** in the header
2. You'll see a list of recent changes
3. Each entry shows:
   - What was changed
   - When it was changed
   - What the old value was
   - What the new value is

### Restoring Previous Values

1. Find the change you want to undo in the history
2. Click **Restore** next to that entry
3. Confirm the restoration
4. The item will be restored to its previous state

### Creating a Full Backup

1. Click **"Create Backup"** button
2. Wait for the backup to complete
3. The backup is saved and can be restored later

### When to Create Backups

- Before making major changes
- Before bulk price updates
- Weekly as a precaution

---

## 10. Account Settings

### Changing Your Password

1. Click on your username in the header
2. Select **"Update Credentials"**
3. Enter your current password
4. Enter your new password
5. Confirm your new password
6. Click **Save**

### Password Requirements

- Minimum 8 characters
- Mix of letters and numbers recommended
- Don't use common words

### Logging Out

1. Click on your username in the header
2. Select **"Logout"**
3. You will be returned to the login page

---

## 11. Troubleshooting

### Common Issues and Solutions

#### "I can't log in"

**Possible causes:**
- Wrong username or password
- Caps Lock is on
- Browser cookies are blocked

**Solutions:**
1. Check that Caps Lock is off
2. Try typing your password in a text editor first to verify
3. Clear your browser cache and cookies
4. Try a different browser

#### "Changes aren't saving"

**Possible causes:**
- Internet connection lost
- Session expired

**Solutions:**
1. Check your internet connection
2. Refresh the page
3. Log out and log back in

#### "I accidentally deleted something"

**Solution:**
1. Go to **Backups**
2. Find the delete action in the history
3. Click **Restore**

#### "The page looks broken on my phone"

**Solution:**
- The admin panel is designed for desktop/laptop use
- For best experience, use a computer with a screen width of at least 1024 pixels
- On very small screens (<380px), use the hamburger menu (☰) for navigation

#### "I see an error message"

**What to do:**
1. Take a screenshot of the error
2. Note what you were doing when it happened
3. Contact your developer with this information

---

## 12. Glossary

### Terms Explained

| Term | Meaning |
|------|---------|
| **Brand** | Car manufacturer (Audi, BMW, Mercedes) |
| **Group** | Category within a brand (Standard, RS, M, AMG) |
| **Model** | Specific car model (A3, 3 Series, C-Class) |
| **Generation** | Version/year range of a model (8Y - 2020 →) |
| **Engine** | Specific engine configuration (35 TFSI 1.5T) |
| **Stage** | Tuning level (Stage 1, Stage 2) |
| **HP** | Horsepower - measure of engine power |
| **Nm** | Newton-meters - measure of torque |
| **Stock** | Original factory specifications |
| **Tuned** | Specifications after chiptuning |
| **Gain** | Difference between tuned and stock values |
| **Bulk Update** | Changing many items at once |
| **Backup** | Saved copy of your data |
| **Restore** | Bringing back a previous version |

### Stage Types

| Stage | Description |
|-------|-------------|
| **Stage 1** | Basic software tune, no hardware changes |
| **Stage 1+** | Enhanced Stage 1 with minor optimizations |
| **Stage 2** | Advanced tune, may require hardware upgrades |
| **Stage 2+** | Maximum tune with significant hardware changes |

### Fuel Types

| Type | Description |
|------|-------------|
| **Petrol** | Gasoline/benzine engine |
| **Diesel** | Diesel engine |
| **Hybrid** | Combined petrol/diesel and electric |
| **Electric** | Fully electric vehicle |

---

## Quick Reference Card

### Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Refresh data | F5 or Ctrl+R |
| Close dialog | Escape |

### Button Colors

| Color | Meaning |
|-------|---------|
| 🟢 Green | Add/Create |
| 🔵 Blue | Edit/Update |
| 🔴 Red | Delete/Danger |
| ⚪ Gray | Cancel/Close |

### Status Indicators

| Indicator | Meaning |
|-----------|---------|
| ⏳ Loading spinner | Operation in progress |
| ✅ Green checkmark | Success |
| ❌ Red X | Error |
| ⚠️ Yellow warning | Caution needed |

---

*For technical support, contact your developer.*

*© 2024 Supreme Tuning. All rights reserved.*

