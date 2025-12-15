# Testing the Production Backup System

## Prerequisites

Before testing, ensure:
1. MongoDB is running and accessible
2. Environment variables are set correctly in `.env.local`:
   ```
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_secret_key
   ADMIN_PASSWORD=your_admin_password
   ```
3. Admin panel is accessible at `/admin`

## Test Scenarios

### 1. Test Full Backup Creation

**Steps:**
1. Navigate to `/admin`
2. Login with admin credentials
3. Expand "Production Backup System" section
4. Click "Load Backups" button
5. Click "Create Full Backup" button
6. Confirm the dialog
7. **Expected**: 
   - Full-screen progress overlay appears
   - Message: "Creating Full Backup"
   - After completion, overlay disappears
   - Success toast appears
   - New backup appears in the list

**Verify:**
- Check MongoDB `full_backups` collection has new entry
- Check backup files exist in the backup directory
- Backup status is "completed"
- Backup size is shown

### 2. Test Audit Logging (Automatic)

**Steps:**
1. In admin panel, expand "Visual Editor"
2. Create a new brand (e.g., "Test Brand")
3. Update the brand name to "Test Brand Updated"
4. Delete the brand
5. Go back to "Production Backup System"
6. Click "Show Change History"

**Expected:**
- See 3 audit log entries:
  1. CREATE action (green) - shows the new brand data
  2. UPDATE action (blue) - shows name change: "Test Brand" → "Test Brand Updated"
  3. DELETE action (red) - shows the deleted brand data

**Verify:**
- Each log has correct timestamp
- Version numbers increment (v1, v2, v3)
- Change diff shows exact field changes
- "changedBy" shows "admin"

### 3. Test Progress Locking

**Steps:**
1. Click "Create Full Backup"
2. Confirm the dialog
3. While progress overlay is showing, try to:
   - Click other buttons
   - Navigate away
   - Interact with the page

**Expected:**
- Full-screen overlay blocks all interactions
- Spinner animation is visible
- Message is clear and informative
- Cannot interact with anything behind overlay
- Overlay disappears when operation completes

### 4. Test Restore from Backup

**Steps:**
1. Create some test data (brands, models, engines)
2. Create a full backup
3. Delete or modify the test data
4. Click "Restore" button on the backup
5. Confirm the warning dialog

**Expected:**
- Progress overlay appears with "Restoring Database" message
- Database is restored to backup state
- Visual editor refreshes with restored data
- Success toast appears
- All data matches the backup

**⚠️ WARNING**: This will replace all current data!

### 5. Test Error Handling

**Test Case A: Invalid Backup**
1. Manually corrupt a backup file or ID
2. Try to restore from it
3. **Expected**: Error message shown, no data loss

**Test Case B: Network Error**
1. Disconnect from MongoDB
2. Try to create backup
3. **Expected**: Error message shown, graceful failure

**Test Case C: Concurrent Operations**
1. Start a full backup
2. While it's running, try to start another
3. **Expected**: Progress overlay prevents second operation

### 6. Test Audit Log Details

**Steps:**
1. Create a brand with multiple fields
2. Update only the name field
3. View change history
4. Expand the UPDATE log entry

**Expected:**
- Only "name" field shows in changes
- Other fields are not listed
- Before value and after value are clearly shown
- Format: `name: "Old Name" → "New Name"`

### 7. Test Backup List Display

**Steps:**
1. Create multiple backups (3-5)
2. View the backup list

**Expected:**
- Backups are numbered (#1, #2, #3...)
- Most recent backup is at the top
- Each shows:
  - Status badge (completed/failed)
  - Timestamp
  - Size in MB
  - Collection counts
  - Restore button (only if completed)

## Performance Tests

### Test Large Dataset Backup

**Setup:**
- Import large dataset (100+ brands, 500+ models, 1000+ engines)

**Test:**
1. Create full backup
2. Measure time taken
3. Check backup file size
4. Verify all data is included

**Expected:**
- Backup completes within reasonable time (< 5 minutes for moderate dataset)
- File size is compressed (gzip)
- All collections are backed up

### Test Audit Log Performance

**Setup:**
- Perform 100+ CRUD operations

**Test:**
1. Load audit logs
2. Check response time
3. Verify all logs are shown

**Expected:**
- Logs load quickly (< 2 seconds)
- Pagination or limit works (default 100)
- No performance degradation

## Edge Cases

### Test 1: Empty Database
- Create backup of empty database
- **Expected**: Backup succeeds, shows 0 documents

### Test 2: Very Long Field Values
- Create item with very long description (10,000+ characters)
- Update it
- Check audit log
- **Expected**: Full values are stored, diff is shown

### Test 3: Nested Objects
- Update nested object field (e.g., `metadata.tags`)
- Check audit log
- **Expected**: Nested changes are tracked

### Test 4: Rapid Changes
- Make 10 rapid updates to same document
- Check audit logs
- **Expected**: All 10 versions are logged (v1-v10)

## Cleanup After Testing

1. Delete test backups:
   - Use MongoDB Compass or CLI
   - Delete from `full_backups` collection
   - Delete backup files from filesystem

2. Clear audit logs:
   ```javascript
   db.audit_logs.deleteMany({ collection: 'brands', documentId: { $in: [test_ids] } })
   ```

3. Remove test data:
   - Delete test brands, models, engines
   - Or restore from a clean backup

## Troubleshooting

### Issue: Backup fails with "mongodump not found"
**Solution**: Install MongoDB Database Tools
- Download from: https://www.mongodb.com/try/download/database-tools
- Add to system PATH

### Issue: Progress overlay doesn't appear
**Solution**: Check ProgressContext is properly wrapped in layout.jsx

### Issue: Audit logs not created
**Solution**: 
- Check `lib/data.js` has audit logging code
- Verify MongoDB connection
- Check `audit_logs` collection exists

### Issue: Restore fails
**Solution**:
- Check backup files exist
- Verify MongoDB connection string
- Check file permissions

## Success Criteria

✅ All tests pass  
✅ No data loss during restore  
✅ Audit logs accurately track changes  
✅ Progress overlay prevents concurrent operations  
✅ Error messages are clear and helpful  
✅ Performance is acceptable for production use  

---

**Next Steps After Testing:**
1. Fix any issues found
2. Test with production-like data volume
3. Set up scheduled backups (optional)
4. Configure backup retention policy
5. Deploy to production

