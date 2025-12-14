# Testing Guide - Group Management

## Prerequisites

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Ensure MongoDB is Running**
   - Check connection in `.env` or `.env.local`
   - Verify MongoDB Atlas connection or local MongoDB

## Test Scenarios

### Scenario 1: Create a New Group

**Steps:**
1. Navigate to `http://localhost:3000/login`
2. Login with admin credentials
3. Go to Admin Dashboard
4. Click on "Data Manager" to expand
5. Select a brand (e.g., "Audi")
6. You should see the "Groups" section appear
7. Click the "+ Add Group" button
8. Enter group name (e.g., "RS")
9. Click confirm

**Expected Result:**
- New group appears in the Groups list
- Group is saved to database
- Success toast notification appears

**Verify in Database:**
```javascript
// In MongoDB Atlas or Compass
db.groups.find({ brandId: 1 })
```

---

### Scenario 2: Rename a Group

**Steps:**
1. In the Groups list, find the group you want to rename
2. Click the green edit icon (✏️)
3. Enter new name (e.g., "RS Performance")
4. Click confirm

**Expected Result:**
- Group name updates in the list
- Slug is automatically generated (e.g., "rs-performance")
- Success toast notification appears

**Verify:**
- Check that the group name changed in the UI
- Verify slug was updated in database

---

### Scenario 3: Delete a Group (CASCADE)

**Steps:**
1. Create a test group with some models
2. Click the red delete icon (🗑️) on the group
3. Confirm deletion in the dialog

**Expected Result:**
- Confirmation dialog appears with warning
- Group is deleted from list
- All related models, types, engines, stages are deleted (CASCADE)
- Success message shows count of deleted items

**Verify:**
- Group no longer appears in list
- Related models are gone from database
- Check MongoDB for cascade deletion

---

### Scenario 4: Create Performance Group

**Steps:**
1. Select "Audi" brand
2. Click "+ Add Group"
3. Enter "RS" as name
4. After creation, you need to manually set `isPerformance: true` via API or database

**Manual API Test:**
```javascript
// In browser console or Postman
await fetch('/api/admin/group', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_TOKEN'
  },
  body: JSON.stringify({
    id: 1,
    name: 'RS',
    isPerformance: true
  })
});
```

**Expected Result:**
- Group shows ⚡ icon next to name
- `isPerformance` field is true in database

---

### Scenario 5: View Models for a Group

**Steps:**
1. Select a brand
2. Select a group that has models
3. Models section should appear showing only models in that group

**Expected Result:**
- Models list shows only models with matching `groupId`
- Model count is accurate
- Can select models and view types/engines

**Verify:**
```javascript
// Check API response
const models = await fetch('/api/models?groupId=1');
console.log(await models.json());
```

---

### Scenario 6: Move Model to Different Group (Future Feature)

**Note:** Move UI is not yet implemented, but API exists.

**Manual API Test:**
```javascript
await fetch('/api/admin/move', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_TOKEN'
  },
  body: JSON.stringify({
    itemType: 'model',
    itemId: 10,
    targetParentType: 'group',
    targetParentId: 2
  })
});
```

**Expected Result:**
- Model's `groupId` is updated
- Model's `brandId` is updated to match group's brand
- Success message returned

---

## Common Issues & Solutions

### Issue 1: Groups Not Loading
**Symptoms:** Groups section is empty or shows loading spinner forever

**Solutions:**
1. Check browser console for errors
2. Verify API endpoint: `http://localhost:3000/api/groups?brandId=1`
3. Check MongoDB connection
4. Verify groups collection exists and has data

### Issue 2: "Add Group" Button Not Working
**Symptoms:** Clicking button does nothing

**Solutions:**
1. Check browser console for JavaScript errors
2. Verify `addGroup` function is defined
3. Check if brand is selected (required)
4. Verify admin authentication

### Issue 3: Cascade Delete Not Working
**Symptoms:** Group deleted but models remain

**Solutions:**
1. Check server logs for errors
2. Verify MongoDB permissions
3. Check if models have correct `groupId` foreign key
4. Test API endpoint directly

### Issue 4: Performance Icon Not Showing
**Symptoms:** ⚡ icon doesn't appear for performance groups

**Solutions:**
1. Verify `isPerformance` field is `true` in database
2. Check if group data includes `isPerformance` field
3. Refresh the page to reload data

---

## Database Verification Queries

### Check All Groups
```javascript
db.groups.find().pretty()
```

### Check Groups for Specific Brand
```javascript
db.groups.find({ brandId: 1 }).pretty()
```

### Check Models in a Group
```javascript
db.models.find({ groupId: 1 }).pretty()
```

### Verify Cascade Deletion
```javascript
// Before deletion, count related items
db.models.countDocuments({ groupId: 1 })
db.types.countDocuments({ modelId: { $in: [model_ids] } })

// After deletion, verify counts are 0
```

---

## Next Steps After Testing

1. ✅ Verify all CRUD operations work
2. ✅ Test with real Audi/BMW/Mercedes data
3. ⏳ Implement move UI (dropdown to select target parent)
4. ⏳ Add logo upload functionality
5. ⏳ Add drag-drop reordering for groups
6. ⏳ Update frontend calculator to include group selection
7. ⏳ Migrate production data to new structure

