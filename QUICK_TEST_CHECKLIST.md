# Quick Test Checklist - Group Management

## 🎯 What to Test Now

### 1. Login to Admin Panel
- [ ] Navigate to `http://localhost:3000/login`
- [ ] Enter admin credentials
- [ ] Successfully login and see Admin Dashboard

### 2. Open Data Manager
- [ ] Click on "Data Manager" section to expand it
- [ ] You should see the visual editor with Brands list

### 3. Test Group Management

#### A. Select a Brand
- [ ] Click on any brand (e.g., "Audi")
- [ ] **NEW**: Groups section should appear below Brands
- [ ] You should see "Groups - Audi (X)" header
- [ ] You should see "+ Add Group" button

#### B. Add a New Group
- [ ] Click the "+ Add Group" button
- [ ] Dialog should appear asking for group name
- [ ] Enter "RS" as the name
- [ ] Click confirm
- [ ] **Expected**: New "RS" group appears in the list
- [ ] **Expected**: Success toast notification appears

#### C. Add Another Group
- [ ] Click "+ Add Group" again
- [ ] Enter "Standard" as the name
- [ ] Click confirm
- [ ] **Expected**: "Standard" group appears in the list

#### D. Rename a Group
- [ ] Find the "RS" group in the list
- [ ] Click the green edit icon (✏️) next to it
- [ ] Dialog should appear with current name
- [ ] Change name to "RS Performance"
- [ ] Click confirm
- [ ] **Expected**: Group name updates to "RS Performance"
- [ ] **Expected**: Success toast notification

#### E. Select a Group
- [ ] Click on the "RS Performance" group
- [ ] **Expected**: Group becomes highlighted/selected
- [ ] **Expected**: Models section appears below Groups
- [ ] **Expected**: Models are filtered for this group (may be empty if no models assigned yet)

#### F. Delete a Group
- [ ] Click the red trash icon (🗑️) next to "Standard" group
- [ ] **Expected**: Confirmation dialog appears
- [ ] **Expected**: Warning message about cascade deletion
- [ ] Click confirm
- [ ] **Expected**: Group is removed from the list
- [ ] **Expected**: Success message appears

### 4. Test with Multiple Brands

#### Create Groups for BMW
- [ ] Select "BMW" brand
- [ ] Click "+ Add Group"
- [ ] Create "M" group
- [ ] Create "Standard" group
- [ ] Verify both groups appear

#### Create Groups for Mercedes
- [ ] Select "Mercedes" brand
- [ ] Click "+ Add Group"
- [ ] Create "AMG" group
- [ ] Create "Standard" group
- [ ] Verify both groups appear

### 5. Verify Data Persistence
- [ ] Refresh the page
- [ ] Login again
- [ ] Select "Audi" brand
- [ ] **Expected**: Previously created groups still appear
- [ ] **Expected**: Group names are preserved

### 6. Check Browser Console
- [ ] Open browser DevTools (F12)
- [ ] Go to Console tab
- [ ] Look for any errors (red text)
- [ ] **Expected**: No errors, only info logs like "📊 Loaded groups for brand: X"

### 7. Test Performance Group Indicator (Future)
**Note**: This requires manually setting `isPerformance: true` in the database

To test this later:
1. Use MongoDB Compass or Atlas
2. Find the "RS" group in the `groups` collection
3. Set `isPerformance: true`
4. Refresh admin panel
5. **Expected**: ⚡ icon appears next to "RS" group name

## 🐛 Common Issues to Watch For

### Issue: Groups Section Doesn't Appear
**Check:**
- Is a brand selected?
- Check browser console for errors
- Verify API endpoint: `http://localhost:3000/api/groups?brandId=1`

### Issue: "Add Group" Button Does Nothing
**Check:**
- Browser console for JavaScript errors
- Verify brand is selected
- Check if dialog appears but is hidden behind other elements

### Issue: Groups Not Saving
**Check:**
- MongoDB connection in `.env` or `.env.local`
- Server logs for API errors
- Network tab in DevTools for failed requests

### Issue: Delete Doesn't Work
**Check:**
- Confirmation dialog appears
- Server logs for errors
- MongoDB permissions

## ✅ Success Criteria

You've successfully tested the feature if:
- ✅ Groups section appears when brand is selected
- ✅ Can create new groups
- ✅ Can rename groups
- ✅ Can delete groups
- ✅ Groups persist after page refresh
- ✅ No errors in browser console
- ✅ Success toast notifications appear

## 📸 What You Should See

### Before Selecting Brand:
```
Brands
  - Audi
  - BMW
  - Mercedes
  ...
```

### After Selecting Brand (NEW!):
```
Brands
  - Audi (selected)
  - BMW
  - Mercedes

Groups - Audi (2)                    [+ Add Group]
  - RS Performance                   [✏️] [🗑️]
  - Standard                         [✏️] [🗑️]

Models - RS Performance (0)
  (No models yet)
```

## 🎉 Next Steps After Testing

Once you've verified everything works:

1. **Create Performance Groups**:
   - Audi → "RS" group
   - BMW → "M" group
   - Mercedes → "AMG" group

2. **Set Performance Flag** (via MongoDB):
   - Set `isPerformance: true` for RS, M, AMG groups

3. **Start Data Migration**:
   - Move RS models to RS group
   - Move M models to M group
   - Move AMG models to AMG group

4. **Update Frontend Calculator**:
   - Add group selection step
   - Update BrandSelector component

## 📞 Need Help?

If you encounter issues:
1. Check `GROUP_MANAGEMENT_IMPLEMENTATION.md` for overview
2. Check `API_REFERENCE_GROUPS.md` for API details
3. Check `TESTING_GUIDE_GROUPS.md` for detailed scenarios
4. Check browser console and server logs for errors

