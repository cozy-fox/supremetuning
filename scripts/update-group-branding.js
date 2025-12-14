/**
 * Update Groups with Branding Information
 * 
 * This script adds colors, descriptions, and icons to performance groups
 * 
 * Run with: node scripts/update-group-branding.js
 */

import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

let uri = process.env.MONGODB_URI;
if (!uri) {
  console.error('❌ MONGODB_URI not found');
  process.exit(1);
}
uri = uri.trim().replace(/^["']|["']$/g, '');

const dbName = process.env.MONGODB_DB || 'supremetuning';

const brandingData = {
  'RS': {
    description: 'RennSport - Audi Performance Division',
    color: '#ff0000',
    icon: '🏁',
    tagline: 'Born on the track'
  },
  'M': {
    description: 'BMW Motorsport - Ultimate Driving Machines',
    color: '#0066cc',
    icon: '🏎️',
    tagline: 'The Most Powerful Letter in the World'
  },
  'AMG': {
    description: 'Aufrecht Melcher Großaspach - Mercedes Performance',
    color: '#00d4aa',
    icon: '⚡',
    tagline: 'Driving Performance'
  }
};

async function updateBranding() {
  console.log('🎨 Updating Group Branding...\n');
  
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB\n');
    
    const db = client.db(dbName);
    const groupsCol = db.collection('groups');
    
    for (const [groupName, branding] of Object.entries(brandingData)) {
      const result = await groupsCol.updateMany(
        { name: groupName },
        {
          $set: {
            description: branding.description,
            color: branding.color,
            icon: branding.icon,
            tagline: branding.tagline
          }
        }
      );
      
      if (result.modifiedCount > 0) {
        console.log(`✅ Updated ${groupName}: ${branding.description}`);
      } else {
        console.log(`⚠️ No ${groupName} groups found to update`);
      }
    }
    
    // Also update Standard groups with neutral branding
    const standardResult = await groupsCol.updateMany(
      { isPerformance: false },
      {
        $set: {
          description: 'Standard models',
          color: '#a8b0b8',
          icon: '🚗',
          tagline: 'Classic performance'
        }
      }
    );
    console.log(`✅ Updated ${standardResult.modifiedCount} Standard groups`);
    
    console.log('\n🎉 Branding update complete!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

updateBranding();

