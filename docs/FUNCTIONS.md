# Functions Reference

## Complete Function Documentation for Supreme Tuning

---

## Table of Contents

1. [Overview](#1-overview)
2. [Database Functions (lib/mongodb.js)](#2-database-functions)
3. [Data Access Functions (lib/data.js)](#3-data-access-functions)
4. [Authentication Functions (lib/auth.js)](#4-authentication-functions)
5. [Backup Functions (lib/backup-service.js)](#5-backup-functions)
6. [Schema Functions (lib/schemas.js)](#6-schema-functions)
7. [Utility Functions](#7-utility-functions)

---

## 1. Overview

### Function Categories

| Category | File | Purpose |
|----------|------|---------|
| Database | `lib/mongodb.js` | MongoDB connection management |
| Data Access | `lib/data.js` | CRUD operations for all entities |
| Authentication | `lib/auth.js` | JWT tokens, password hashing |
| Backup | `lib/backup-service.js` | Audit logs, backups, restore |
| Schema | `lib/schemas.js` | MongoDB schema definitions |

---

## 2. Database Functions

### File: `lib/mongodb.js`

#### getDatabase()

Get MongoDB database instance.

**Signature:**
```javascript
async function getDatabase(): Promise<Db>
```

**Returns:** MongoDB database instance

**Example:**
```javascript
import { getDatabase } from '@/lib/mongodb';

const db = await getDatabase();
const brands = await db.collection('brands').find({}).toArray();
```

**Notes:**
- Uses connection pooling (max 10, min 2)
- Caches connection in development
- Auto-reconnects on failure

---

#### getCollection()

Get a specific MongoDB collection.

**Signature:**
```javascript
async function getCollection(collectionName: string): Promise<Collection>
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| collectionName | string | Name of collection |

**Returns:** MongoDB collection instance

**Example:**
```javascript
import { getCollection } from '@/lib/mongodb';

const brandsCollection = await getCollection('brands');
const allBrands = await brandsCollection.find({}).toArray();
```

---

#### closeConnection()

Close MongoDB connection (for cleanup).

**Signature:**
```javascript
async function closeConnection(): Promise<void>
```

**Example:**
```javascript
import { closeConnection } from '@/lib/mongodb';

// On application shutdown
await closeConnection();
```

---

## 3. Data Access Functions

### File: `lib/data.js`

#### getBrands()

Get all car brands sorted alphabetically.

**Signature:**
```javascript
async function getBrands(): Promise<Brand[]>
```

**Returns:** Array of brand objects

**Example:**
```javascript
import { getBrands } from '@/lib/data';

const brands = await getBrands();
// [{ id: 1, name: "Audi", slug: "audi" }, ...]
```

---

#### getGroups()

Get groups for a brand (Standard first).

**Signature:**
```javascript
async function getGroups(brandId: number): Promise<Group[]>
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| brandId | number | Brand ID |

**Returns:** Array of group objects (Standard groups first)

**Example:**
```javascript
import { getGroups } from '@/lib/data';

const groups = await getGroups(1);
// [{ id: 1, name: "Standard", isPerformance: false }, { id: 2, name: "RS", isPerformance: true }]
```

---

#### getModels()

Get models for a group.

**Signature:**
```javascript
async function getModels(groupId: number): Promise<Model[]>
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| groupId | number | Group ID |

**Returns:** Array of model objects

**Example:**
```javascript
import { getModels } from '@/lib/data';

const models = await getModels(1);
// [{ id: 1, name: "A3", slug: "a3" }, ...]
```

---

#### getTypes()

Get generations/types for a model.

**Signature:**
```javascript
async function getTypes(modelId: number): Promise<Type[]>
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| modelId | number | Model ID |

**Returns:** Array of type/generation objects

**Example:**
```javascript
import { getTypes } from '@/lib/data';

const types = await getTypes(1);
// [{ id: 1, name: "8Y - 2020 →", slug: "8y-2020" }, ...]
```

---

#### getEngines()

Get engines for a generation.

**Signature:**
```javascript
async function getEngines(typeId: number): Promise<Engine[]>
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| typeId | number | Type/Generation ID |

**Returns:** Array of engine objects

**Example:**
```javascript
import { getEngines } from '@/lib/data';

const engines = await getEngines(1);
// [{ id: 1, name: "35 TFSI 1.5T", type: "petrol", power: 150 }, ...]
```

---

#### getStages()

Get tuning stages for an engine.

**Signature:**
```javascript
async function getStages(engineId: number): Promise<Stage[]>
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| engineId | number | Engine ID |

**Returns:** Array of stage objects

**Example:**
```javascript
import { getStages } from '@/lib/data';

const stages = await getStages(1);
// [{ id: 1, stageName: "Stage 1", stockHp: 150, tunedHp: 180, price: 499 }, ...]
```

---

#### findById()

Find a document by ID in any collection.

**Signature:**
```javascript
async function findById(collection: string, id: number): Promise<Document | null>
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| collection | string | Collection name |
| id | number | Document ID |

**Returns:** Document or null if not found

**Example:**
```javascript
import { findById } from '@/lib/data';

const brand = await findById('brands', 1);
// { id: 1, name: "Audi", slug: "audi" }
```

---

#### findBy()

Find documents matching criteria.

**Signature:**
```javascript
async function findBy(collection: string, query: object): Promise<Document[]>
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| collection | string | Collection name |
| query | object | MongoDB query object |

**Returns:** Array of matching documents

**Example:**
```javascript
import { findBy } from '@/lib/data';

const petrolEngines = await findBy('engines', { type: 'petrol' });
```

---

#### insertOne()

Insert a new document.

**Signature:**
```javascript
async function insertOne(collection: string, document: object): Promise<Document>
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| collection | string | Collection name |
| document | object | Document to insert |

**Returns:** Inserted document with generated ID

**Example:**
```javascript
import { insertOne } from '@/lib/data';

const newBrand = await insertOne('brands', { name: 'Porsche', slug: 'porsche' });
// { id: 21, name: "Porsche", slug: "porsche" }
```

---

#### updateById()

Update a document by ID.

**Signature:**
```javascript
async function updateById(collection: string, id: number, updates: object): Promise<Document>
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| collection | string | Collection name |
| id | number | Document ID |
| updates | object | Fields to update |

**Returns:** Updated document

**Example:**
```javascript
import { updateById } from '@/lib/data';

const updated = await updateById('brands', 1, { name: 'Audi AG' });
// { id: 1, name: "Audi AG", slug: "audi" }
```

---

#### deleteById()

Delete a document by ID.

**Signature:**
```javascript
async function deleteById(collection: string, id: number): Promise<boolean>
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| collection | string | Collection name |
| id | number | Document ID |

**Returns:** true if deleted, false if not found

**Example:**
```javascript
import { deleteById } from '@/lib/data';

const deleted = await deleteById('brands', 1);
// true
```

---

#### getData()

Get complete hierarchical data structure.

**Signature:**
```javascript
async function getData(): Promise<DataStructure>
```

**Returns:** Object with all collections

**Example:**
```javascript
import { getData } from '@/lib/data';

const data = await getData();
// { brands: [...], groups: [...], models: [...], types: [...], engines: [...], stages: [...] }
```

---

#### brandHasGroups()

Check if a brand has any groups.

**Signature:**
```javascript
async function brandHasGroups(brandId: number): Promise<boolean>
```

**Example:**
```javascript
import { brandHasGroups } from '@/lib/data';

const hasGroups = await brandHasGroups(1);
// true
```

---

#### getDefaultGroup()

Get or create default "Standard" group for a brand.

**Signature:**
```javascript
async function getDefaultGroup(brandId: number): Promise<Group>
```

**Example:**
```javascript
import { getDefaultGroup } from '@/lib/data';

const standardGroup = await getDefaultGroup(1);
// { id: 1, brandId: 1, name: "Standard", isPerformance: false }
```

---

## 4. Authentication Functions

### File: `lib/auth.js`

#### createToken()

Create a JWT token for a user.

**Signature:**
```javascript
function createToken(payload: object): string
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| payload | object | Data to encode (username, etc.) |

**Returns:** JWT token string (expires in 2 hours)

**Example:**
```javascript
import { createToken } from '@/lib/auth';

const token = createToken({ username: 'admin' });
// "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

#### verifyToken()

Verify and decode a JWT token.

**Signature:**
```javascript
function verifyToken(token: string): object | null
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| token | string | JWT token to verify |

**Returns:** Decoded payload or null if invalid

**Example:**
```javascript
import { verifyToken } from '@/lib/auth';

const payload = verifyToken(token);
// { username: "admin", iat: 1702900000, exp: 1702907200 }
```

---

#### validateCredentials()

Validate username and password.

**Signature:**
```javascript
async function validateCredentials(username: string, password: string): Promise<boolean>
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| username | string | Username to check |
| password | string | Password to verify |

**Returns:** true if valid, false otherwise

**Example:**
```javascript
import { validateCredentials } from '@/lib/auth';

const isValid = await validateCredentials('admin', 'password123');
// true or false
```

---

#### hashPassword()

Hash a password using bcrypt.

**Signature:**
```javascript
async function hashPassword(password: string): Promise<string>
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| password | string | Plain text password |

**Returns:** Hashed password

**Example:**
```javascript
import { hashPassword } from '@/lib/auth';

const hash = await hashPassword('newpassword');
// "$2a$10$..."
```

---

#### requireAdmin()

Middleware to require admin authentication.

**Signature:**
```javascript
async function requireAdmin(request: Request): Promise<{ valid: boolean, username?: string, error?: string }>
```

**Example:**
```javascript
import { requireAdmin } from '@/lib/auth';

export async function POST(request) {
  const auth = await requireAdmin(request);
  if (!auth.valid) {
    return Response.json({ error: auth.error }, { status: 401 });
  }
  // Proceed with admin action
}
```

---

#### saveAdminCredentials()

Save new admin credentials.

**Signature:**
```javascript
async function saveAdminCredentials(username: string, hashedPassword: string): Promise<void>
```

**Example:**
```javascript
import { saveAdminCredentials, hashPassword } from '@/lib/auth';

const hash = await hashPassword('newpassword');
await saveAdminCredentials('newadmin', hash);
```

---

## 5. Backup Functions

### File: `lib/backup-service.js`

#### createAuditLog()

Create an audit log entry for a change.

**Signature:**
```javascript
async function createAuditLog(options: AuditLogOptions): Promise<void>
```

**Parameters:**
| Name | Type | Description |
|------|------|-------------|
| collection | string | Collection name |
| documentId | number | Document ID |
| action | string | create, update, delete, move |
| before | object | State before change |
| after | object | State after change |
| changedBy | string | Username |

**Example:**
```javascript
import { createAuditLog } from '@/lib/backup-service';

await createAuditLog({
  collection: 'stages',
  documentId: 1,
  action: 'update',
  before: { price: 499 },
  after: { price: 549 },
  changedBy: 'admin'
});
```

---

#### getAuditHistory()

Get audit history for a specific document.

**Signature:**
```javascript
async function getAuditHistory(collection: string, documentId: number): Promise<AuditLog[]>
```

**Example:**
```javascript
import { getAuditHistory } from '@/lib/backup-service';

const history = await getAuditHistory('stages', 1);
// [{ action: "update", before: {...}, after: {...}, changedAt: "..." }, ...]
```

---

#### getRecentAuditLogs()

Get recent audit logs across all collections.

**Signature:**
```javascript
async function getRecentAuditLogs(limit?: number): Promise<AuditLog[]>
```

**Parameters:**
| Name | Type | Default | Description |
|------|------|---------|-------------|
| limit | number | 50 | Maximum logs to return |

**Example:**
```javascript
import { getRecentAuditLogs } from '@/lib/backup-service';

const recentChanges = await getRecentAuditLogs(20);
```

---

#### rollbackToVersion()

Rollback a document to a previous version.

**Signature:**
```javascript
async function rollbackToVersion(collection: string, documentId: number, version: number): Promise<Document>
```

**Example:**
```javascript
import { rollbackToVersion } from '@/lib/backup-service';

const restored = await rollbackToVersion('stages', 1, 3);
// Document restored to version 3
```

---

#### createFullBackup()

Create a full database backup using mongodump.

**Signature:**
```javascript
async function createFullBackup(): Promise<BackupInfo>
```

**Returns:** Backup information object

**Example:**
```javascript
import { createFullBackup } from '@/lib/backup-service';

const backup = await createFullBackup();
// { id: "backup_20241218_103000", createdAt: "...", size: 1024000 }
```

---

#### getFullBackups()

Get list of available full backups.

**Signature:**
```javascript
async function getFullBackups(): Promise<BackupInfo[]>
```

**Example:**
```javascript
import { getFullBackups } from '@/lib/backup-service';

const backups = await getFullBackups();
// [{ id: "backup_20241218_103000", createdAt: "..." }, ...]
```

---

## 6. Schema Functions

### File: `lib/schemas.js`

#### getSchema()

Get MongoDB schema for a collection.

**Signature:**
```javascript
function getSchema(collectionName: string): object
```

**Example:**
```javascript
import { getSchema } from '@/lib/schemas';

const stageSchema = getSchema('stages');
// { bsonType: "object", required: [...], properties: {...} }
```

---

#### getIndexes()

Get index definitions for a collection.

**Signature:**
```javascript
function getIndexes(collectionName: string): IndexDefinition[]
```

**Example:**
```javascript
import { getIndexes } from '@/lib/schemas';

const indexes = getIndexes('stages');
// [{ key: { id: 1 }, unique: true }, { key: { engineId: 1 } }]
```

---

## 7. Utility Functions

### Slug Generation

```javascript
function generateSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// Example
generateSlug("Audi A3 Sportback");
// "audi-a3-sportback"
```

### ID Generation

```javascript
async function getNextId(collection) {
  const maxDoc = await collection.find({}).sort({ id: -1 }).limit(1).toArray();
  return maxDoc.length > 0 ? maxDoc[0].id + 1 : 1;
}
```

### Gain Calculation

```javascript
function calculateGains(stockHp, stockNm, tunedHp, tunedNm) {
  return {
    gainHp: tunedHp - stockHp,
    gainNm: tunedNm - stockNm
  };
}

// Example
calculateGains(150, 250, 180, 320);
// { gainHp: 30, gainNm: 70 }
```

---

*For API endpoint documentation, see [API_REFERENCE.md](./API_REFERENCE.md)*

