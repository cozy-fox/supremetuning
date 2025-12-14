# Performance Groups Display & Enhanced Move Functionality

## Summary of Changes

This update implements two major features:
1. **Performance Groups Display in Model Selector** - Shows RS, M, and AMG groups with proper styling
2. **Enhanced Move Functionality** - Allows moving items across ANY brand/group/model/type hierarchy

---

## 1. Performance Groups Display

### Problem
Performance groups (RS, M, AMG) with custom colors, icons, and taglines were not visible in the model selector on brand pages.

### Solution
Updated the brand page and BrandSelector component to load and display groups from the database.

### Files Modified

#### `lib/data.js`
Added helper functions:
- `brandHasGroups(brandId)` - Checks if a brand has performance groups (determines if group selector should be shown)
- `getDefaultGroup(brandId)` - Gets the default/only group for brands without performance divisions

#### `app/[brand]/page.jsx`
- Added imports: `getGroups`, `brandHasGroups`
- Created `getBrandGroupsForClient()` function to serialize groups for client component
- Passes `brandGroups` prop to BrandSelector with:
  - `hasGroups` - Whether to show group selector
  - `groups` - Array of serialized groups with color, icon, tagline
  - `defaultGroupId` - For auto-selecting when no performance groups

#### `app/[brand]/BrandSelector.jsx`
- Added group selection state and UI
- Implements group filtering with API calls to `/api/models?brandId=X&groupId=Y`
- Auto-selects default group for brands without performance divisions
- Displays performance groups with custom styling:
  - **RS (Audi)**: Red (#ff0000), 🏁 icon, "Born on the track" tagline
  - **M (BMW)**: Blue (#0066cc), 🏎️ icon, "The Most Powerful Letter in the World" tagline
  - **AMG (Mercedes)**: Teal (#00d4aa), ⚡ icon, "Driving Performance" tagline

### Group Button Styling
- Performance groups: Dark gradient background with colored border and glow effect when selected
- Standard groups: Simple background with primary color border when selected
- All groups show icon + Zap icon + name for performance groups

---

## 2. Enhanced Move Functionality

### Problem
Move functionality was limited to same-depth moves only:
- Models could only move to groups within the same brand
- Types could only move to models within the same group
- Engines could only move to types within the same model

### Solution
Enhanced move dialogs to allow moving items across the ENTIRE hierarchy.

### Files Modified

#### `app/api/admin/move/route.js`
- Updated documentation to clarify cross-hierarchy support
- Already supported moving to any valid parent (no code changes needed)

#### `app/admin/page.jsx`

**Enhanced Move Dialog Functions:**

1. `openMoveModelDialog(model)` - Move model to ANY group across all brands
   - Fetches ALL groups from database
   - Displays as: "Brand Name → Group Name"
   - Filters out current group

2. `openMoveTypeDialog(type)` - Move type to ANY model across all brands/groups
   - Fetches ALL models from database
   - Displays as: "Brand Name (Group Name) → Model Name"
   - Filters out current model

3. `openMoveEngineDialog(engine)` - Move engine to ANY type across all brands/models
   - Fetches ALL types from database
   - Displays as: "Brand Name → Model Name → Type Name"
   - Filters out current type

**New MoveDialog Component:**
- Searchable dialog with filter input
- Shows count of available destinations
- Displays hierarchical path for each destination
- Responsive design with max height and scrolling
- Clean, modern UI matching admin panel style

### Move Dialog Features
- **Search**: Filter destinations by typing
- **Hierarchical Display**: Shows full path (Brand → Group → Model → Type)
- **Count Display**: Shows total available destinations
- **Responsive**: Adapts to screen size with max 80vh height
- **Smooth UX**: Hover effects and transitions

---

## API Endpoints Used

### Public Endpoints
- `GET /api/groups` - Fetch all groups (or filtered by brandId)
- `GET /api/models?brandId=X&groupId=Y` - Fetch models filtered by group
- `GET /api/types` - Fetch all types
- `GET /api/engines` - Fetch all engines

### Admin Endpoints
- `POST /api/admin/move` - Move items with automatic foreign key updates

---

## Database Schema

### Groups Collection
```javascript
{
  id: int,
  brandId: int,
  name: string,
  slug: string,
  isPerformance: boolean,
  color: string,        // e.g., "#ff0000"
  icon: string,         // e.g., "🏁"
  tagline: string,      // e.g., "Born on the track"
  logo: string,
  order: int
}
```

---

## Testing Checklist

- [ ] Performance groups (RS, M, AMG) display correctly on brand pages
- [ ] Group selection filters models correctly
- [ ] Auto-selection works for brands without performance groups
- [ ] Move model to group in different brand
- [ ] Move type to model in different brand/group
- [ ] Move engine to type in different brand/model
- [ ] Search filter works in move dialog
- [ ] Foreign keys update correctly after moves
- [ ] UI is responsive and accessible

---

## Future Enhancements

1. Add drag-and-drop support for moving items
2. Add bulk move operations
3. Add move history/undo functionality
4. Add validation to prevent circular dependencies

