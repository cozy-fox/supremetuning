# 🚀 AWS EC2 Deployment with HTTPS (No Domain Required)

## Overview

This guide shows you how to deploy Supreme Tuning to AWS EC2 with HTTPS enabled using your EC2 public IP address (no domain name required).

---

## Prerequisites

✅ AWS EC2 instance running (Ubuntu/Amazon Linux)  
✅ GitHub Actions self-hosted runner configured  
✅ Security Group allows ports: **22, 80, 443**  
✅ Docker and Docker Compose installed on EC2  

---

## Security Group Configuration

Make sure your EC2 Security Group has these inbound rules:

| Type  | Protocol | Port Range | Source    | Description          |
|-------|----------|------------|-----------|----------------------|
| SSH   | TCP      | 22         | Your IP   | SSH access           |
| HTTP  | TCP      | 80         | 0.0.0.0/0 | HTTP (redirects)     |
| HTTPS | TCP      | 443        | 0.0.0.0/0 | HTTPS (main access)  |

---

## Deployment Process

### Automatic Deployment (GitHub Actions)

The deployment workflow automatically:

1. ✅ Checks out your code
2. ✅ Creates environment variables
3. ✅ **Generates SSL certificates** (if not exists)
4. ✅ Builds Docker images
5. ✅ Starts containers with HTTPS enabled
6. ✅ Displays your access URL

**To deploy:**
```bash
git add .
git commit -m "Deploy with HTTPS"
git push origin main
```

The GitHub Actions workflow will:
- Detect your EC2 public IP automatically
- Generate self-signed SSL certificate for that IP
- Start nginx with HTTPS on port 443
- Redirect all HTTP traffic to HTTPS

---

### Manual Deployment (SSH to EC2)

If you need to deploy manually:

```bash
# SSH to your EC2 instance
ssh -i your-key.pem ubuntu@YOUR_EC2_IP

# Navigate to project directory
cd /path/to/supreme-tuning

# Pull latest code
git pull origin main

# Generate SSL certificates (if not exists)
./scripts/generate-self-signed-cert.sh
# When prompted, enter your EC2 public IP

# Start the application
docker compose down
docker compose up -d

# Check logs
docker compose logs -f
```

---

## Accessing Your Application

After deployment, access your application at:

```
https://YOUR_EC2_PUBLIC_IP
```

**Example:** `https://54.123.45.67`

### ⚠️ Browser Security Warning

You **will** see a security warning like:
> "Your connection is not private" or "NET::ERR_CERT_AUTHORITY_INVALID"

**This is normal and expected!** Self-signed certificates are not trusted by browsers.

**To proceed:**
1. Click **"Advanced"**
2. Click **"Proceed to [IP address] (unsafe)"**
3. Your site will load with HTTPS encryption

---

## Finding Your EC2 Public IP

### From AWS Console:
1. Go to EC2 Dashboard
2. Select your instance
3. Copy the "Public IPv4 address"

### From EC2 Instance (SSH):
```bash
curl http://169.254.169.254/latest/meta-data/public-ipv4
```

### From GitHub Actions Logs:
Check the deployment logs - the IP is displayed at the end.

---

## Environment Variables

Set these secrets in GitHub:
- `SITE_URL` - Set to `https://YOUR_EC2_IP`
- `JWT_SECRET` - Your secure JWT secret

**Example:**
```
SITE_URL=https://54.123.45.67
JWT_SECRET=your-super-secret-key-min-32-chars
```

---

## Troubleshooting

### Issue: nginx fails to start with certificate error

**Solution:** Generate certificates manually:
```bash
ssh -i your-key.pem ubuntu@YOUR_EC2_IP
cd /path/to/supreme-tuning
./scripts/generate-self-signed-cert.sh
docker compose restart nginx
```

### Issue: Can't access via HTTPS

**Check:**
1. Security Group allows port 443
2. Certificates exist: `ls -la ssl/`
3. Nginx is running: `docker compose ps`
4. Check logs: `docker compose logs nginx`

### Issue: HTTP doesn't redirect to HTTPS

**Solution:** Restart nginx:
```bash
docker compose restart nginx
```

---

## SSL Certificate Details

- **Type:** Self-signed
- **Validity:** 365 days
- **Location:** `./ssl/cert.pem` and `./ssl/key.pem`
- **Includes:** Your EC2 public IP in Subject Alternative Name (SAN)

### Renewing Certificates

Certificates expire after 365 days. To renew:

```bash
# SSH to EC2
ssh -i your-key.pem ubuntu@YOUR_EC2_IP
cd /path/to/supreme-tuning

# Regenerate certificates
./scripts/generate-self-signed-cert.sh

# Restart nginx
docker compose restart nginx
```

---

## Upgrading to a Real Domain (Optional)

If you later get a domain name:

1. Point your domain to your EC2 IP
2. Update `nginx.conf` with your domain name
3. Use Let's Encrypt for trusted certificates
4. No more browser warnings!

---

## Useful Commands

```bash
# View all logs
docker compose logs -f

# View nginx logs only
docker compose logs -f nginx

# Restart all services
docker compose restart

# Check certificate details
openssl x509 -in ssl/cert.pem -text -noout

# Check certificate expiration
openssl x509 -in ssl/cert.pem -noout -dates

# Test HTTPS locally (from EC2)
curl -k -I https://localhost
```

---

## Security Notes

✅ **Encryption:** TLS 1.2/1.3 encryption enabled  
✅ **Firewall:** Only ports 22, 80, 443 open  
✅ **Auto-redirect:** HTTP automatically redirects to HTTPS  
⚠️ **Self-signed:** Browser will show warning (normal)  
⚠️ **Production:** Consider getting a domain + Let's Encrypt for production  

---

**Your Supreme Tuning application is now deployed with HTTPS on AWS! 🎉🔒**

