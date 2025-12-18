# Production Deployment Guide

## Deploying Supreme Tuning Admin Panel to Production

---

## Table of Contents

1. [Deployment Overview](#1-deployment-overview)
2. [Server Requirements](#2-server-requirements)
3. [Pre-Deployment Checklist](#3-pre-deployment-checklist)
4. [Deployment Options](#4-deployment-options)
5. [Vercel Deployment](#5-vercel-deployment)
6. [Docker Deployment](#6-docker-deployment)
7. [VPS/Dedicated Server Deployment](#7-vpsdedicated-server-deployment)
8. [Domain and SSL Configuration](#8-domain-and-ssl-configuration)
9. [Environment Variables](#9-environment-variables)
10. [Post-Deployment Tasks](#10-post-deployment-tasks)
11. [Monitoring and Logging](#11-monitoring-and-logging)
12. [Rollback Procedures](#12-rollback-procedures)

---

## 1. Deployment Overview

### Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     CDN / Load Balancer                      │
│                    (Cloudflare, AWS ALB)                     │
├─────────────────────────────────────────────────────────────┤
│                    Application Server                        │
│              ┌─────────────────────────────┐                │
│              │     Next.js Production      │                │
│              │    (Node.js Runtime)        │                │
│              │    Port: 3000 (internal)    │                │
│              └─────────────────────────────┘                │
├─────────────────────────────────────────────────────────────┤
│                    Database Layer                            │
│              ┌─────────────────────────────┐                │
│              │      MongoDB Atlas          │                │
│              │    (Cloud Database)         │                │
│              └─────────────────────────────┘                │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Server Requirements

### Minimum Production Requirements

| Component | Specification |
|-----------|---------------|
| **CPU** | 2 vCPU cores |
| **RAM** | 4 GB |
| **Storage** | 20 GB SSD |
| **OS** | Ubuntu 22.04 LTS (recommended) |
| **Node.js** | 20.x LTS |

### Recommended for High Traffic

| Component | Specification |
|-----------|---------------|
| **CPU** | 4+ vCPU cores |
| **RAM** | 8+ GB |
| **Storage** | 50+ GB SSD |
| **Network** | 1 Gbps |

---

## 3. Pre-Deployment Checklist

### Security Checks
- [ ] Change default admin password
- [ ] Generate strong JWT_SECRET (minimum 32 characters)
- [ ] Review MongoDB access permissions
- [ ] Configure firewall rules
- [ ] Set up SSL/HTTPS

### Application Checks
- [ ] Run `npm run build` locally to verify no errors
- [ ] Test all critical features
- [ ] Verify database connection
- [ ] Check environment variables

### Backup
- [ ] Export current database
- [ ] Save current .env configuration
- [ ] Document current version/commit

---

## 4. Deployment Options

| Platform | Complexity | Cost | Best For |
|----------|------------|------|----------|
| **Vercel** | Low | Free-$20/mo | Small-medium projects |
| **Docker** | Medium | Varies | Custom infrastructure |
| **VPS** | High | $10-50/mo | Full control |
| **AWS/GCP** | High | Varies | Enterprise scale |

---

## 5. Vercel Deployment

### Step 1: Prepare Repository

```bash
# Ensure project is in Git repository
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-repo-url>
git push -u origin main
```

### Step 2: Connect to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your Git repository
4. Configure project:
   - Framework: Next.js (auto-detected)
   - Root Directory: ./
   - Build Command: `npm run build`
   - Output Directory: `.next`

### Step 3: Configure Environment Variables

In Vercel Dashboard → Settings → Environment Variables:

```
MONGODB_URI = mongodb+srv://...
MONGODB_DB = supremetuning
JWT_SECRET = your-production-secret-key
```

### Step 4: Deploy

```bash
# Vercel auto-deploys on push
git push origin main

# Or manual deploy
npx vercel --prod
```

### Vercel Configuration (vercel.json)

```json
{
  "framework": "nextjs",
  "regions": ["iad1"],
  "functions": {
    "app/api/**/*.js": {
      "maxDuration": 30
    }
  }
}
```

---

## 6. Docker Deployment

### Dockerfile

Create `Dockerfile` in project root:

```dockerfile
# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy built assets
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - MONGODB_URI=${MONGODB_URI}
      - MONGODB_DB=${MONGODB_DB}
      - JWT_SECRET=${JWT_SECRET}
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Optional: Local MongoDB
  mongodb:
    image: mongo:7
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
    restart: unless-stopped

volumes:
  mongodb_data:
```

### Deploy with Docker

```bash
# Build and run
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop
docker-compose down
```

---

## 7. VPS/Dedicated Server Deployment

### Step 1: Server Setup (Ubuntu 22.04)

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 globally
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx

# Configure firewall
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

### Step 2: Deploy Application

```bash
# Create application directory
sudo mkdir -p /var/www/supremetuning
sudo chown $USER:$USER /var/www/supremetuning

# Clone or copy application
cd /var/www/supremetuning
git clone <repository-url> .

# Install dependencies
npm ci --production

# Build application
npm run build

# Create environment file
nano .env.local
# Add your environment variables
```

### Step 3: Configure PM2

```bash
# Create PM2 ecosystem file
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'supreme-tuning',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/supremetuning',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
EOF

# Start with PM2
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Enable PM2 on startup
pm2 startup
```

### Step 4: Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/supremetuning
```

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/supremetuning /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

---

## 8. Domain and SSL Configuration

### Configure DNS

Add these DNS records:

| Type | Name | Value |
|------|------|-------|
| A | @ | Your-Server-IP |
| A | www | Your-Server-IP |
| CNAME | admin | yourdomain.com |

### SSL with Let's Encrypt

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal is configured automatically
# Test renewal:
sudo certbot renew --dry-run
```

---

## 9. Environment Variables

### Production Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGODB_URI` | Yes | MongoDB connection string |
| `MONGODB_DB` | Yes | Database name |
| `JWT_SECRET` | Yes | Secret for JWT tokens (32+ chars) |
| `NEXT_PUBLIC_API_URL` | No | Public API URL |
| `NODE_ENV` | Auto | Set to 'production' |

### Security Best Practices

```bash
# Never commit .env files
echo ".env*" >> .gitignore

# Use environment-specific files
# .env.local for development
# Set variables directly in production (Vercel, Docker, etc.)
```

---

## 10. Post-Deployment Tasks

### Immediate Tasks

1. **Change Admin Password**
   - Login to admin panel
   - Go to "Update Credentials"
   - Set strong password

2. **Verify All Features**
   - Test login/logout
   - Test data CRUD operations
   - Test bulk price updates
   - Test backup functionality

3. **Configure Monitoring**
   - Set up uptime monitoring
   - Configure error logging
   - Set up backup schedules

### Security Hardening

```bash
# Disable root SSH login
sudo nano /etc/ssh/sshd_config
# PermitRootLogin no
sudo systemctl restart sshd

# Install fail2ban
sudo apt install -y fail2ban
sudo systemctl enable fail2ban
```

---

## 11. Monitoring and Logging

### PM2 Monitoring

```bash
# View status
pm2 status

# View logs
pm2 logs

# Monitor in real-time
pm2 monit
```

### Application Health Check

```bash
# Health endpoint
curl https://yourdomain.com/api/health

# Expected response:
# {"status":"ok","timestamp":"2024-12-18T..."}
```

### Log Rotation

```bash
# PM2 log rotation
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 30
```

---

## 12. Rollback Procedures

### Quick Rollback

```bash
# If using Git
cd /var/www/supremetuning
git log --oneline -5  # Find previous commit
git checkout <previous-commit-hash>
npm ci --production
npm run build
pm2 restart all
```

### Database Rollback

1. Go to admin panel
2. Click "Production Backup System"
3. Find the backup from before the issue
4. Click "Restore"

### Emergency Procedures

```bash
# Stop application
pm2 stop supreme-tuning

# Check logs for errors
pm2 logs --lines 100

# Restart with clean state
pm2 delete supreme-tuning
pm2 start ecosystem.config.js
```

---

## Deployment Checklist Summary

### Before Deployment
- [ ] Code tested locally
- [ ] Build completes without errors
- [ ] Environment variables prepared
- [ ] Database backup created

### During Deployment
- [ ] Server/service configured
- [ ] Application deployed
- [ ] SSL configured
- [ ] DNS pointing correctly

### After Deployment
- [ ] Health check passing
- [ ] Admin login working
- [ ] All features tested
- [ ] Monitoring configured
- [ ] Backup schedule set

---

*For issues during deployment, check [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)*

