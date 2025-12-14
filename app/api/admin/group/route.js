import { updateById, deleteById, insertOne, getModels, getTypes, getEngines, getStages } from '@/lib/data';
import { requireAdmin } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';

/**
 * POST /api/admin/group - Create a new group
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
    const { brandId, name, isPerformance, logo, order } = await request.json();

    if (!brandId || !name) {
      return NextResponse.json(
        { message: 'Brand ID and name are required' },
        { status: 400 }
      );
    }

    const slug = name.toLowerCase().replace(/\s+/g, '-');
    const groupData = {
      brandId: parseInt(brandId),
      name: name.trim(),
      slug,
      isPerformance: isPerformance || false,
      logo: logo || null,
      order: order || 0
    };

    const result = await insertOne('groups', groupData);

    return NextResponse.json({ 
      message: 'Group created successfully',
      group: result
    });
  } catch (error) {
    console.error('❌ Create group error:', error);
    return NextResponse.json(
      { message: 'Failed to create group', error: error.message },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/group - Update a group
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
    const { id, name, isPerformance, logo, order } = await request.json();

    if (!id || !name) {
      return NextResponse.json(
        { message: 'Group ID and name are required' },
        { status: 400 }
      );
    }

    const slug = name.toLowerCase().replace(/\s+/g, '-');
    const updateData = {
      name: name.trim(),
      slug
    };

    if (isPerformance !== undefined) updateData.isPerformance = isPerformance;
    if (logo !== undefined) updateData.logo = logo;
    if (order !== undefined) updateData.order = order;

    await updateById('groups', id, updateData);

    return NextResponse.json({ 
      message: 'Group updated successfully',
      group: { id, ...updateData }
    });
  } catch (error) {
    console.error('❌ Update group error:', error);
    return NextResponse.json(
      { message: 'Failed to update group', error: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/group?id=xxx - Delete a group and all related data (cascade)
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
    const groupId = searchParams.get('id');

    if (!groupId) {
      return NextResponse.json(
        { message: 'Group ID is required' },
        { status: 400 }
      );
    }

    const id = parseInt(groupId);

    // Get all models in this group
    const models = await getModels(null, id);
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

    // Cascade delete in reverse order (stages → engines → types → models → group)
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
      await modelsCol.deleteMany({ groupId: id });
    }

    // Finally delete the group
    await deleteById('groups', id);

    return NextResponse.json({
      message: 'Group and all related data deleted successfully',
      deleted: {
        groups: 1,
        models: models.length,
        types: allTypes.length,
        engines: allEngines.length,
        stages: allStages.length
      }
    });
  } catch (error) {
    console.error('❌ Delete group error:', error);
    return NextResponse.json(
      { message: 'Failed to delete group', error: error.message },
      { status: 500 }
    );
  }
}

