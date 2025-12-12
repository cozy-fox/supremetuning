# MongoDB Migration Guide

This guide will help you migrate from local JSON file storage to MongoDB Atlas.

## 🎯 Benefits of MongoDB

- ✅ **Scalability** - Handle millions of records
- ✅ **Performance** - Indexed queries for fast lookups
- ✅ **Reliability** - Automatic backups and replication
- ✅ **Cloud-based** - Access from anywhere
- ✅ **Concurrent access** - Multiple users can edit simultaneously
- ✅ **Better backup system** - Stored in database, not local files

---

## 📋 Prerequisites

1. MongoDB Atlas account (free tier available)
2. Database cluster created
3. Database user with read/write permissions
4. Network access configured (allow your IP or 0.0.0.0/0 for all)

---

## 🚀 Migration Steps

### Step 1: Get MongoDB Connection String

1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Navigate to your cluster: `693ad3dcec77d22caaaf477b`
3. Click "Connect" → "Connect your application"
4. Copy the connection string (looks like):
   ```
   mongodb+srv://<username>:<password>@cluster0.mongodb.net/?retryWrites=true&w=majority
   ```

### Step 2: Update Environment Variables

1. Open `.env` file in the project root
2. Add your MongoDB connection string:
   ```env
   MONGODB_URI=mongodb+srv://your-username:your-password@cluster0.mongodb.net/supremetuning?retryWrites=true&w=majority
   MONGODB_DB=supremetuning
   ```
3. Replace `<username>` and `<password>` with your actual credentials

### Step 3: Run Migration Script

```bash
node scripts/migrate-to-mongodb.js
```

This will:
- ✅ Read data from `data/supreme-tuning-master.json`
- ✅ Connect to MongoDB Atlas
- ✅ Create collections and indexes
- ✅ Insert all data into MongoDB
- ✅ Verify the migration

### Step 4: Switch to MongoDB Data Layer

1. **Backup current data layer:**
   ```bash
   mv lib/data.js lib/data-json.js
   ```

2. **Activate MongoDB data layer:**
   ```bash
   mv lib/data-mongodb.js lib/data.js
   ```

3. **Restart your application:**
   ```bash
   npm run dev
   ```

### Step 5: Verify Migration

1. Open your application in the browser
2. Navigate through brands, models, engines
3. Check admin panel - all data should be visible
4. Try editing data to ensure save works
5. Check MongoDB Atlas to see the data

---

## 📊 MongoDB Collections Structure

Your database will have these collections:

### `brands`
```javascript
{
  id: 1,
  name: "Audi"
}
```
**Indexes:** `id` (unique), `name`

### `models`
```javascript
{
  id: 1,
  brandId: 1,
  name: "A3"
}
```
**Indexes:** `id` (unique), `brandId`

### `types`
```javascript
{
  id: 1,
  modelId: 1,
  brandId: 1,
  brandName: "Audi",
  modelName: "A3",
  name: "8P - 2003-2012"
}
```
**Indexes:** `id` (unique), `modelId`, `brandId`

### `engines`
```javascript
{
  id: 1,
  typeId: 1,
  modelId: 1,
  code: "CBZB",
  name: "1.4 TSI",
  startYear: 2008,
  endYear: 2012,
  type: "Benzine",
  power: 122,
  description: "1.4 TSI 122hp"
}
```
**Indexes:** `id` (unique), `typeId`, `modelId`

### `stages`
```javascript
{
  id: 1,
  engineId: 1,
  stageName: "Stage 1",
  stockHp: 122,
  stockNm: 200,
  tunedHp: 160,
  tunedNm: 260,
  price: 399,
  features: ["ECU Remapping", "+38 HP", "+60 NM"]
}
```
**Indexes:** `id` (unique), `engineId`

### `backups`
```javascript
{
  _id: ObjectId("..."),
  timestamp: "2025-12-11T10:30:45.123Z",
  createdAt: ISODate("2025-12-11T10:30:45.123Z"),
  data: {
    brands: [...],
    models: [...],
    types: [...],
    engines: [...],
    stages: [...]
  }
}
```
**Indexes:** `timestamp` (descending)

---

## 🔄 Rollback (If Needed)

If you need to go back to JSON file storage:

```bash
# Restore original data layer
mv lib/data.js lib/data-mongodb-backup.js
mv lib/data-json.js lib/data.js

# Restart application
npm run dev
```

---

## ✨ New Features with MongoDB

### 1. Automatic Backups
- Backups stored in MongoDB `backups` collection
- Automatic cleanup (keeps last 50 backups)
- Restore from any backup via admin panel

### 2. Better Performance
- Indexed queries for fast lookups
- Optimized for large datasets
- Concurrent access support

### 3. ID Re-ordering
- Automatic ID re-ordering after deletions
- Foreign key updates handled automatically
- Clean, sequential IDs maintained

### 4. Cascade Delete
- Delete brand → removes all models, types, engines, stages
- Delete model → removes all types, engines, stages
- Delete type → removes all engines, stages
- Delete engine → removes all stages

---

## 🛠️ Troubleshooting

### Connection Error
```
Error: MongoServerError: bad auth
```
**Solution:** Check username/password in connection string

### Network Error
```
Error: connect ETIMEDOUT
```
**Solution:** Add your IP to MongoDB Atlas Network Access

### Duplicate Key Error
```
Error: E11000 duplicate key error
```
**Solution:** Drop collections and re-run migration

---

## 📞 Support

If you encounter issues:
1. Check MongoDB Atlas connection string
2. Verify network access settings
3. Check database user permissions
4. Review migration script output for errors

---

**Ready to migrate? Run:** `node scripts/migrate-to-mongodb.js`

