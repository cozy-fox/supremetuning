/**
 * MongoDB Setup Script
 * Interactive setup for MongoDB connection
 * 
 * Usage: node scripts/setup-mongodb.js
 */

const readline = require('readline');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function setup() {
  console.log('\n🚀 Supreme Tuning - MongoDB Setup\n');
  console.log('This script will help you configure MongoDB Atlas connection.\n');

  // Get MongoDB credentials
  console.log('📝 Please provide your MongoDB Atlas credentials:');
  console.log('   (You can find these in MongoDB Atlas → Database → Connect)\n');

  const username = await question('MongoDB Username: ');
  const password = await question('MongoDB Password: ');
  const cluster = await question('Cluster URL (e.g., cluster0.abc123.mongodb.net): ');
  const dbName = await question('Database Name [supremetuning]: ') || 'supremetuning';

  // Build connection string
  const connectionString = `mongodb+srv://${username}:${password}@${cluster}/${dbName}?retryWrites=true&w=majority&appName=supremetuning`;

  console.log('\n✅ Connection string generated!\n');

  // Update .env file
  const envPath = path.join(process.cwd(), '.env');
  let envContent = '';

  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf-8');
  } else {
    envContent = `# Supreme Tuning Environment Variables

# Site URL
SITE_URL=https://supremetuning.nl

# JWT Secret
JWT_SECRET=supreme_dev_secret_key_999

# Node environment
NODE_ENV=development

`;
  }

  // Update or add MongoDB settings
  if (envContent.includes('MONGODB_URI=')) {
    envContent = envContent.replace(
      /MONGODB_URI=.*/,
      `MONGODB_URI=${connectionString}`
    );
  } else {
    envContent += `\n# MongoDB Atlas Connection\nMONGODB_URI=${connectionString}\n`;
  }

  if (envContent.includes('MONGODB_DB=')) {
    envContent = envContent.replace(
      /MONGODB_DB=.*/,
      `MONGODB_DB=${dbName}`
    );
  } else {
    envContent += `MONGODB_DB=${dbName}\n`;
  }

  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env file updated\n');

  // Ask if user wants to run migration
  const runMigration = await question('Do you want to migrate data from JSON to MongoDB now? (y/n): ');

  if (runMigration.toLowerCase() === 'y') {
    console.log('\n🚀 Starting migration...\n');
    rl.close();
    
    // Run migration script
    require('./migrate-to-mongodb.js');
  } else {
    console.log('\n📝 To migrate data later, run:');
    console.log('   node scripts/migrate-to-mongodb.js\n');
    
    console.log('📝 To switch to MongoDB, run:');
    console.log('   mv lib/data.js lib/data-json.js');
    console.log('   mv lib/data-mongodb.js lib/data.js\n');
    
    rl.close();
  }
}

setup().catch(error => {
  console.error('❌ Setup error:', error);
  rl.close();
  process.exit(1);
});

