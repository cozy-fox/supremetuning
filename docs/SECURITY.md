# Security Documentation

## Security Best Practices for Supreme Tuning

---

## Table of Contents

1. [Security Overview](#1-security-overview)
2. [Authentication System](#2-authentication-system)
3. [Authorization](#3-authorization)
4. [Data Protection](#4-data-protection)
5. [API Security](#5-api-security)
6. [Infrastructure Security](#6-infrastructure-security)
7. [Security Checklist](#7-security-checklist)
8. [Incident Response](#8-incident-response)
9. [Compliance](#9-compliance)

---

## 1. Security Overview

### Security Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Client Browser                          │
│                    (HTTPS Required)                          │
├─────────────────────────────────────────────────────────────┤
│                    Cloudflare/CDN                            │
│              (DDoS Protection, WAF)                          │
├─────────────────────────────────────────────────────────────┤
│                    Nginx Reverse Proxy                       │
│              (SSL Termination, Rate Limiting)                │
├─────────────────────────────────────────────────────────────┤
│                    Next.js Application                       │
│              (JWT Auth, Input Validation)                    │
├─────────────────────────────────────────────────────────────┤
│                    MongoDB Database                          │
│              (Encrypted, Access Control)                     │
└─────────────────────────────────────────────────────────────┘
```

### Security Principles

1. **Defense in Depth:** Multiple layers of security
2. **Least Privilege:** Minimal access rights
3. **Secure by Default:** Security enabled out of the box
4. **Fail Securely:** Errors don't expose sensitive data

---

## 2. Authentication System

### JWT Token Authentication

The application uses JSON Web Tokens (JWT) for authentication.

**Token Configuration:**
| Setting | Value |
|---------|-------|
| Algorithm | HS256 |
| Expiry | 2 hours |
| Storage | HTTP-only cookie |
| Secret | 256-bit minimum |

### Token Flow

```
1. User submits credentials
2. Server validates against database
3. Server creates JWT with username
4. Token stored in HTTP-only cookie
5. Subsequent requests include cookie
6. Server verifies token on each request
```

### Password Security

**Hashing:**
- Algorithm: bcrypt
- Salt rounds: 10
- Passwords never stored in plain text

**Password Requirements:**
- Minimum 8 characters (recommended)
- No maximum length
- All characters allowed

### Session Management

```javascript
// Token creation
const token = jwt.sign(
  { username: 'admin' },
  process.env.JWT_SECRET,
  { expiresIn: '2h' }
);

// Token verification
const decoded = jwt.verify(token, process.env.JWT_SECRET);
```

### Secure Cookie Settings

```javascript
// Cookie configuration
{
  httpOnly: true,      // Not accessible via JavaScript
  secure: true,        // HTTPS only (production)
  sameSite: 'strict',  // CSRF protection
  maxAge: 7200000      // 2 hours in milliseconds
}
```

---

## 3. Authorization

### Role-Based Access

| Role | Permissions |
|------|-------------|
| Public | Read-only access to public data |
| Admin | Full CRUD access to all data |

### Protected Routes

**Public Routes (No Auth Required):**
- `/` - Home page
- `/api/brands` - Get brands
- `/api/groups` - Get groups
- `/api/models` - Get models
- `/api/types` - Get types
- `/api/engines` - Get engines
- `/api/stages` - Get stages

**Admin Routes (Auth Required):**
- `/admin` - Admin dashboard
- `/api/admin/*` - All admin API endpoints

### Authorization Middleware

```javascript
// lib/auth.js
export async function requireAdmin(request) {
  const token = request.cookies.get('auth_token')?.value;
  
  if (!token) {
    return { valid: false, error: 'No token provided' };
  }
  
  try {
    const decoded = verifyToken(token);
    return { valid: true, username: decoded.username };
  } catch (error) {
    return { valid: false, error: 'Invalid token' };
  }
}
```

---

## 4. Data Protection

### Database Security

**MongoDB Atlas Security:**
- TLS/SSL encryption in transit
- Encryption at rest (AES-256)
- IP whitelist access control
- Database user authentication

**Connection String Security:**
```bash
# Never commit connection strings
echo ".env*" >> .gitignore

# Use environment variables
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/
```

### Sensitive Data Handling

**What's Considered Sensitive:**
- Admin passwords (hashed)
- JWT secret
- Database credentials
- API keys

**Protection Measures:**
1. Environment variables for secrets
2. Never log sensitive data
3. Sanitize error messages
4. Encrypt backups

### Input Validation

```javascript
// Validate all user input
function validateInput(data) {
  // Check required fields
  if (!data.name || typeof data.name !== 'string') {
    throw new Error('Invalid name');
  }

  // Sanitize strings
  data.name = data.name.trim().substring(0, 100);

  // Validate numbers
  if (data.price && (isNaN(data.price) || data.price < 0)) {
    throw new Error('Invalid price');
  }

  return data;
}
```

---

## 5. API Security

### CORS Configuration

```javascript
// next.config.js
const nextConfig = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: 'https://yourdomain.com' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ];
  },
};
```

### Rate Limiting (Recommended)

```javascript
// Implement rate limiting
const rateLimit = {
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
};

// For admin endpoints
const adminRateLimit = {
  windowMs: 60 * 1000,
  max: 1000,
};
```

### Request Validation

```javascript
// Validate request method
if (request.method !== 'POST') {
  return Response.json({ error: 'Method not allowed' }, { status: 405 });
}

// Validate content type
const contentType = request.headers.get('content-type');
if (!contentType?.includes('application/json')) {
  return Response.json({ error: 'Invalid content type' }, { status: 400 });
}
```

### Error Handling

```javascript
// Don't expose internal errors
try {
  // ... operation
} catch (error) {
  console.error('Internal error:', error); // Log full error
  return Response.json(
    { error: 'An error occurred' }, // Generic message to client
    { status: 500 }
  );
}
```

---

## 6. Infrastructure Security

### Server Hardening

```bash
# Disable root SSH login
sudo nano /etc/ssh/sshd_config
# PermitRootLogin no
# PasswordAuthentication no

# Configure firewall
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
sudo ufw enable

# Install fail2ban
sudo apt install fail2ban
sudo systemctl enable fail2ban
```

### SSL/TLS Configuration

```nginx
# Nginx SSL configuration
server {
    listen 443 ssl http2;

    ssl_certificate /etc/letsencrypt/live/domain/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/domain/privkey.pem;

    # Modern SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
    ssl_prefer_server_ciphers off;

    # HSTS
    add_header Strict-Transport-Security "max-age=63072000" always;
}
```

### Security Headers

```nginx
# Add security headers
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Content-Security-Policy "default-src 'self'" always;
```

---

## 7. Security Checklist

### Pre-Deployment Checklist

- [ ] Change default admin password
- [ ] Generate strong JWT_SECRET (32+ characters)
- [ ] Configure MongoDB access control
- [ ] Enable HTTPS/SSL
- [ ] Set up firewall rules
- [ ] Remove development dependencies
- [ ] Disable debug mode
- [ ] Review environment variables

### Ongoing Security Tasks

- [ ] Weekly: Review audit logs
- [ ] Monthly: Update dependencies
- [ ] Monthly: Review access logs
- [ ] Quarterly: Security audit
- [ ] Annually: Penetration testing

### Password Security Checklist

- [ ] Minimum 8 characters
- [ ] Mix of letters, numbers, symbols
- [ ] Not a common password
- [ ] Not reused from other sites
- [ ] Changed every 90 days (recommended)

---

## 8. Incident Response

### Security Incident Types

| Type | Severity | Response Time |
|------|----------|---------------|
| Data breach | Critical | Immediate |
| Unauthorized access | High | < 1 hour |
| Suspicious activity | Medium | < 4 hours |
| Failed login attempts | Low | < 24 hours |

### Incident Response Steps

1. **Identify:** Detect and confirm the incident
2. **Contain:** Limit the damage
3. **Eradicate:** Remove the threat
4. **Recover:** Restore normal operations
5. **Learn:** Document and improve

### Immediate Actions for Breach

```bash
# 1. Revoke all tokens (change JWT_SECRET)
# Update .env.local with new JWT_SECRET

# 2. Force all users to re-authenticate
# Clear all sessions

# 3. Change admin password
# Use the update credentials feature

# 4. Review audit logs
# Check for unauthorized changes

# 5. Restore from backup if needed
# Use the backup system
```

### Logging and Monitoring

```javascript
// Log security events
function logSecurityEvent(event) {
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    type: 'SECURITY',
    event: event.type,
    ip: event.ip,
    user: event.user,
    details: event.details
  }));
}

// Log failed login attempts
logSecurityEvent({
  type: 'FAILED_LOGIN',
  ip: request.headers.get('x-forwarded-for'),
  user: username,
  details: 'Invalid password'
});
```

---

## 9. Compliance

### Data Protection

**GDPR Considerations:**
- User data is minimal (admin only)
- No personal customer data stored
- Audit logs for accountability
- Right to deletion supported

### Security Standards

The application follows these security standards:
- OWASP Top 10 guidelines
- CIS benchmarks for server hardening
- NIST password guidelines

### Audit Trail

All changes are logged with:
- Timestamp
- User who made the change
- What was changed
- Before and after values

```javascript
// Audit log entry
{
  collection: "stages",
  documentId: 1,
  action: "update",
  before: { price: 499 },
  after: { price: 549 },
  changedBy: "admin",
  changedAt: "2024-12-18T10:30:00Z"
}
```

---

## Security Contacts

For security issues:
- Report vulnerabilities to your development team
- Do not disclose publicly until fixed
- Include steps to reproduce

---

*For maintenance procedures, see [MAINTENANCE.md](./MAINTENANCE.md)*

