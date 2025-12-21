import { updateById, deleteById, getModels, getTypes, getEngines, getStages, insertOne } from '@/lib/data';
import { requireAdmin } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';

/**
 * POST /api/admin/brand - Create a new brand
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
    const { name, logo, isTest } = await request.json();

    if (!name) {
      return NextResponse.json(
        { message: 'Brand name is required' },
        { status: 400 }
      );
    }

    const slug = name.trim().toLowerCase().replace(/\s+/g, '-');

    // Check if brand with this name already exists
    const brandsCol = await getCollection('brands');
    const existingBrand = await brandsCol.findOne({
      $or: [
        { name: { $regex: new RegExp(`^${name.trim()}$`, 'i') } },
        { slug }
      ]
    });

    if (existingBrand) {
      return NextResponse.json(
        { message: 'A brand with this name already exists' },
        { status: 409 }
      );
    }

    const newBrand = {
      name: name.trim(),
      slug,
      logo: logo || null,
      isTest: isTest === true // Default to false (production brand)
    };

    const result = await insertOne('brands', newBrand);

    console.log(`✅ Created brand: ${name} (id=${result.id})`);

    return NextResponse.json({
      message: 'Brand created successfully',
      brand: result
    });
  } catch (error) {
    console.error('❌ Create brand error:', error);
    return NextResponse.json(
      { message: 'Failed to create brand', error: error.message },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/brand - Update a brand
 */
export async function PUT(request) {
  const authResult = requireAdmin(request);
  if (authResult.error) {
    return NextResponse.json(
      { message: authResult.error },
      { status: authResult.status }
    );
  }

  try {
    const { id, name, logo, isTest } = await request.json();

    if (!id || !name) {
      return NextResponse.json(
        { message: 'Brand ID and name are required' },
        { status: 400 }
      );
    }

    const slug = name.toLowerCase().replace(/\s+/g, '-');
    const updateData = { name: name.trim(), slug };

    // Include logo if provided (can be null to remove, or a data URL to update)
    if (logo !== undefined) {
      updateData.logo = logo;
    }

    // Include isTest flag if provided
    if (isTest !== undefined) {
      updateData.isTest = isTest === true;
    }

    await updateById('brands', id, updateData);

    return NextResponse.json({
      message: 'Brand updated successfully',
      brand: { id, name: name.trim(), slug, logo: updateData.logo, isTest: updateData.isTest }
    });
  } catch (error) {
    console.error('❌ Update brand error:', error);
    return NextResponse.json(
      { message: 'Failed to update brand', error: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/brand?id=xxx - Delete a brand and all related data (cascade)
 */
export async function DELETE(request) {
  const authResult = requireAdmin(request);
  if (authResult.error) {
    return NextResponse.json(
      { message: authResult.error },
      { status: authResult.status }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const brandId = searchParams.get('id');

    if (!brandId) {
      return NextResponse.json(
        { message: 'Brand ID is required' },
        { status: 400 }
      );
    }

    const id = parseInt(brandId);

    // Get all related data for cascade delete
    const models = await getModels(id);
    const modelIds = models.map(m => m.id);

    // Get all types for these models
    const allTypes = [];
    for (const modelId of modelIds) {
      const types = await getTypes(modelId);
      allTypes.push(...types);
    }
    const typeIds = allTypes.map(t => t.id);

    // Get all engines for these types
    const allEngines = [];
    for (const typeId of typeIds) {
      const engines = await getEngines(typeId);
      allEngines.push(...engines);
    }
    const engineIds = allEngines.map(e => e.id);

    // Get all stages for these engines
    const allStages = [];
    for (const engineId of engineIds) {
      const stages = await getStages(engineId);
      allStages.push(...stages);
    }

    // Cascade delete in reverse order (stages → engines → types → models → brand)
    const stagesCol = await getCollection('stages');
    const enginesCol = await getCollection('engines');
    const typesCol = await getCollection('types');
    const modelsCol = await getCollection('models');

    if (allStages.length > 0) {
      await stagesCol.deleteMany({ engineId: { $in: engineIds } });
    }
    if (allEngines.length > 0) {
      await enginesCol.deleteMany({ typeId: { $in: typeIds } });
    }
    if (allTypes.length > 0) {
      await typesCol.deleteMany({ modelId: { $in: modelIds } });
    }
    if (models.length > 0) {
      await modelsCol.deleteMany({ brandId: id });
    }

    // Finally delete the brand
    await deleteById('brands', id);

    return NextResponse.json({ 
      message: 'Brand and all related data deleted successfully',
      deleted: {
        brands: 1,
        models: models.length,
        types: allTypes.length,
        engines: allEngines.length,
        stages: allStages.length
      }
    });
  } catch (error) {
    console.error('❌ Delete brand error:', error);
    return NextResponse.json(
      { message: 'Failed to delete brand', error: error.message },
      { status: 500 }
    );
  }
}

