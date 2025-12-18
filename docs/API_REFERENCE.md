# API Reference

## Complete REST API Documentation for Supreme Tuning

---

## Table of Contents

1. [API Overview](#1-api-overview)
2. [Authentication](#2-authentication)
3. [Public Endpoints](#3-public-endpoints)
4. [Admin Endpoints](#4-admin-endpoints)
5. [Error Handling](#5-error-handling)
6. [Rate Limiting](#6-rate-limiting)
7. [Examples](#7-examples)

---

## 1. API Overview

### Base URL

```
Development: http://localhost:3000/api
Production:  https://yourdomain.com/api
```

### Request Format

- **Content-Type:** `application/json`
- **Accept:** `application/json`
- **Character Encoding:** UTF-8

### Response Format

All responses are JSON with the following structure:

```json
// Success Response
{
  "data": { ... },
  "message": "Success message"
}

// Error Response
{
  "error": "Error message",
  "details": "Additional details"
}
```

---

## 2. Authentication

### Login

**POST** `/api/auth/login`

Authenticate and receive JWT token.

**Request:**
```json
{
  "username": "admin",
  "password": "your-password"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "username": "admin"
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"your-password"}'
```

### Verify Token

**GET** `/api/auth/verify`

Verify if current token is valid.

**Headers:**
```
Cookie: auth_token=<jwt-token>
```

**Response:**
```json
{
  "valid": true,
  "username": "admin"
}
```

### Logout

**POST** `/api/auth/logout`

Clear authentication token.

**Response:**
```json
{
  "success": true
}
```

### Update Credentials

**PUT** `/api/auth/update`

Update admin username and/or password.

**Headers:**
```
Cookie: auth_token=<jwt-token>
```

**Request:**
```json
{
  "currentPassword": "current-password",
  "newUsername": "newadmin",
  "newPassword": "new-password"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Credentials updated successfully"
}
```

---

## 3. Public Endpoints

### Get All Brands

**GET** `/api/brands`

Retrieve all car brands.

**Response:**
```json
[
  { "id": 1, "name": "Audi", "slug": "audi" },
  { "id": 2, "name": "BMW", "slug": "bmw" }
]
```

**cURL Example:**
```bash
curl http://localhost:3000/api/brands
```

### Get Groups for Brand

**GET** `/api/groups?brandId={brandId}`

Retrieve groups for a specific brand (Standard first).

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| brandId | number | Yes | Brand ID |

**Response:**
```json
[
  { "id": 1, "brandId": 1, "name": "Standard", "isPerformance": false },
  { "id": 2, "brandId": 1, "name": "RS", "isPerformance": true }
]
```

### Get Models

**GET** `/api/models?groupId={groupId}`

Retrieve models for a specific group.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| groupId | number | Yes | Group ID |

**Response:**
```json
[
  { "id": 1, "brandId": 1, "groupId": 1, "name": "A3", "slug": "a3" }
]
```

### Get Types (Generations)

**GET** `/api/types?modelId={modelId}`

Retrieve generations for a specific model.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| modelId | number | Yes | Model ID |

**Response:**
```json
[
  { "id": 1, "modelId": 1, "brandId": 1, "name": "8Y - 2020 →", "slug": "8y-2020" }
]
```

### Get Engines

**GET** `/api/engines?typeId={typeId}`

Retrieve engines for a specific generation.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| typeId | number | Yes | Type/Generation ID |

**Response:**
```json
[
  {
    "id": 1,
    "typeId": 1,
    "name": "35 TFSI 1.5T",
    "type": "petrol",
    "power": 150,
    "startYear": "2020",
    "endYear": "now"
  }
]
```

### Get Stages

**GET** `/api/stages?engineId={engineId}`

Retrieve tuning stages for a specific engine.

**Parameters:**
| Name | Type | Required | Description |
|------|------|----------|-------------|
| engineId | number | Yes | Engine ID |

**Response:**
```json
[
  {
    "id": 1,
    "engineId": 1,
    "stageName": "Stage 1",
    "stockHp": 150,
    "stockNm": 250,
    "tunedHp": 180,
    "tunedNm": 320,
    "gainHp": 30,
    "gainNm": 70,
    "price": 499,
    "currency": "EUR"
  }
]
```

### Get All Data (Hierarchical)

**GET** `/api/data`

Retrieve complete hierarchical data structure.

**Response:**
```json
{
  "brands": [...],
  "groups": [...],
  "models": [...],
  "types": [...],
  "engines": [...],
  "stages": [...]
}
```

---

## 4. Admin Endpoints

All admin endpoints require authentication via JWT token in cookie.

### Stage Management

#### Create Stage

**POST** `/api/admin/stage`

Create a new tuning stage.

**Request:**
```json
{
  "engineId": 1,
  "stageName": "Stage 1",
  "stockHp": 150,
  "stockNm": 250,
  "tunedHp": 180,
  "tunedNm": 320,
  "price": 499,
  "currency": "EUR"
}
```

**Response:**
```json
{
  "success": true,
  "stage": { "id": 1, ... }
}
```

#### Update Stage

**PUT** `/api/admin/stage`

Update an existing stage.

**Request:**
```json
{
  "id": 1,
  "tunedHp": 185,
  "tunedNm": 330,
  "price": 549
}
```

#### Delete Stage

**DELETE** `/api/admin/stage`

Delete a stage.

**Request:**
```json
{
  "id": 1
}
```

### Bulk Price Update

**PUT** `/api/admin/bulk-price`

Update prices for multiple stages at once.

**Request (Percentage):**
```json
{
  "level": "brand",
  "brandId": 1,
  "updateType": "percentage",
  "percentageValue": 10,
  "percentageDirection": "increase"
}
```

**Request (Fixed Price):**
```json
{
  "level": "model",
  "brandId": 1,
  "groupId": 1,
  "modelId": 1,
  "updateType": "fixed",
  "fixedPrice": 599
}
```

**Request (Per-Stage Prices):**
```json
{
  "level": "engine",
  "brandId": 1,
  "groupId": 1,
  "modelId": 1,
  "generationId": 1,
  "engineId": 1,
  "updateType": "absolute",
  "stagePrices": {
    "Stage 1": 499,
    "Stage 1+": 599,
    "Stage 2": 799,
    "Stage 2+": 999
  }
}
```

**Response:**
```json
{
  "success": true,
  "updatedCount": 24,
  "message": "Updated 24 stages"
}
```

### Move Operations

**POST** `/api/admin/move`

Move items between parents.

**Move Model to Different Group:**
```json
{
  "type": "model",
  "itemId": 1,
  "targetBrandId": 1,
  "targetGroupId": 2
}
```

**Move Generation to Different Model:**
```json
{
  "type": "type",
  "itemId": 1,
  "targetModelId": 2
}
```

**Move Engine to Different Generation:**
```json
{
  "type": "engine",
  "itemId": 1,
  "targetTypeId": 2
}
```

### CRUD Operations

#### Create Brand

**POST** `/api/admin/brand`

```json
{
  "name": "Porsche"
}
```

#### Update Brand

**PUT** `/api/admin/brand`

```json
{
  "id": 1,
  "name": "Audi AG"
}
```

#### Delete Brand

**DELETE** `/api/admin/brand`

```json
{
  "id": 1
}
```

*(Similar endpoints exist for groups, models, types, engines)*

### Backup Operations

#### Get Audit Logs

**GET** `/api/admin/audit-logs`

Retrieve recent change history.

**Response:**
```json
[
  {
    "collection": "stages",
    "documentId": 1,
    "action": "update",
    "before": { "price": 499 },
    "after": { "price": 549 },
    "changedBy": "admin",
    "changedAt": "2024-12-18T10:30:00Z"
  }
]
```

#### Create Full Backup

**POST** `/api/admin/backup`

Create a full database backup.

**Response:**
```json
{
  "success": true,
  "backupId": "backup_20241218_103000",
  "message": "Backup created successfully"
}
```

#### Restore Backup

**POST** `/api/admin/restore`

Restore from a backup.

**Request:**
```json
{
  "backupId": "backup_20241218_103000"
}
```

---

## 5. Error Handling

### HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Not logged in |
| 403 | Forbidden - No permission |
| 404 | Not Found |
| 500 | Internal Server Error |

### Error Response Format

```json
{
  "error": "Error type",
  "message": "Human-readable message",
  "details": "Technical details (development only)"
}
```

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| "Unauthorized" | No/invalid token | Login again |
| "Invalid input" | Missing required fields | Check request body |
| "Not found" | Item doesn't exist | Verify ID |
| "Duplicate entry" | Item already exists | Use different name |

---

## 6. Rate Limiting

Currently no rate limiting is implemented. For production, consider:

- 100 requests/minute for public endpoints
- 1000 requests/minute for authenticated endpoints

---

## 7. Examples

### Complete Workflow: Add New Engine with Stages

```bash
# 1. Login
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password"}' \
  | jq -r '.token')

# 2. Create Engine
curl -X POST http://localhost:3000/api/admin/engine \
  -H "Content-Type: application/json" \
  -H "Cookie: auth_token=$TOKEN" \
  -d '{
    "typeId": 1,
    "name": "40 TFSI 2.0T",
    "type": "petrol",
    "power": 190,
    "startYear": "2020",
    "endYear": "now"
  }'

# 3. Add Stage 1
curl -X POST http://localhost:3000/api/admin/stage \
  -H "Content-Type: application/json" \
  -H "Cookie: auth_token=$TOKEN" \
  -d '{
    "engineId": 2,
    "stageName": "Stage 1",
    "stockHp": 190,
    "stockNm": 320,
    "tunedHp": 245,
    "tunedNm": 400,
    "price": 599
  }'
```

### Bulk Update All Audi Prices by 10%

```bash
curl -X PUT http://localhost:3000/api/admin/bulk-price \
  -H "Content-Type: application/json" \
  -H "Cookie: auth_token=$TOKEN" \
  -d '{
    "level": "brand",
    "brandId": 1,
    "updateType": "percentage",
    "percentageValue": 10,
    "percentageDirection": "increase"
  }'
```

---

*For function-level documentation, see [FUNCTIONS.md](./FUNCTIONS.md)*

