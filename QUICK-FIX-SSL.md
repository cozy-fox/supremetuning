# 🔧 Quick Fix: SSL Certificate Error on Deployment

## Problem

You're seeing this error during deployment:
```
nginx: [emerg] cannot load certificate "/etc/nginx/ssl/cert.pem": 
BIO_new_file() failed (SSL: error:80000002:system library::No such file or directory
```

## Root Cause

The nginx container is trying to load SSL certificates that don't exist yet.

---

## ✅ Solution 1: Automatic Fix (Recommended)

The deployment workflow now **automatically generates SSL certificates** before starting containers.

### Just push your code:

```bash
git add .
git commit -m "Fix SSL deployment"
git push origin main
```

The GitHub Actions workflow will:
1. ✅ Detect your EC2 public IP
2. ✅ Generate SSL certificates automatically
3. ✅ Start nginx with HTTPS enabled
4. ✅ Display your access URL

---

## ✅ Solution 2: Manual Fix (If needed)

If you need to fix it manually on your EC2 instance:

### SSH to your EC2 instance:

```bash
ssh -i your-key.pem ubuntu@YOUR_EC2_IP
cd /path/to/supreme-tuning
```

### Run the fix script:

```bash
chmod +x scripts/fix-ssl-deployment.sh
./scripts/fix-ssl-deployment.sh
```

This script will:
- Detect your EC2 IP automatically
- Generate SSL certificates
- Restart containers
- Test HTTPS connection
- Display access information

---

## ✅ Solution 3: Quick Manual Commands

If you prefer to run commands manually:

```bash
# 1. Navigate to project directory
cd /path/to/supreme-tuning

# 2. Get your EC2 public IP
EC2_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)
echo "Your IP: $EC2_IP"

# 3. Generate SSL certificates
mkdir -p ssl
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout ssl/key.pem \
    -out ssl/cert.pem \
    -subj "/C=NL/ST=Netherlands/L=Amsterdam/O=Supreme Tuning/OU=IT/CN=$EC2_IP" \
    -addext "subjectAltName=DNS:localhost,IP:127.0.0.1,IP:$EC2_IP"

# 4. Set permissions
chmod 644 ssl/cert.pem
chmod 600 ssl/key.pem

# 5. Restart containers
docker compose down
docker compose up -d

# 6. Check status
docker compose ps
docker compose logs nginx
```

---

## Accessing Your Application

After the fix, access your application at:

```
https://YOUR_EC2_PUBLIC_IP
```

### ⚠️ You will see a browser security warning

This is **normal and expected** for self-signed certificates!

**To proceed:**
1. Click **"Advanced"**
2. Click **"Proceed to [IP] (unsafe)"**
3. Your site will load with HTTPS

---

## Verifying the Fix

### Check if certificates exist:
```bash
ls -la ssl/
```

You should see:
- `cert.pem` (644 permissions)
- `key.pem` (600 permissions)

### Check nginx is running:
```bash
docker compose ps
```

You should see `supreme-nginx` with status "Up"

### Check nginx logs:
```bash
docker compose logs nginx
```

Should NOT show certificate errors

### Test HTTPS:
```bash
curl -k -I https://localhost
```

Should return HTTP 200 or 301

---

## What Changed

### ✅ GitHub Actions Workflow (`.github/workflows/deploy.yml`)
- Added automatic SSL certificate generation step
- Detects EC2 public IP automatically
- Generates certificates before starting containers
- Displays access information after deployment

### ✅ Docker Compose (`docker-compose.yml`)
- Removed exposed port 3000 (all traffic through nginx)
- Updated default SITE_URL to use HTTPS

### ✅ New Files Created
- `scripts/fix-ssl-deployment.sh` - Manual fix script
- `AWS-DEPLOYMENT-HTTPS.md` - Complete AWS HTTPS guide
- `QUICK-FIX-SSL.md` - This file

---

## Prevention

The issue is now prevented because:

1. **GitHub Actions** automatically generates certificates on every deployment
2. **Certificates persist** in the `ssl/` directory between deployments
3. **Fix script** available for manual intervention if needed

---

## Still Having Issues?

### Check Security Group:
Make sure ports 80 and 443 are open:
- Port 80: HTTP (redirects to HTTPS)
- Port 443: HTTPS (main access)

### Check Docker:
```bash
docker compose logs -f
```

### Regenerate Certificates:
```bash
./scripts/fix-ssl-deployment.sh
```

### View Full Guide:
See [AWS-DEPLOYMENT-HTTPS.md](AWS-DEPLOYMENT-HTTPS.md) for complete documentation

---

## Summary

✅ **Problem:** nginx couldn't find SSL certificates  
✅ **Solution:** Automatic certificate generation in deployment workflow  
✅ **Access:** `https://YOUR_EC2_IP` (accept browser warning)  
✅ **Manual Fix:** Run `./scripts/fix-ssl-deployment.sh`  

**Your application is now ready for HTTPS deployment! 🎉🔒**

