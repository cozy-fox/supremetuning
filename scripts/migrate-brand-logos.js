/**
 * Script to migrate brand logos from static files to database
 * Run with: node scripts/migrate-brand-logos.js
 */

require('dotenv').config();
const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB || 'supremetuning';

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI environment variable is not set');
  process.exit(1);
}

async function migrateBrandLogos() {
  console.log('🚀 Starting brand logo migration...');
  
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');

    const db = client.db(MONGODB_DB);
    const brandsCol = db.collection('brands');
    
    const brands = await brandsCol.find({}).toArray();
    console.log(`📊 Found ${brands.length} brands in database`);
    
    const logoDir = path.join(process.cwd(), 'public', 'assets', 'brand_logo');
    console.log(`📁 Looking for logos in: ${logoDir}`);
    
    const results = {
      updated: [],
      skipped: [],
      notFound: [],
      errors: []
    };

    for (const brand of brands) {
      try {
        // Skip if brand already has a logo
        if (brand.logo) {
          results.skipped.push({ name: brand.name, reason: 'Already has logo' });
          console.log(`⏭️  Skipped: ${brand.name} (already has logo)`);
          continue;
        }

        // Try to find matching logo file
        const logoPath = path.join(logoDir, `${brand.name}.png`);
        
        if (!fs.existsSync(logoPath)) {
          results.notFound.push({ name: brand.name });
          console.log(`❌ Not found: ${brand.name}.png`);
          continue;
        }

        // Read file and convert to base64
        const fileBuffer = fs.readFileSync(logoPath);
        const base64 = fileBuffer.toString('base64');
        const dataUrl = `data:image/png;base64,${base64}`;

        // Update brand with logo
        await brandsCol.updateOne(
          { id: brand.id },
          { $set: { logo: dataUrl } }
        );

        results.updated.push({ name: brand.name, id: brand.id });
        console.log(`✅ Updated: ${brand.name} (${Math.round(fileBuffer.length / 1024)}KB)`);
      } catch (err) {
        results.errors.push({ name: brand.name, error: err.message });
        console.log(`⚠️  Error: ${brand.name} - ${err.message}`);
      }
    }

    console.log('\n📈 Migration Summary:');
    console.log(`   Updated: ${results.updated.length}`);
    console.log(`   Skipped: ${results.skipped.length}`);
    console.log(`   Not Found: ${results.notFound.length}`);
    console.log(`   Errors: ${results.errors.length}`);
    
    if (results.notFound.length > 0) {
      console.log('\n📋 Brands without logo files:');
      results.notFound.forEach(b => console.log(`   - ${b.name}`));
    }

    return results;
  } finally {
    await client.close();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

migrateBrandLogos()
  .then(() => {
    console.log('\n✨ Migration completed successfully!');
    process.exit(0);
  })
  .catch(err => {
    console.error('\n💥 Migration failed:', err);
    process.exit(1);
  });

