# Troubleshooting Guide

## Common Issues and Solutions for Supreme Tuning

---

## Table of Contents

1. [Installation Issues](#1-installation-issues)
2. [Database Issues](#2-database-issues)
3. [Authentication Issues](#3-authentication-issues)
4. [Application Errors](#4-application-errors)
5. [Performance Issues](#5-performance-issues)
6. [UI/Display Issues](#6-uidisplay-issues)
7. [API Errors](#7-api-errors)
8. [Deployment Issues](#8-deployment-issues)
9. [Data Issues](#9-data-issues)
10. [Error Messages Reference](#10-error-messages-reference)

---

## 1. Installation Issues

### Issue: "npm install" fails

**Symptoms:**
- Error messages during `npm install`
- Missing dependencies

**Solutions:**

```bash
# Solution 1: Clear npm cache
npm cache clean --force
rm -rf node_modules package-lock.json
npm install

# Solution 2: Use legacy peer deps
npm install --legacy-peer-deps

# Solution 3: Check Node.js version
node --version  # Should be 18.x or higher
```

---

### Issue: "Module not found" errors

**Symptoms:**
- `Cannot find module 'xyz'`
- Import errors

**Solutions:**

```bash
# Reinstall dependencies
rm -rf node_modules
npm install

# Check if module is in package.json
cat package.json | grep "module-name"

# Install missing module
npm install module-name
```

---

### Issue: Sharp module errors

**Symptoms:**
- `Error: Could not load the "sharp" module`
- Image processing failures

**Solutions:**

```bash
# Reinstall sharp
npm uninstall sharp
npm install sharp

# On Windows, you may need:
npm install --platform=win32 sharp
```

---

## 2. Database Issues

### Issue: Cannot connect to MongoDB

**Symptoms:**
- `MongoServerSelectionError`
- `Connection refused`
- Timeout errors

**Solutions:**

```bash
# Check if MongoDB is running (local)
# Windows:
net start MongoDB

# Linux/Mac:
sudo systemctl status mongod

# Test connection string
mongosh "your-connection-string"
```

**For MongoDB Atlas:**
1. Check IP whitelist in Atlas dashboard
2. Verify username/password
3. Check network/firewall settings

---

### Issue: "MONGODB_URI is not defined"

**Symptoms:**
- Application crashes on startup
- Environment variable errors

**Solutions:**

```bash
# Check .env.local exists
ls -la .env.local

# Verify content
cat .env.local | grep MONGODB_URI

# Restart the server after changes
npm run dev
```

---

### Issue: Database queries are slow

**Symptoms:**
- Long loading times
- Timeout errors

**Solutions:**

```javascript
// Check if indexes exist
db.stages.getIndexes()

// Create missing indexes
db.stages.createIndex({ engineId: 1 })
db.engines.createIndex({ typeId: 1 })
```

---

## 3. Authentication Issues

### Issue: "Invalid token" or "Unauthorized"

**Symptoms:**
- Redirected to login page
- 401 errors

**Solutions:**

```javascript
// Clear browser localStorage
localStorage.clear()

// Clear cookies
document.cookie.split(";").forEach(c => {
  document.cookie = c.replace(/^ +/, "")
    .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
});
```

Then log in again.

---

### Issue: Cannot log in with correct password

**Symptoms:**
- "Invalid credentials" error
- Login fails

**Solutions:**

```bash
# Reset admin password via script
node -e "
const bcrypt = require('bcryptjs');
const hash = bcrypt.hashSync('newpassword', 10);
console.log('New hash:', hash);
// Update in database manually
"
```

---

### Issue: JWT_SECRET errors

**Symptoms:**
- Token verification fails
- `JsonWebTokenError`

**Solutions:**

```bash
# Generate new secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Update .env.local
JWT_SECRET=your-new-secret-here

# Restart server
npm run dev
```

---

## 4. Application Errors

### Issue: "Hydration failed" error

**Symptoms:**
- React hydration mismatch
- Console errors about server/client mismatch

**Solutions:**

```jsx
// Wrap dynamic content in useEffect
const [mounted, setMounted] = useState(false);
useEffect(() => setMounted(true), []);
if (!mounted) return null;
```

---

### Issue: "Cannot read property of undefined"

**Symptoms:**
- JavaScript errors
- Blank page or broken UI

**Solutions:**

```jsx
// Add null checks
const value = data?.property?.nested ?? 'default';

// Check if data exists before rendering
{data && <Component data={data} />}
```

---

### Issue: API routes return 500 error

**Symptoms:**
- Internal server error
- API calls fail

**Solutions:**

```bash
# Check server logs
npm run dev
# Look for error messages in terminal

# Add error logging to API route
try {
  // ... code
} catch (error) {
  console.error('API Error:', error);
  return Response.json({ error: error.message }, { status: 500 });
}
```

---

## 5. Performance Issues

### Issue: Slow page load times

**Symptoms:**
- Pages take >3 seconds to load
- Spinner shows for long time

**Solutions:**

1. **Check database indexes:**
```javascript
// Ensure indexes exist
db.stages.createIndex({ engineId: 1 })
db.engines.createIndex({ typeId: 1 })
db.types.createIndex({ modelId: 1 })
```

2. **Check network latency:**
```bash
# Test MongoDB connection speed
time mongosh "your-connection-string" --eval "db.brands.findOne()"
```

3. **Enable caching:**
```javascript
// Add cache headers to API responses
return Response.json(data, {
  headers: { 'Cache-Control': 'max-age=60' }
});
```

---

### Issue: Memory usage too high

**Symptoms:**
- Server crashes
- Out of memory errors

**Solutions:**

```bash
# Increase Node.js memory limit
NODE_OPTIONS="--max-old-space-size=4096" npm start

# Check for memory leaks
node --inspect npm run dev
# Use Chrome DevTools to profile
```

---

## 6. UI/Display Issues

### Issue: Page looks broken on mobile

**Symptoms:**
- Elements overflow
- Text too small
- Buttons not clickable

**Solutions:**

The admin panel is optimized for desktop. For mobile:
- Use landscape orientation
- Zoom out if needed
- For screens <380px, use hamburger menu

---

### Issue: Dialogs not appearing

**Symptoms:**
- Click button but nothing happens
- Dialog doesn't open

**Solutions:**

```javascript
// Check browser console for errors
// Press F12 → Console tab

// Check if dialog state is correct
console.log('Dialog state:', dialogOpen);
```

---

### Issue: Data not refreshing

**Symptoms:**
- Changes not visible
- Old data showing

**Solutions:**

1. Click the **Refresh** button
2. Press F5 to reload page
3. Clear browser cache (Ctrl+Shift+Delete)

---

## 7. API Errors

### Error: 400 Bad Request

**Cause:** Invalid input data

**Solution:**
```javascript
// Check request body format
// Ensure all required fields are present
{
  "name": "Required field",
  "id": 123  // Must be number, not string
}
```

---

### Error: 401 Unauthorized

**Cause:** Not logged in or token expired

**Solution:**
1. Log out
2. Log back in
3. Check if cookies are enabled

---

### Error: 404 Not Found

**Cause:** Resource doesn't exist

**Solution:**
```javascript
// Verify the ID exists
const item = await findById('collection', id);
if (!item) {
  // Handle not found
}
```

---

### Error: 500 Internal Server Error

**Cause:** Server-side error

**Solution:**
1. Check server logs
2. Look for stack trace
3. Fix the underlying issue

---

## 8. Deployment Issues

### Issue: Build fails

**Symptoms:**
- `npm run build` errors
- Type errors

**Solutions:**

```bash
# Check for TypeScript errors
npm run lint

# Build with verbose output
npm run build 2>&1 | tee build.log
```

---

### Issue: Production server won't start

**Symptoms:**
- `npm start` fails
- Port already in use

**Solutions:**

```bash
# Check if port is in use
netstat -ano | findstr :3000

# Use different port
PORT=3001 npm start

# Kill process on port
# Windows:
taskkill /PID <pid> /F
# Linux:
kill -9 <pid>
```

---

### Issue: SSL certificate errors

**Symptoms:**
- HTTPS not working
- Certificate warnings

**Solutions:**

```bash
# Renew Let's Encrypt certificate
sudo certbot renew

# Check certificate status
sudo certbot certificates
```

---

## 9. Data Issues

### Issue: Duplicate IDs

**Symptoms:**
- Unique constraint errors
- Data conflicts

**Solutions:**

```javascript
// Find duplicates
db.stages.aggregate([
  { $group: { _id: "$id", count: { $sum: 1 } } },
  { $match: { count: { $gt: 1 } } }
])

// Fix by reassigning IDs
```

---

### Issue: Orphaned records

**Symptoms:**
- Stages without engines
- Engines without types

**Solutions:**

```javascript
// Find orphaned stages
db.stages.aggregate([
  { $lookup: {
      from: "engines",
      localField: "engineId",
      foreignField: "id",
      as: "engine"
  }},
  { $match: { engine: { $size: 0 } } }
])

// Delete orphaned records
db.stages.deleteMany({ engineId: { $nin: engineIds } })
```

---

### Issue: Data corruption

**Symptoms:**
- Invalid data values
- Missing fields

**Solutions:**

1. Restore from backup
2. Manually fix data
3. Run validation script

---

## 10. Error Messages Reference

### Common Error Messages

| Error Message | Cause | Solution |
|---------------|-------|----------|
| `ECONNREFUSED` | Database not running | Start MongoDB |
| `ETIMEDOUT` | Network timeout | Check connection |
| `ENOTFOUND` | DNS resolution failed | Check hostname |
| `EACCES` | Permission denied | Check file permissions |
| `ENOMEM` | Out of memory | Increase memory limit |

### MongoDB Errors

| Error Code | Meaning | Solution |
|------------|---------|----------|
| 11000 | Duplicate key | Use unique value |
| 121 | Document validation failed | Check schema |
| 13 | Unauthorized | Check credentials |

### HTTP Status Codes

| Code | Meaning | Action |
|------|---------|--------|
| 200 | Success | None needed |
| 400 | Bad request | Check input |
| 401 | Unauthorized | Log in again |
| 403 | Forbidden | Check permissions |
| 404 | Not found | Verify resource exists |
| 500 | Server error | Check logs |

---

## Getting Help

If you can't resolve an issue:

1. **Collect information:**
   - Error message (exact text)
   - Steps to reproduce
   - Browser and version
   - Screenshots

2. **Check logs:**
   - Browser console (F12)
   - Server terminal output
   - MongoDB logs

3. **Contact support:**
   - Provide all collected information
   - Include relevant code snippets
   - Describe what you expected vs what happened

---

*For additional help, see [MAINTENANCE.md](./MAINTENANCE.md)*

