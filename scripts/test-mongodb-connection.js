/**
 * Test MongoDB Connection
 * Quick script to verify MongoDB Atlas connection
 * 
 * Usage: node scripts/test-mongodb-connection.js
 */

const { MongoClient } = require('mongodb');
require('dotenv').config();

async function testConnection() {
  console.log('🔍 Testing MongoDB Connection...\n');

  // Get connection string
  let uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('❌ MONGODB_URI not found in .env file');
    process.exit(1);
  }

  // Remove quotes if present
  uri = uri.trim();
  if (uri.startsWith('"') && uri.endsWith('"')) {
    uri = uri.slice(1, -1);
  }

  console.log('📝 Connection Details:');
  // Mask password in output
  const maskedUri = uri.replace(/:([^@]+)@/, ':****@');
  console.log(`   URI: ${maskedUri}`);
  console.log(`   Database: ${process.env.MONGODB_DB || 'supremetuning'}\n`);

  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 10000,
  });

  try {
    // Connect
    console.log('🔌 Connecting to MongoDB Atlas...');
    await client.connect();
    console.log('✅ Connected successfully!\n');

    // Get database
    const dbName = process.env.MONGODB_DB || 'supremetuning';
    const db = client.db(dbName);

    // List collections
    console.log('📦 Collections in database:');
    const collections = await db.listCollections().toArray();
    
    if (collections.length === 0) {
      console.log('   ⚠️ No collections found (database is empty)');
      console.log('   💡 Run migration script: node scripts/migrate-to-mongodb.js\n');
    } else {
      for (const coll of collections) {
        const count = await db.collection(coll.name).countDocuments();
        console.log(`   - ${coll.name}: ${count} documents`);
      }
      console.log('');
    }

    // Test write operation
    console.log('✍️ Testing write operation...');
    const testCol = db.collection('_connection_test');
    await testCol.insertOne({ test: true, timestamp: new Date() });
    console.log('✅ Write successful');

    // Test read operation
    console.log('📖 Testing read operation...');
    const doc = await testCol.findOne({ test: true });
    console.log('✅ Read successful');

    // Cleanup
    await testCol.deleteMany({});
    console.log('🧹 Cleanup complete\n');

    console.log('🎉 All tests passed! MongoDB is ready to use.\n');

  } catch (error) {
    console.error('\n❌ Connection test failed:');
    console.error(`   Error: ${error.message}\n`);
    
    if (error.message.includes('bad auth')) {
      console.log('💡 Troubleshooting:');
      console.log('   1. Check username and password in .env');
      console.log('   2. Make sure password is URL-encoded');
      console.log('   3. Verify database user exists in MongoDB Atlas\n');
    } else if (error.message.includes('ETIMEDOUT') || error.message.includes('ENOTFOUND')) {
      console.log('💡 Troubleshooting:');
      console.log('   1. Check your internet connection');
      console.log('   2. Add your IP to MongoDB Atlas Network Access');
      console.log('   3. Verify cluster URL is correct\n');
    }
    
    process.exit(1);
  } finally {
    await client.close();
    console.log('🔌 Connection closed');
  }
}

testConnection().catch(console.error);

