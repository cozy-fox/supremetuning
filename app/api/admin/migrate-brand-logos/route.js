import { requireAdmin } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';
import fs from 'fs';
import path from 'path';

/**
 * POST /api/admin/migrate-brand-logos - Migrate static brand logos to database
 * Reads PNG files from public/assets/brand_logo and stores them as base64 in brands collection
 */
export async function POST(request) {
  const authResult = requireAdmin(request);
  if (authResult.error) {
    return NextResponse.json(
      { message: authResult.error },
      { status: authResult.status }
    );
  }

  try {
    const brandsCol = await getCollection('brands');
    const brands = await brandsCol.find({}).toArray();
    
    const logoDir = path.join(process.cwd(), 'public', 'assets', 'brand_logo');
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
          continue;
        }

        // Try to find matching logo file
        const logoPath = path.join(logoDir, `${brand.name}.png`);
        
        if (!fs.existsSync(logoPath)) {
          results.notFound.push({ name: brand.name, path: logoPath });
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
      } catch (err) {
        results.errors.push({ name: brand.name, error: err.message });
      }
    }

    return NextResponse.json({
      message: 'Brand logo migration completed',
      results
    });
  } catch (error) {
    console.error('❌ Migrate brand logos error:', error);
    return NextResponse.json(
      { message: 'Failed to migrate brand logos', error: error.message },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/migrate-brand-logos - Check migration status
 */
export async function GET(request) {
  const authResult = requireAdmin(request);
  if (authResult.error) {
    return NextResponse.json(
      { message: authResult.error },
      { status: authResult.status }
    );
  }

  try {
    const brandsCol = await getCollection('brands');
    const brands = await brandsCol.find({}).toArray();
    
    const withLogo = brands.filter(b => b.logo);
    const withoutLogo = brands.filter(b => !b.logo);

    return NextResponse.json({
      total: brands.length,
      withLogo: withLogo.length,
      withoutLogo: withoutLogo.length,
      brandsWithoutLogo: withoutLogo.map(b => ({ id: b.id, name: b.name }))
    });
  } catch (error) {
    console.error('❌ Check brand logos error:', error);
    return NextResponse.json(
      { message: 'Failed to check brand logos', error: error.message },
      { status: 500 }
    );
  }
}

