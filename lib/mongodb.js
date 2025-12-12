/**
 * MongoDB Connection for Next.js
 * Handles connection pooling and provides database access
 */
import { MongoClient } from 'mongodb';

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your MongoDB URI to .env file');
}

// Remove quotes from connection string if present
let uri = process.env.MONGODB_URI.trim();
if (uri.startsWith('"') && uri.endsWith('"')) {
  uri = uri.slice(1, -1);
}
if (uri.startsWith("'") && uri.endsWith("'")) {
  uri = uri.slice(1, -1);
}

const options = {
  maxPoolSize: 10,
  minPoolSize: 2,
  serverSelectionTimeoutMS: 10000, // Increased timeout
  socketTimeoutMS: 45000,
  retryWrites: true,
  retryReads: true,
};

let client;
let clientPromise;

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable to preserve the connection
  // across hot reloads
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect()
      .then(client => {
        console.log('✅ MongoDB connected successfully');
        return client;
      })
      .catch(error => {
        console.error('❌ MongoDB connection error:', error.message);
        throw error;
      });
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production mode, create a new client
  client = new MongoClient(uri, options);
  clientPromise = client.connect()
    .then(client => {
      console.log('✅ MongoDB connected successfully');
      return client;
    })
    .catch(error => {
      console.error('❌ MongoDB connection error:', error.message);
      throw error;
    });
}

/**
 * Get MongoDB database instance
 * @returns {Promise<Db>} MongoDB database instance
 */
export async function getDatabase() {
  try {
    const client = await clientPromise;
    const dbName = process.env.MONGODB_DB || 'supremetuning';
    return client.db(dbName);
  } catch (error) {
    console.error('❌ Failed to get database:', error.message);
    throw new Error(`MongoDB connection failed: ${error.message}`);
  }
}

/**
 * Get a specific collection
 * @param {string} collectionName - Name of the collection
 * @returns {Promise<Collection>} MongoDB collection instance
 */
export async function getCollection(collectionName) {
  try {
    const db = await getDatabase();
    return db.collection(collectionName);
  } catch (error) {
    console.error(`❌ Failed to get collection ${collectionName}:`, error.message);
    throw error;
  }
}

/**
 * Close MongoDB connection (use only when shutting down)
 */
export async function closeConnection() {
  const client = await clientPromise;
  await client.close();
}

export default clientPromise;

