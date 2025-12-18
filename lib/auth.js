/**
 * Authentication utilities for Next.js
 */
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { getCollection } from './mongodb';

const JWT_SECRET = process.env.JWT_SECRET || 'supreme_dev_secret_key_999';

// Default credentials (used for initial setup)
const DEFAULT_CREDENTIALS = {
  username: 'admin',
  password: '$2a$10$ri1Jq8ZDZx/rSgMqbp5G9./fRuw4lokNoxrJTJ.qsbthevXNcw2ba' // 'password'
};

// Read admin credentials from MongoDB
async function getAdminCredentials() {
  try {
    const collection = await getCollection('admin_credentials');
    const credentials = await collection.findOne({ _id: 'admin' });
    if (credentials) {
      return {
        username: credentials.username,
        password: credentials.password
      };
    }
    // Fallback to default credentials if not found in database
    return DEFAULT_CREDENTIALS;
  } catch (error) {
    console.error('Error reading credentials from MongoDB:', error.message);
    // Fallback to default credentials on error
    return DEFAULT_CREDENTIALS;
  }
}

// Save admin credentials to MongoDB
export async function saveAdminCredentials(username, hashedPassword) {
  try {
    const collection = await getCollection('admin_credentials');
    await collection.updateOne(
      { _id: 'admin' },
      {
        $set: {
          username,
          password: hashedPassword,
          updatedAt: new Date()
        }
      },
      { upsert: true }
    );
    return true;
  } catch (error) {
    console.error('Error saving credentials to MongoDB:', error.message);
    throw new Error('Failed to save credentials');
  }
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

export async function validateCredentials(username, password) {
  const credentials = await getAdminCredentials();
  if (username !== credentials.username) {
    return false;
  }
  return bcrypt.compareSync(password, credentials.password);
}

export async function getCurrentUsername() {
  const credentials = await getAdminCredentials();
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

