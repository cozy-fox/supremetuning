# 🔒 SSL/HTTPS Setup Guide for Supreme Tuning

This guide will help you enable HTTPS for your Supreme Tuning website using **self-signed SSL certificates** (for local development or when you don't have a domain).

---

## ✅ Prerequisites

Before starting, ensure you have:

1. **Docker and Docker Compose** installed on your server
2. **OpenSSL** installed (usually comes with Git for Windows, or pre-installed on Linux/Mac)
3. **Ports 80 and 443 open** in your firewall (if accessing from other machines)

---

## 📋 Configuration Overview

The SSL setup uses:
- **Nginx** as a reverse proxy with SSL termination
- **Self-signed SSL certificates** for HTTPS (valid for 365 days)
- Works with **IP addresses** or **localhost** (no domain required)

---

## 🚀 Step 1: Generate Self-Signed SSL Certificate

### Option A: Using the Automated Script (Easiest)

**For Linux/Mac:**
```bash
chmod +x scripts/generate-self-signed-cert.sh
./scripts/generate-self-signed-cert.sh
```

**For Windows (PowerShell):**
```powershell
.\scripts\generate-self-signed-cert.ps1
```

The script will:
- Create an `ssl` directory
- Generate `cert.pem` and `key.pem` files
- Prompt you for your server IP or hostname
- Set proper permissions

### Option B: Manual Generation

**Using OpenSSL directly:**
```bash
# Create ssl directory
mkdir -p ssl

# Generate certificate (replace localhost with your IP if needed)
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout ssl/key.pem \
    -out ssl/cert.pem \
    -subj "/C=NL/ST=Netherlands/L=Amsterdam/O=Supreme Tuning/OU=IT/CN=localhost" \
    -addext "subjectAltName=DNS:localhost,IP:127.0.0.1"
```

**Using Docker (if OpenSSL not installed):**
```bash
mkdir -p ssl
docker run --rm -v ${PWD}/ssl:/ssl alpine/openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /ssl/key.pem \
    -out /ssl/cert.pem \
    -subj "/C=NL/ST=Netherlands/L=Amsterdam/O=Supreme Tuning/OU=IT/CN=localhost"
```

---

## 🔧 Step 2: Start the Application with HTTPS

```bash
# Stop any running containers
docker compose down

# Start all services
docker compose up -d
```

This will:
- Start the Next.js application
- Start Nginx with SSL enabled
- Automatically redirect HTTP to HTTPS

---

## 🎯 Step 3: Verify HTTPS is Working

1. **Check if containers are running:**

```bash
docker compose ps
```

You should see:
- `supreme-tuning` - Running
- `supreme-nginx` - Running

2. **Test HTTPS in your browser:**

Open: `https://localhost` (or `https://YOUR_SERVER_IP`)

**⚠️ You will see a security warning** - This is normal for self-signed certificates!

**To proceed:**
- **Chrome/Edge:** Click "Advanced" → "Proceed to localhost (unsafe)"
- **Firefox:** Click "Advanced" → "Accept the Risk and Continue"
- **Safari:** Click "Show Details" → "visit this website"

After accepting, you should see:
- 🔒 Padlock icon (may show "Not Secure" due to self-signed cert)
- Your website loading over HTTPS

3. **Test HTTP to HTTPS redirect:**

Open: `http://localhost`

It should automatically redirect to `https://localhost`

---

## 🔄 Step 4: Certificate Renewal

Self-signed certificates are valid for **365 days**. When they expire:

```bash
# Regenerate certificates
./scripts/generate-self-signed-cert.sh  # or .ps1 for Windows

# Restart nginx
docker compose restart nginx
```

---

## 🛠️ Troubleshooting

### Issue: "Certificate not found" error

**Solution:** Generate the self-signed certificates first:
```bash
./scripts/generate-self-signed-cert.sh  # Linux/Mac
.\scripts\generate-self-signed-cert.ps1  # Windows
```

### Issue: OpenSSL not found

**Solutions:**
- **Windows:** Install Git for Windows (includes OpenSSL) from https://git-scm.com/download/win
- **Linux:** `sudo apt-get install openssl` or `sudo yum install openssl`
- **Mac:** OpenSSL is pre-installed
- **Alternative:** Use the Docker method shown in Step 1

### Issue: Browser shows "Your connection is not private"

**This is normal for self-signed certificates!**

Self-signed certificates are not trusted by browsers by default. You can:
1. Click "Advanced" and proceed anyway (safe for local development)
2. Add the certificate to your browser's trusted certificates (optional)

### Issue: "Connection refused" on HTTPS

**Solution:** Ensure nginx is running and certificates exist:
```bash
# Check if nginx is running
docker compose ps nginx

# Check if certificates exist
ls -la ssl/

# Check nginx configuration
docker compose exec nginx nginx -t

# View nginx logs
docker compose logs nginx
```

### Issue: Permission denied on ssl files

**Solution:** Fix file permissions:
```bash
chmod 644 ssl/cert.pem
chmod 600 ssl/key.pem
```

---

## 📊 Useful Commands

```bash
# View all logs
docker compose logs -f

# View nginx logs only
docker compose logs -f nginx

# Restart all services
docker compose restart

# Check certificate details
openssl x509 -in ssl/cert.pem -text -noout

# Check certificate expiration date
openssl x509 -in ssl/cert.pem -noout -dates

# Regenerate certificates
./scripts/generate-self-signed-cert.sh  # Linux/Mac
.\scripts\generate-self-signed-cert.ps1  # Windows
```

---

## 🔐 Security Features

The nginx configuration includes:

✅ **TLS 1.2 and 1.3** - Modern encryption protocols
✅ **Strong ciphers** - Secure cipher suites
✅ **Security headers** - XSS, clickjacking protection
✅ **HTTP/2** - Faster page loads
✅ **Automatic HTTP→HTTPS redirect**

**Note:** HSTS is disabled for self-signed certificates to avoid browser issues.

---

## 📝 Next Steps

After SSL is working:

1. ✅ Accept the browser security warning (normal for self-signed certs)
2. ✅ Update your `SITE_URL` in environment variables to use `https://`
3. ✅ Bookmark the HTTPS URL for easy access
4. ✅ For production: Get a real domain and use Let's Encrypt instead

---

## 🌐 Using with a Real Domain (Production)

If you later get a domain name, you can switch to Let's Encrypt:

1. Update `nginx.conf` to use your domain name
2. Use Let's Encrypt instead of self-signed certificates
3. See the Let's Encrypt documentation for details

---

## 🆘 Need Help?

If you encounter issues:

1. Check the logs: `docker compose logs -f`
2. Verify certificates exist: `ls -la ssl/`
3. Test nginx config: `docker compose exec nginx nginx -t`
4. Check certificate details: `openssl x509 -in ssl/cert.pem -text -noout`

