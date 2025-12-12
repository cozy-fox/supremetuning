# 🚀 SSL Quick Start Guide (Self-Signed Certificates)

## One-Command Setup (Easiest)

**Linux/Mac:**
```bash
chmod +x scripts/generate-self-signed-cert.sh
./scripts/generate-self-signed-cert.sh
docker compose up -d
```

**Windows (PowerShell):**
```powershell
.\scripts\generate-self-signed-cert.ps1
docker compose up -d
```

The script will generate SSL certificates and start your application with HTTPS enabled.

---

## Manual Setup (Step by Step)

### 1. Generate SSL Certificate

```bash
# Create ssl directory
mkdir -p ssl

# Generate certificate
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout ssl/key.pem \
    -out ssl/cert.pem \
    -subj "/C=NL/ST=Netherlands/L=Amsterdam/O=Supreme Tuning/OU=IT/CN=localhost"
```

### 2. Start Services

```bash
docker compose up -d
```

### 3. Test HTTPS

Open in browser: `https://localhost` (or `https://YOUR_SERVER_IP`)

**⚠️ Accept the security warning** - This is normal for self-signed certificates!

---

## Common Commands

```bash
# View all logs
docker compose logs -f

# Check certificate details
openssl x509 -in ssl/cert.pem -text -noout

# Check certificate expiration
openssl x509 -in ssl/cert.pem -noout -dates

# Regenerate certificates (when expired)
./scripts/generate-self-signed-cert.sh  # Linux/Mac
.\scripts\generate-self-signed-cert.ps1  # Windows

# Restart all services
docker compose restart

# Stop all services
docker compose down

# Start all services
docker compose up -d
```

---

## Certificate Renewal

Self-signed certificates are valid for **365 days**. To renew:

```bash
# Regenerate certificates
./scripts/generate-self-signed-cert.sh  # Linux/Mac
.\scripts\generate-self-signed-cert.ps1  # Windows

# Restart nginx
docker compose restart nginx
```

---

## Troubleshooting

### Certificate not found
```bash
# Generate certificates first
./scripts/generate-self-signed-cert.sh  # Linux/Mac
.\scripts\generate-self-signed-cert.ps1  # Windows
```

### OpenSSL not found (Windows)
Install Git for Windows: https://git-scm.com/download/win

Or use Docker method:
```bash
mkdir -p ssl
docker run --rm -v ${PWD}/ssl:/ssl alpine/openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout /ssl/key.pem -out /ssl/cert.pem -subj "/C=NL/ST=Netherlands/L=Amsterdam/O=Supreme Tuning/OU=IT/CN=localhost"
```

### Browser security warning
**This is normal for self-signed certificates!**
- Click "Advanced" → "Proceed to localhost (unsafe)"
- This is safe for local development

### View detailed logs
```bash
docker compose logs nginx
docker compose logs supreme-tuning
```

---

## What Changed?

✅ **nginx.conf** - Updated with self-signed SSL configuration and security headers
✅ **docker-compose.yml** - Simplified for self-signed certificates (removed certbot)
✅ **New scripts** - Added certificate generation scripts for Linux/Mac/Windows

---

## Security Features Enabled

- ✅ TLS 1.2 and 1.3
- ✅ Strong cipher suites
- ✅ XSS Protection headers
- ✅ Clickjacking protection
- ✅ HTTP/2 support
- ✅ Automatic HTTP to HTTPS redirect
- ⚠️ Self-signed certificate (browser will show warning)

---

## Need More Help?

See the full guide: [SSL-SETUP.md](SSL-SETUP.md)

