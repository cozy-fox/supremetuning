/**
 * Authentication utilities for Next.js
 */
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

const JWT_SECRET = process.env.JWT_SECRET || 'supreme_dev_secret_key_999';
const ADMIN_FILE_PATH = path.join(process.cwd(), 'data', 'admin.json');

// Read admin credentials from JSON file
function getAdminCredentials() {
  try {
    const data = fs.readFileSync(ADMIN_FILE_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // Fallback to default credentials if file doesn't exist
    return {
      username: 'admin',
      password: '$2a$10$ri1Jq8ZDZx/rSgMqbp5G9./fRuw4lokNoxrJTJ.qsbthevXNcw2ba' // 'password'
    };
  }
}

// Save admin credentials to JSON file
export function saveAdminCredentials(username, hashedPassword) {
  const credentials = { username, password: hashedPassword };
  fs.writeFileSync(ADMIN_FILE_PATH, JSON.stringify(credentials, null, 2), 'utf8');
  return true;
}

// Hash a password
export function hashPassword(password) {
  return bcrypt.hashSync(password, 10);
}

export function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'admin') {
      return null;
    }
    return decoded;
  } catch (e) {
    return null;
  }
}

export function createToken(username) {
  return jwt.sign(
    { role: 'admin', username },
    JWT_SECRET,
    { expiresIn: '2h' }
  );
}

export function validateCredentials(username, password) {
  const credentials = getAdminCredentials();
  if (username !== credentials.username) {
    return false;
  }
  return bcrypt.compareSync(password, credentials.password);
}

export function getCurrentUsername() {
  const credentials = getAdminCredentials();
  return credentials.username;
}

// Middleware helper for API routes
export function requireAdmin(request) {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.split(' ')[1];
  
  if (!token) {
    return { error: 'Authentication required', status: 401 };
  }
  
  const user = verifyToken(token);
  if (!user) {
    return { error: 'Admin access denied', status: 403 };
  }
  
  return { user };
}

