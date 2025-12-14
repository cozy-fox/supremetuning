# Frontend Updates for Group Management

These files update the frontend calculator project (`F:\work\supreme-tuning`) to use the database-driven group system instead of hardcoded regex filters.

## What Changed

The original system used hardcoded regex patterns in `lib/brandGroups.js` to filter models by name (e.g., models starting with "RS" for Audi RS). 

The new system reads groups from the MongoDB `groups` collection, which allows:
- Dynamic group management via the admin panel
- No code changes needed when adding new performance divisions
- Consistent data structure between admin and frontend

## Files to Copy

Copy these files to your frontend project at `F:\work\supreme-tuning`:

### 1. `lib/data.js`
**Copy to:** `F:\work\supreme-tuning\lib\data.js`

**Changes:**
- Added `getGroups(brandId)` function
- Added `getGroupById(groupId)` function
- Added `brandHasGroups(brandId)` function
- Updated `getModels(brandId, groupId)` to accept optional `groupId` parameter

### 2. `app/api/brand-groups/route.js`
**Copy to:** `F:\work\supreme-tuning\app\api\brand-groups\route.js`

**Changes:**
- Now fetches groups from MongoDB instead of using hardcoded config
- Uses `getGroups()` and `brandHasGroups()` from `lib/data.js`

### 3. `app/api/models/route.js`
**Copy to:** `F:\work\supreme-tuning\app\api\models\route.js`

**Changes:**
- Now filters by actual `groupId` field instead of regex-based filtering
- Uses updated `getModels(brandId, groupId)` function

### 4. `app/[brand]/BrandSelector.jsx`
**Copy to:** `F:\work\supreme-tuning\app\[brand]\BrandSelector.jsx`

**Changes:**
- Uses database group IDs instead of string identifiers ('rs', 'm', 'amg')
- Passes numeric `groupId` to API instead of string identifier

### 5. `app/[brand]/page.jsx`
**Copy to:** `F:\work\supreme-tuning\app\[brand]\page.jsx`

**Changes:**
- Fetches groups from database using `getGroups()` and `brandHasGroups()`
- Removed dependency on `lib/brandGroups.js`

## Files You Can Remove (Optional)

After copying these files, you can optionally remove:
- `F:\work\supreme-tuning\lib\brandGroups.js` - No longer needed

## Quick Copy Commands

Run these commands in PowerShell from the admin project root:

```powershell
# Copy lib/data.js
Copy-Item "frontend-updates\lib\data.js" "F:\work\supreme-tuning\lib\data.js" -Force

# Copy brand-groups API
Copy-Item "frontend-updates\app\api\brand-groups\route.js" "F:\work\supreme-tuning\app\api\brand-groups\route.js" -Force

# Copy models API
Copy-Item "frontend-updates\app\api\models\route.js" "F:\work\supreme-tuning\app\api\models\route.js" -Force

# Copy BrandSelector
Copy-Item "frontend-updates\app\[brand]\BrandSelector.jsx" "F:\work\supreme-tuning\app\[brand]\BrandSelector.jsx" -Force

# Copy brand page
Copy-Item "frontend-updates\app\[brand]\page.jsx" "F:\work\supreme-tuning\app\[brand]\page.jsx" -Force
```

Or use this single batch command:

```cmd
xcopy /Y frontend-updates\* F:\work\supreme-tuning\ /S
```

## Prerequisites

Before these changes will work, you need to:

1. **Create groups in the admin panel:**
   - Login to admin panel
   - Select brand (Audi, BMW, Mercedes)
   - Click "+ Add Group" 
   - Create groups like "RS", "M", "AMG", "Standard"

2. **Assign models to groups:**
   - Use the move functionality or update models to have correct `groupId`
   - Models without `groupId` will show when no group is selected

## Testing

After copying the files:

1. Restart the frontend dev server:
   ```bash
   npm run dev
   ```

2. Navigate to a brand page (e.g., `/audi`)

3. If groups exist in the database, you should see group buttons

4. If no groups exist, the selector will work as before (show all models)

## Troubleshooting

### Groups not showing
- Verify groups exist in MongoDB `groups` collection
- Check that `brandId` matches between groups and brand

### Models not loading for group
- Verify models have `groupId` field set
- Check API response at `/api/models?brandId=1&groupId=2`

### Errors in console
- Check that all 5 files were copied correctly
- Verify MongoDB connection is working
- Check server logs for API errors

