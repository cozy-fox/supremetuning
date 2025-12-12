import { updateById, deleteById, getEngines, getStages } from '@/lib/data';
import { requireAdmin } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';

/**
 * PUT /api/admin/type - Update a type/generation
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
        { message: 'Type ID and name are required' },
        { status: 400 }
      );
    }

    const slug = name.toLowerCase().replace(/\s+/g, '-');
    await updateById('types', id, { name: name.trim(), slug });

    return NextResponse.json({ 
      message: 'Type updated successfully',
      type: { id, name: name.trim(), slug }
    });
  } catch (error) {
    console.error('❌ Update type error:', error);
    return NextResponse.json(
      { message: 'Failed to update type', error: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/type?id=xxx - Delete a type and all related data (cascade)
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
    const typeId = searchParams.get('id');

    if (!typeId) {
      return NextResponse.json(
        { message: 'Type ID is required' },
        { status: 400 }
      );
    }

    const id = parseInt(typeId);

    // Get all related data for cascade delete
    const engines = await getEngines(id);
    const engineIds = engines.map(e => e.id);

    // Get all stages for these engines
    const allStages = [];
    for (const engineId of engineIds) {
      const stages = await getStages(engineId);
      allStages.push(...stages);
    }

    // Cascade delete in reverse order (stages → engines → type)
    const stagesCol = await getCollection('stages');
    const enginesCol = await getCollection('engines');

    if (allStages.length > 0) {
      await stagesCol.deleteMany({ engineId: { $in: engineIds } });
    }
    if (engines.length > 0) {
      await enginesCol.deleteMany({ typeId: id });
    }

    // Finally delete the type
    await deleteById('types', id);

    return NextResponse.json({ 
      message: 'Type and all related data deleted successfully',
      deleted: {
        types: 1,
        engines: engines.length,
        stages: allStages.length
      }
    });
  } catch (error) {
    console.error('❌ Delete type error:', error);
    return NextResponse.json(
      { message: 'Failed to delete type', error: error.message },
      { status: 500 }
    );
  }
}

