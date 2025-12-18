# Database Documentation

## MongoDB Schema and Operations for Supreme Tuning

---

## Table of Contents

1. [Database Overview](#1-database-overview)
2. [Collections](#2-collections)
3. [Schema Definitions](#3-schema-definitions)
4. [Relationships](#4-relationships)
5. [Indexes](#5-indexes)
6. [Common Queries](#6-common-queries)
7. [Data Migration](#7-data-migration)
8. [Backup and Recovery](#8-backup-and-recovery)
9. [Performance Optimization](#9-performance-optimization)
10. [Maintenance Tasks](#10-maintenance-tasks)

---

## 1. Database Overview

### Database Configuration

| Setting | Value |
|---------|-------|
| **Database Engine** | MongoDB 7.x |
| **Database Name** | supremetuning |
| **Character Set** | UTF-8 |
| **Connection Pool** | 10 (max), 2 (min) |
| **Timeout** | 10s (server), 45s (socket) |

### Connection String Format

```
# MongoDB Atlas
mongodb+srv://<username>:<password>@<cluster>.mongodb.net/?retryWrites=true&w=majority

# Local MongoDB
mongodb://localhost:27017
```

---

## 2. Collections

### Data Collections

| Collection | Description | Document Count |
|------------|-------------|----------------|
| `brands` | Car manufacturers | ~20 |
| `groups` | Performance categories | ~40 |
| `models` | Car models | ~200 |
| `types` | Generations/variants | ~800 |
| `engines` | Engine configurations | ~3000 |
| `stages` | Tuning stages | ~10000 |

### System Collections

| Collection | Description |
|------------|-------------|
| `audit_logs` | Change history tracking |
| `full_backups` | Database snapshots |
| `backups` | Incremental backups |
| `metadata` | Application settings |

---

## 3. Schema Definitions

### brands Collection

```javascript
{
  id: Number,           // Unique identifier (auto-increment)
  name: String,         // Brand name (e.g., "Audi")
  slug: String          // URL-friendly name (e.g., "audi")
}

// Example Document
{
  id: 1,
  name: "Audi",
  slug: "audi"
}
```

### groups Collection

```javascript
{
  id: Number,           // Unique identifier
  brandId: Number,      // Foreign key → brands.id
  name: String,         // Group name (e.g., "RS", "Standard")
  slug: String,         // URL-friendly name
  isPerformance: Boolean, // true for RS, M, AMG
  logo: String,         // Logo file path
  order: Number         // Display order
}

// Example Document
{
  id: 1,
  brandId: 1,
  name: "Standard",
  slug: "standard",
  isPerformance: false,
  logo: null,
  order: 0
}
```

### models Collection

```javascript
{
  id: Number,           // Unique identifier
  brandId: Number,      // Foreign key → brands.id
  groupId: Number,      // Foreign key → groups.id
  name: String,         // Model name (e.g., "A3")
  slug: String          // URL-friendly name
}

// Example Document
{
  id: 1,
  brandId: 1,
  groupId: 1,
  name: "A3",
  slug: "a3"
}
```

### types Collection (Generations)

```javascript
{
  id: Number,           // Unique identifier
  modelId: Number,      // Foreign key → models.id
  brandId: Number,      // Foreign key → brands.id
  brandName: String,    // Denormalized brand name
  modelName: String,    // Denormalized model name
  name: String,         // Generation name (e.g., "8Y - 2020 →")
  slug: String          // URL-friendly name
}

// Example Document
{
  id: 1,
  modelId: 1,
  brandId: 1,
  brandName: "Audi",
  modelName: "A3",
  name: "8Y - 2020 →",
  slug: "8y-2020"
}
```

### engines Collection

```javascript
{
  id: Number,           // Unique identifier
  typeId: Number,       // Foreign key → types.id
  modelId: Number,      // Foreign key → models.id
  code: String,         // Engine code (optional)
  name: String,         // Engine name (e.g., "35 TFSI 1.5T")
  startYear: String,    // Production start year
  endYear: String,      // Production end year or "now"
  type: String,         // Enum: petrol, diesel, hybrid, electric
  power: Number,        // Stock horsepower
  slug: String          // URL-friendly name
}

// Example Document
{
  id: 1,
  typeId: 1,
  modelId: 1,
  code: "DADA",
  name: "35 TFSI 1.5T",
  startYear: "2020",
  endYear: "now",
  type: "petrol",
  power: 150,
  slug: "35-tfsi-1-5t"
}
```

### stages Collection

```javascript
{
  id: Number,           // Unique identifier
  engineId: Number,     // Foreign key → engines.id
  stageName: String,    // Stage name (e.g., "Stage 1", "Stage 2+")
  stockHp: Number,      // Stock horsepower
  stockNm: Number,      // Stock torque (Nm)
  tunedHp: Number,      // Tuned horsepower
  tunedNm: Number,      // Tuned torque (Nm)
  gainHp: Number,       // HP gain (calculated)
  gainNm: Number,       // Nm gain (calculated)
  price: Number,        // Price in cents (€499 = 499)
  currency: String,     // EUR, USD, GBP
  ecuUnlock: Boolean,   // ECU unlock required (BMW)
  cpcUpgrade: Boolean,  // CPC upgrade required (Mercedes)
  hardwareMods: Array,  // Required hardware modifications
  notes: String         // Additional notes
}

// Example Document
{
  id: 1,
  engineId: 1,
  stageName: "Stage 1",
  stockHp: 150,
  stockNm: 250,
  tunedHp: 180,
  tunedNm: 320,
  gainHp: 30,
  gainNm: 70,
  price: 499,
  currency: "EUR",
  ecuUnlock: false,
  cpcUpgrade: false,
  hardwareMods: [],
  notes: ""
}
```

### audit_logs Collection

```javascript
{
  collection: String,   // Collection name that was modified
  documentId: Number,   // ID of modified document
  action: String,       // create, update, delete, move
  before: Object,       // Document state before change
  after: Object,        // Document state after change
  changes: Object,      // Specific fields that changed
  changedBy: String,    // Username who made change
  changedAt: Date,      // Timestamp
  version: Number,      // Version number for document
  metadata: Object      // Additional metadata
}
```

---

## 4. Relationships

### Entity Relationship Diagram

```
┌─────────┐     ┌─────────┐     ┌─────────┐
│ brands  │────<│ groups  │     │         │
│         │     └─────────┘     │         │
│    │    │                     │         │
│    │    │     ┌─────────┐     │         │
│    └────┼────<│ models  │>────┤ groups  │
│         │     └────┬────┘     │         │
└─────────┘          │          └─────────┘
                     │
              ┌──────┴──────┐
              │   types     │
              │(generations)│
              └──────┬──────┘
                     │
              ┌──────┴──────┐
              │   engines   │
              └──────┬──────┘
                     │
              ┌──────┴──────┐
              │   stages    │
              └─────────────┘
```

### Foreign Key Relationships

| Child Collection | Foreign Key | Parent Collection |
|------------------|-------------|-------------------|
| groups | brandId | brands.id |
| models | brandId | brands.id |
| models | groupId | groups.id |
| types | modelId | models.id |
| types | brandId | brands.id |
| engines | typeId | types.id |
| engines | modelId | models.id |
| stages | engineId | engines.id |

---

## 5. Indexes

### Primary Indexes (Unique)

```javascript
// All collections have unique id index
{ id: 1 }  // unique: true
```

### Secondary Indexes

```javascript
// brands
{ name: 1 }
{ slug: 1 }

// groups
{ brandId: 1 }
{ brandId: 1, isPerformance: 1, order: 1 }

// models
{ brandId: 1 }
{ groupId: 1 }
{ brandId: 1, name: 1 }

// types
{ modelId: 1 }
{ brandId: 1 }

// engines
{ typeId: 1 }
{ modelId: 1 }
{ type: 1 }  // fuel type

// stages
{ engineId: 1 }

// audit_logs
{ changedAt: -1 }
{ collection: 1, documentId: 1 }
```

### Creating Indexes

```javascript
// Run in MongoDB shell or use setup script
db.brands.createIndex({ id: 1 }, { unique: true });
db.groups.createIndex({ brandId: 1, isPerformance: 1, order: 1 });
db.models.createIndex({ groupId: 1 });
db.engines.createIndex({ typeId: 1 });
db.stages.createIndex({ engineId: 1 });
```

---

## 6. Common Queries

### Get All Brands (Sorted)

```javascript
db.brands.find({}).sort({ name: 1 })
```

### Get Groups for Brand (Standard First)

```javascript
db.groups.find({ brandId: 1 }).sort({ isPerformance: 1, order: 1 })
```

### Get Models for Group

```javascript
db.models.find({ groupId: 1 }).sort({ name: 1 })
```

### Get Engines by Fuel Type

```javascript
db.engines.find({ typeId: 1, type: "petrol" }).sort({ name: 1 })
```

### Get Stages for Engine

```javascript
db.stages.find({ engineId: 1 }).sort({ id: 1 })
```

### Search Models by Name

```javascript
db.models.find({
  name: { $regex: /a3/i }
}).sort({ name: 1 })
```

### Get Recent Changes

```javascript
db.audit_logs.find({}).sort({ changedAt: -1 }).limit(50)
```

### Count Documents per Collection

```javascript
{
  brands: db.brands.countDocuments(),
  groups: db.groups.countDocuments(),
  models: db.models.countDocuments(),
  types: db.types.countDocuments(),
  engines: db.engines.countDocuments(),
  stages: db.stages.countDocuments()
}
```

---

## 7. Data Migration

### Export Data

```bash
# Export all collections
mongodump --uri="mongodb+srv://..." --db=supremetuning --out=./backup

# Export single collection
mongoexport --uri="mongodb+srv://..." --db=supremetuning --collection=brands --out=brands.json
```

### Import Data

```bash
# Import all collections
mongorestore --uri="mongodb+srv://..." --db=supremetuning ./backup/supremetuning

# Import single collection
mongoimport --uri="mongodb+srv://..." --db=supremetuning --collection=brands --file=brands.json
```

### Migration Script

```bash
# Run migration from JSON to MongoDB
node scripts/migrate-to-mongodb.js
```

---

## 8. Backup and Recovery

### Automatic Backups

The system automatically creates:
- **Audit logs** for every change
- **Incremental backups** before bulk operations
- **Full backups** (manual trigger)

### Create Manual Backup

```bash
# Using mongodump
mongodump --uri="mongodb+srv://..." --db=supremetuning --out=./backup_$(date +%Y%m%d) --gzip
```

### Restore from Backup

```bash
# Using mongorestore
mongorestore --uri="mongodb+srv://..." --db=supremetuning --drop ./backup_20241218/supremetuning --gzip
```

### View Audit Logs

```javascript
// Recent changes
db.audit_logs.find({}).sort({ changedAt: -1 }).limit(20)

// Changes to specific document
db.audit_logs.find({ collection: "stages", documentId: 1 })

// Changes by action type
db.audit_logs.find({ action: "delete" })
```

---

## 9. Performance Optimization

### Query Optimization

```javascript
// Use explain() to analyze queries
db.stages.find({ engineId: 1 }).explain("executionStats")

// Ensure index usage
// "winningPlan.stage" should be "IXSCAN" not "COLLSCAN"
```

### Connection Pooling

```javascript
// MongoDB connection options (lib/mongodb.js)
const options = {
  maxPoolSize: 10,    // Maximum connections
  minPoolSize: 2,     // Minimum connections
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000
};
```

### Data Aggregation

```javascript
// Get stage count per engine
db.stages.aggregate([
  { $group: { _id: "$engineId", count: { $sum: 1 } } },
  { $sort: { count: -1 } }
])
```

---

## 10. Maintenance Tasks

### Database Statistics

```javascript
// Collection stats
db.stages.stats()

// Database stats
db.stats()

// Index usage stats
db.stages.aggregate([{ $indexStats: {} }])
```

### Cleanup Old Audit Logs

```javascript
// Delete logs older than 90 days
const cutoffDate = new Date();
cutoffDate.setDate(cutoffDate.getDate() - 90);
db.audit_logs.deleteMany({ changedAt: { $lt: cutoffDate } })
```

### Compact Collections

```javascript
// Reclaim disk space (run during low traffic)
db.runCommand({ compact: "stages" })
```

### Validate Data Integrity

```javascript
// Check for orphaned stages (no parent engine)
db.stages.aggregate([
  { $lookup: {
      from: "engines",
      localField: "engineId",
      foreignField: "id",
      as: "engine"
  }},
  { $match: { engine: { $size: 0 } } },
  { $project: { id: 1, engineId: 1 } }
])
```

---

*For more details on specific operations, see [FUNCTIONS.md](./FUNCTIONS.md)*

