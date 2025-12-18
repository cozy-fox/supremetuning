# Installation Guide

## Complete Setup Instructions for Supreme Tuning Admin Panel

---

## Table of Contents

1. [System Requirements](#1-system-requirements)
2. [Prerequisites Installation](#2-prerequisites-installation)
3. [Project Installation](#3-project-installation)
4. [Environment Configuration](#4-environment-configuration)
5. [Database Setup](#5-database-setup)
6. [Running the Application](#6-running-the-application)
7. [Verification Steps](#7-verification-steps)
8. [Common Installation Issues](#8-common-installation-issues)

---

## 1. System Requirements

### Minimum Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| **OS** | Windows 10, macOS 10.15, Ubuntu 20.04 | Latest versions |
| **CPU** | 2 cores | 4+ cores |
| **RAM** | 4 GB | 8+ GB |
| **Storage** | 10 GB free | 20+ GB SSD |
| **Node.js** | 18.x | 20.x or 22.x |
| **npm** | 9.x | 10.x |
| **MongoDB** | 6.x | 7.x |

### Network Requirements

- Internet connection for npm packages
- MongoDB Atlas requires outbound HTTPS (port 443)
- Local MongoDB uses port 27017

---

## 2. Prerequisites Installation

### Node.js Installation

#### Windows
1. Download installer from [nodejs.org](https://nodejs.org/)
2. Run the installer, accept defaults
3. Verify: `node --version` and `npm --version`

#### macOS
```bash
# Using Homebrew
brew install node

# Verify
node --version
npm --version
```

#### Linux (Ubuntu/Debian)
```bash
# Add NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# Install Node.js
sudo apt-get install -y nodejs

# Verify
node --version
npm --version
```

### MongoDB Installation

#### Option A: MongoDB Atlas (Recommended for Production)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create free account
3. Create new cluster (M0 Free Tier is sufficient for small projects)
4. Set up database user with password
5. Whitelist your IP address (or 0.0.0.0/0 for all IPs)
6. Get connection string from "Connect" → "Connect your application"

#### Option B: Local MongoDB

##### Windows
1. Download from [MongoDB Community Server](https://www.mongodb.com/try/download/community)
2. Run installer with "Complete" setup
3. Start MongoDB service

##### macOS
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

##### Linux
```bash
# Import MongoDB GPG key
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -

# Add repository
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Install
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start service
sudo systemctl start mongod
sudo systemctl enable mongod
```

---

## 3. Project Installation

### Step 1: Get the Source Code

```bash
# If using Git
git clone <repository-url>
cd supremetuning

# Or extract from provided archive
unzip supremetuning.zip
cd supremetuning
```

### Step 2: Install Dependencies

```bash
# Install all npm packages
npm install

# This installs:
# - next (16.x) - Framework
# - react (19.x) - UI library
# - mongodb (6.x) - Database driver
# - bcryptjs - Password hashing
# - jsonwebtoken - JWT authentication
# - lucide-react - Icons
# - sharp - Image processing
```

### Step 3: Verify Installation

```bash
# Check for missing dependencies
npm ls

# If any errors, run:
npm install --force
```

---

## 4. Environment Configuration

### Create Environment File

```bash
# Copy example file
cp .env.example .env.local

# Or create new file
touch .env.local
```

### Required Environment Variables

Edit `.env.local` with your settings:

```env
# MongoDB Connection (REQUIRED)
# For MongoDB Atlas:
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/?retryWrites=true&w=majority

# For Local MongoDB:
MONGODB_URI=mongodb://localhost:27017

# Database name
MONGODB_DB=supremetuning

# JWT Secret for authentication (REQUIRED)
# Generate a random string (min 32 characters)
JWT_SECRET=your-super-secret-key-minimum-32-characters-long

# Optional: API URL (for production)
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### Generate Secure JWT Secret

```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Using OpenSSL
openssl rand -hex 32
```

---

## 5. Database Setup

### Initialize Database (First Time Only)

```bash
# Run database setup script
node scripts/setup-mongodb.js
```

This script:
- Creates all required collections
- Sets up database indexes for performance
- Applies schema validation rules
- Creates initial admin user

### Import Existing Data (Optional)

If you have existing JSON data:

```bash
# Run migration script
node scripts/migrate-to-mongodb.js
```

### Verify Database Connection

```bash
# Test connection
node -e "
const { MongoClient } = require('mongodb');
const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
MongoClient.connect(uri)
  .then(() => { console.log('✅ MongoDB connected!'); process.exit(0); })
  .catch(err => { console.error('❌ Connection failed:', err.message); process.exit(1); });
"
```

---

## 6. Running the Application

### Development Mode

```bash
# Start development server with hot reload
npm run dev

# Server starts at http://localhost:3000
# Admin panel at http://localhost:3000/admin
```

### Production Mode

```bash
# Build the application
npm run build

# Start production server
npm start

# Or use PM2 for process management
npm install -g pm2
pm2 start npm --name "supreme-tuning" -- start
```

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |

---

## 7. Verification Steps

### Step 1: Check Server is Running

```bash
# Health check endpoint
curl http://localhost:3000/api/health
# Should return: {"status":"ok","timestamp":"..."}
```

### Step 2: Access the Application

1. Open browser: `http://localhost:3000`
2. You should see the home page with brand cards (or empty if no data)

### Step 3: Test Admin Login

1. Go to: `http://localhost:3000/login`
2. Enter default credentials:
   - Username: `admin`
   - Password: `password` (or configured password)
3. You should be redirected to admin dashboard

### Step 4: Verify Database Connection

1. In admin panel, click "Data Manager"
2. Click "Refresh" button
3. Should show brand/model tree (or empty if new installation)

---

## 8. Common Installation Issues

### Issue: "MONGODB_URI is not defined"

**Solution:**
```bash
# Make sure .env.local exists and has MONGODB_URI
cat .env.local | grep MONGODB_URI

# Restart the server after changing .env.local
npm run dev
```

### Issue: "Cannot connect to MongoDB Atlas"

**Solutions:**
1. Check IP whitelist in Atlas dashboard
2. Verify username/password are correct
3. Ensure connection string format is correct
4. Check network/firewall settings

```bash
# Test connection
mongosh "your-connection-string"
```

### Issue: "Module not found" errors

**Solution:**
```bash
# Clear npm cache and reinstall
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

### Issue: Port 3000 already in use

**Solution:**
```bash
# Use different port
npm run dev -- -p 3001

# Or kill process on port 3000
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac:
lsof -i :3000
kill -9 <PID>
```

### Issue: "Invalid token" or auth errors

**Solution:**
1. Check JWT_SECRET is set in .env.local
2. Clear browser localStorage
3. Try logging in again

```javascript
// Clear localStorage in browser console
localStorage.clear()
```

### Issue: Sharp module errors (images)

**Solution:**
```bash
# Reinstall sharp
npm uninstall sharp
npm install sharp
```

---

## Next Steps

After successful installation:

1. **Set Admin Password:** Change the default password immediately
2. **Add Initial Data:** Use admin panel to add brands and models
3. **Configure Backup:** Set up scheduled backups
4. **Review Security:** See [SECURITY.md](./SECURITY.md)

For deployment to production, see [DEPLOYMENT.md](./DEPLOYMENT.md).

---

*For additional help, contact your development team.*

