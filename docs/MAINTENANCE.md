# Maintenance Guide

## System Maintenance for Supreme Tuning

---

## Table of Contents

1. [Maintenance Overview](#1-maintenance-overview)
2. [Daily Tasks](#2-daily-tasks)
3. [Weekly Tasks](#3-weekly-tasks)
4. [Monthly Tasks](#4-monthly-tasks)
5. [Backup Procedures](#5-backup-procedures)
6. [Update Procedures](#6-update-procedures)
7. [Monitoring](#7-monitoring)
8. [Performance Tuning](#8-performance-tuning)
9. [Disaster Recovery](#9-disaster-recovery)
10. [Maintenance Logs](#10-maintenance-logs)

---

## 1. Maintenance Overview

### Maintenance Schedule

| Task | Frequency | Duration | Priority |
|------|-----------|----------|----------|
| Health check | Daily | 5 min | High |
| Log review | Daily | 10 min | Medium |
| Backup verification | Weekly | 15 min | High |
| Dependency updates | Monthly | 30 min | Medium |
| Security audit | Quarterly | 2 hours | High |
| Full system review | Annually | 1 day | High |

### Maintenance Windows

Recommended maintenance windows:
- **Low traffic:** 2:00 AM - 6:00 AM local time
- **Avoid:** Business hours, weekends

---

## 2. Daily Tasks

### Health Check

```bash
# Check application status
curl -s https://yourdomain.com/api/health | jq

# Expected response:
# {"status":"ok","timestamp":"2024-12-18T..."}
```

### Log Review

```bash
# View recent logs (PM2)
pm2 logs --lines 100

# Check for errors
pm2 logs --err --lines 50

# View Nginx access logs
tail -100 /var/log/nginx/access.log

# View Nginx error logs
tail -100 /var/log/nginx/error.log
```

### Quick Status Check

```bash
# Check PM2 status
pm2 status

# Check disk space
df -h

# Check memory usage
free -m

# Check CPU load
uptime
```

---

## 3. Weekly Tasks

### Backup Verification

```bash
# List recent backups
ls -la /path/to/backups/

# Verify backup integrity
mongorestore --dryRun --uri="mongodb://..." ./backup_latest

# Check backup size
du -sh /path/to/backups/*
```

### Database Maintenance

```javascript
// Connect to MongoDB
mongosh "your-connection-string"

// Check collection stats
db.stages.stats()

// Check index usage
db.stages.aggregate([{ $indexStats: {} }])

// Compact collections (if needed)
db.runCommand({ compact: "stages" })
```

### Log Rotation

```bash
# PM2 log rotation (if not automatic)
pm2 flush

# Nginx log rotation
sudo logrotate -f /etc/logrotate.d/nginx
```

### Security Review

```bash
# Check for failed login attempts
grep "FAILED_LOGIN" /var/log/app.log | tail -20

# Check for suspicious activity
grep "401\|403\|500" /var/log/nginx/access.log | tail -50
```

---

## 4. Monthly Tasks

### Dependency Updates

```bash
# Check for outdated packages
npm outdated

# Update packages (minor versions)
npm update

# Update to latest (major versions - test first!)
npm install package@latest
```

### Security Updates

```bash
# Check for vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix

# For breaking changes
npm audit fix --force  # Use with caution
```

### System Updates

```bash
# Update system packages
sudo apt update
sudo apt upgrade -y

# Restart services if needed
sudo systemctl restart nginx
pm2 restart all
```

### Database Cleanup

```javascript
// Remove old audit logs (older than 90 days)
const cutoff = new Date();
cutoff.setDate(cutoff.getDate() - 90);
db.audit_logs.deleteMany({ changedAt: { $lt: cutoff } });

// Remove old backups
db.full_backups.deleteMany({ createdAt: { $lt: cutoff } });
```

### Performance Review

```bash
# Check response times
curl -w "@curl-format.txt" -o /dev/null -s https://yourdomain.com/api/brands

# Check database query times
mongosh --eval "db.setProfilingLevel(1, { slowms: 100 })"
```

---

## 5. Backup Procedures

### Automated Backups

```bash
# Create backup script
cat > /opt/scripts/backup.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/mongodb"
mongodump --uri="$MONGODB_URI" --out="$BACKUP_DIR/backup_$DATE" --gzip
# Keep only last 30 days
find $BACKUP_DIR -type d -mtime +30 -exec rm -rf {} +
EOF

chmod +x /opt/scripts/backup.sh

# Add to crontab (daily at 3 AM)
echo "0 3 * * * /opt/scripts/backup.sh" | crontab -
```

### Manual Backup

```bash
# Full database backup
mongodump --uri="mongodb+srv://..." --out=./backup_$(date +%Y%m%d) --gzip

# Single collection backup
mongodump --uri="mongodb+srv://..." --collection=stages --out=./stages_backup --gzip
```

### Backup Verification

```bash
# Test restore to temporary database
mongorestore --uri="mongodb://localhost:27017" --db=test_restore ./backup_20241218 --gzip

# Verify data
mongosh test_restore --eval "db.brands.count()"

# Clean up test database
mongosh test_restore --eval "db.dropDatabase()"
```

### Backup Retention Policy

| Backup Type | Retention | Storage |
|-------------|-----------|---------|
| Daily | 7 days | Local + Cloud |
| Weekly | 4 weeks | Cloud |
| Monthly | 12 months | Cloud |

---

## 6. Update Procedures

### Application Updates

```bash
# 1. Create backup before update
mongodump --uri="$MONGODB_URI" --out=./pre_update_backup --gzip

# 2. Pull latest code
cd /var/www/supremetuning
git fetch origin
git checkout main
git pull origin main

# 3. Install dependencies
npm ci --production

# 4. Build application
npm run build

# 5. Restart application
pm2 restart supreme-tuning

# 6. Verify health
curl https://yourdomain.com/api/health
```

### Rollback Procedure

```bash
# If update fails, rollback
git checkout <previous-commit>
npm ci --production
npm run build
pm2 restart supreme-tuning

# Restore database if needed
mongorestore --uri="$MONGODB_URI" --drop ./pre_update_backup --gzip
```

### Zero-Downtime Updates

```bash
# Using PM2 reload (graceful restart)
pm2 reload supreme-tuning

# Or use cluster mode
pm2 start ecosystem.config.js --instances max
pm2 reload all
```

---

## 7. Monitoring

### Application Monitoring

```bash
# PM2 monitoring
pm2 monit

# Real-time logs
pm2 logs --raw

# Process metrics
pm2 show supreme-tuning
```

### System Monitoring

```bash
# CPU and memory
htop

# Disk I/O
iotop

# Network
nethogs

# All-in-one
glances
```

### Uptime Monitoring

Set up external monitoring with:
- UptimeRobot (free)
- Pingdom
- StatusCake

**Health Check Endpoint:**
```
GET https://yourdomain.com/api/health
Expected: {"status":"ok"}
```

### Alert Configuration

```bash
# Example: Email alert on high CPU
cat > /opt/scripts/alert.sh << 'EOF'
#!/bin/bash
CPU=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)
if (( $(echo "$CPU > 80" | bc -l) )); then
  echo "High CPU: $CPU%" | mail -s "Alert: High CPU" admin@example.com
fi
EOF
```

---

## 8. Performance Tuning

### Node.js Optimization

```bash
# Increase memory limit
NODE_OPTIONS="--max-old-space-size=4096" npm start

# Enable production mode
NODE_ENV=production npm start
```

### MongoDB Optimization

```javascript
// Create indexes for common queries
db.stages.createIndex({ engineId: 1 });
db.engines.createIndex({ typeId: 1 });
db.types.createIndex({ modelId: 1 });
db.models.createIndex({ groupId: 1 });
db.groups.createIndex({ brandId: 1, isPerformance: 1 });

// Analyze slow queries
db.setProfilingLevel(1, { slowms: 100 });
db.system.profile.find().sort({ ts: -1 }).limit(10);
```

### Nginx Optimization

```nginx
# Enable gzip compression
gzip on;
gzip_types text/plain application/json application/javascript text/css;
gzip_min_length 1000;

# Enable caching
location /api/ {
    proxy_cache_valid 200 1m;
    proxy_cache_use_stale error timeout;
}

# Connection limits
worker_connections 1024;
keepalive_timeout 65;
```

### Caching Strategy

```javascript
// API response caching
return Response.json(data, {
  headers: {
    'Cache-Control': 'public, max-age=60, stale-while-revalidate=300'
  }
});
```

---

## 9. Disaster Recovery

### Recovery Time Objectives

| Scenario | RTO | RPO |
|----------|-----|-----|
| Application crash | 5 min | 0 |
| Server failure | 30 min | 1 hour |
| Database corruption | 1 hour | 24 hours |
| Complete data loss | 4 hours | 24 hours |

### Recovery Procedures

#### Application Crash

```bash
# Restart application
pm2 restart supreme-tuning

# If that fails, restart PM2
pm2 kill
pm2 start ecosystem.config.js
```

#### Server Failure

```bash
# On new server:
# 1. Install dependencies
apt update && apt install -y nodejs npm nginx

# 2. Deploy application
git clone <repo> /var/www/supremetuning
cd /var/www/supremetuning
npm ci --production
npm run build

# 3. Configure and start
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

#### Database Recovery

```bash
# Restore from backup
mongorestore --uri="$MONGODB_URI" --drop ./latest_backup --gzip

# Verify data integrity
mongosh "$MONGODB_URI" --eval "db.brands.count()"
```

### Disaster Recovery Checklist

- [ ] Backup files accessible
- [ ] Recovery scripts tested
- [ ] Contact list updated
- [ ] Documentation current
- [ ] Alternative hosting ready

---

## 10. Maintenance Logs

### Log Template

```markdown
## Maintenance Log - [DATE]

**Performed by:** [Name]
**Duration:** [Start] - [End]
**Type:** [Routine/Emergency/Update]

### Tasks Completed
- [ ] Task 1
- [ ] Task 2

### Issues Found
- Issue description

### Actions Taken
- Action description

### Follow-up Required
- Follow-up item

### Notes
Additional notes
```

### Sample Log Entry

```markdown
## Maintenance Log - 2024-12-18

**Performed by:** Admin
**Duration:** 03:00 - 03:45
**Type:** Routine

### Tasks Completed
- [x] Health check - OK
- [x] Log review - No errors
- [x] Backup verification - OK
- [x] Disk space check - 45% used

### Issues Found
- None

### Actions Taken
- Cleared old logs (>30 days)
- Updated npm packages (minor versions)

### Follow-up Required
- None

### Notes
System running normally. Next maintenance: 2024-12-25
```

---

## Maintenance Contacts

| Role | Contact | Availability |
|------|---------|--------------|
| Primary Admin | admin@example.com | 24/7 |
| Developer | dev@example.com | Business hours |
| Hosting Support | support@host.com | 24/7 |

---

*For troubleshooting, see [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)*

*© 2024 Supreme Tuning. All rights reserved.*

