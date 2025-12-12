import { updateById, deleteById, getTypes, getEngines, getStages } from '@/lib/data';
import { requireAdmin } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';

/**
 * PUT /api/admin/model - Update a model
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
    const { id, name } = await request.json();

    if (!id || !name) {
      return NextResponse.json(
        { message: 'Model ID and name are required' },
        { status: 400 }
      );
    }

    const slug = name.toLowerCase().replace(/\s+/g, '-');
    await updateById('models', id, { name: name.trim(), slug });

    return NextResponse.json({ 
      message: 'Model updated successfully',
      model: { id, name: name.trim(), slug }
    });
  } catch (error) {
    console.error('❌ Update model error:', error);
    return NextResponse.json(
      { message: 'Failed to update model', error: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/model?id=xxx - Delete a model and all related data (cascade)
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
    const modelId = searchParams.get('id');

    if (!modelId) {
      return NextResponse.json(
        { message: 'Model ID is required' },
        { status: 400 }
      );
    }

    const id = parseInt(modelId);

    // Get all related data for cascade delete
    const types = await getTypes(id);
    const typeIds = types.map(t => t.id);

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

    // Cascade delete in reverse order (stages → engines → types → model)
    const stagesCol = await getCollection('stages');
    const enginesCol = await getCollection('engines');
    const typesCol = await getCollection('types');

    if (allStages.length > 0) {
      await stagesCol.deleteMany({ engineId: { $in: engineIds } });
    }
    if (allEngines.length > 0) {
      await enginesCol.deleteMany({ typeId: { $in: typeIds } });
    }
    if (types.length > 0) {
      await typesCol.deleteMany({ modelId: id });
    }

    // Finally delete the model
    await deleteById('models', id);

    return NextResponse.json({ 
      message: 'Model and all related data deleted successfully',
      deleted: {
        models: 1,
        types: types.length,
        engines: allEngines.length,
        stages: allStages.length
      }
    });
  } catch (error) {
    console.error('❌ Delete model error:', error);
    return NextResponse.json(
      { message: 'Failed to delete model', error: error.message },
      { status: 500 }
    );
  }
}

