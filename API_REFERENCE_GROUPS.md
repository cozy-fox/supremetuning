# Group Management API Reference

## Public Endpoints

### GET /api/groups
Fetch all groups for a brand.

**Query Parameters:**
- `brandId` (optional) - Filter groups by brand ID

**Example Request:**
```javascript
const groups = await fetch('/api/groups?brandId=1');
```

**Example Response:**
```json
[
  {
    "id": 1,
    "brandId": 1,
    "name": "RS",
    "slug": "rs",
    "isPerformance": true,
    "logo": "/assets/audi-rs-logo.png",
    "order": 0
  },
  {
    "id": 2,
    "brandId": 1,
    "name": "Standard",
    "slug": "standard",
    "isPerformance": false,
    "logo": null,
    "order": 1
  }
]
```

---

## Admin Endpoints (Protected)

### POST /api/admin/group
Create a new group.

**Request Body:**
```json
{
  "brandId": 1,
  "name": "RS",
  "isPerformance": true,
  "logo": "/assets/audi-rs-logo.png",
  "order": 0
}
```

**Required Fields:**
- `brandId` (int)
- `name` (string)

**Optional Fields:**
- `isPerformance` (boolean) - Default: false
- `logo` (string) - Default: null
- `order` (int) - Default: 0

**Response:**
```json
{
  "message": "Group created successfully",
  "group": {
    "id": 1,
    "brandId": 1,
    "name": "RS",
    "slug": "rs",
    "isPerformance": true,
    "logo": "/assets/audi-rs-logo.png",
    "order": 0
  }
}
```

---

### PUT /api/admin/group
Update an existing group.

**Request Body:**
```json
{
  "id": 1,
  "name": "RS Performance",
  "isPerformance": true,
  "logo": "/assets/new-logo.png",
  "order": 0
}
```

**Required Fields:**
- `id` (int)
- `name` (string)

**Optional Fields:**
- `isPerformance` (boolean)
- `logo` (string)
- `order` (int)

**Response:**
```json
{
  "message": "Group updated successfully",
  "group": {
    "id": 1,
    "name": "RS Performance",
    "slug": "rs-performance",
    "isPerformance": true,
    "logo": "/assets/new-logo.png",
    "order": 0
  }
}
```

---

### DELETE /api/admin/group?id=xxx
Delete a group and all related data (CASCADE).

**Query Parameters:**
- `id` (required) - Group ID to delete

**Example Request:**
```javascript
await fetch('/api/admin/group?id=1', {
  method: 'DELETE',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN'
  }
});
```

**Response:**
```json
{
  "message": "Group and all related data deleted successfully",
  "deleted": {
    "groups": 1,
    "models": 5,
    "types": 15,
    "engines": 30,
    "stages": 90
  }
}
```

**Cascade Deletion Order:**
1. Stages (for all engines in all types in all models in group)
2. Engines (for all types in all models in group)
3. Types (for all models in group)
4. Models (in group)
5. Group

---

### POST /api/admin/move
Move an item to a different parent (same level only).

**Request Body:**
```json
{
  "itemType": "model",
  "itemId": 10,
  "targetParentType": "group",
  "targetParentId": 2
}
```

**Valid Moves:**
- `model` → `group` or `brand`
- `type` → `model`
- `engine` → `type`

**Example: Move Model to Different Group**
```json
{
  "itemType": "model",
  "itemId": 10,
  "targetParentType": "group",
  "targetParentId": 2
}
```

**Example: Move Engine to Different Type**
```json
{
  "itemType": "engine",
  "itemId": 50,
  "targetParentType": "type",
  "targetParentId": 15
}
```

**Response:**
```json
{
  "message": "model moved successfully",
  "itemType": "model",
  "itemId": 10,
  "targetParentType": "group",
  "targetParentId": 2,
  "updateData": {
    "groupId": 2,
    "brandId": 1
  }
}
```

**Note:** The API automatically updates related foreign keys:
- Moving model to group → updates `groupId` and `brandId`
- Moving type to model → updates `modelId` and `brandId`, cascades to engines
- Moving engine to type → updates `typeId` and `modelId`

---

## Error Responses

All endpoints return standard error responses:

```json
{
  "message": "Error description",
  "error": "Detailed error message"
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `400` - Bad Request (missing required fields, invalid move)
- `401` - Unauthorized (admin endpoints only)
- `500` - Internal Server Error

