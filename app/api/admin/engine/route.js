import { updateById, deleteById, getStages } from '@/lib/data';
import { requireAdmin } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';

/**
 * PUT /api/admin/engine - Update an engine
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
        { message: 'Engine ID and name are required' },
        { status: 400 }
      );
    }

    const slug = name.toLowerCase().replace(/\s+/g, '-');
    await updateById('engines', id, { name: name.trim(), slug });

    return NextResponse.json({ 
      message: 'Engine updated successfully',
      engine: { id, name: name.trim(), slug }
    });
  } catch (error) {
    console.error('❌ Update engine error:', error);
    return NextResponse.json(
      { message: 'Failed to update engine', error: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/engine?id=xxx - Delete an engine and all related stages (cascade)
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
    const engineId = searchParams.get('id');

    if (!engineId) {
      return NextResponse.json(
        { message: 'Engine ID is required' },
        { status: 400 }
      );
    }

    const id = parseInt(engineId);

    // Get all stages for this engine
    const stages = await getStages(id);

    // Delete all stages first
    if (stages.length > 0) {
      const stagesCol = await getCollection('stages');
      await stagesCol.deleteMany({ engineId: id });
    }

    // Finally delete the engine
    await deleteById('engines', id);

    return NextResponse.json({ 
      message: 'Engine and all stages deleted successfully',
      deleted: {
        engines: 1,
        stages: stages.length
      }
    });
  } catch (error) {
    console.error('❌ Delete engine error:', error);
    return NextResponse.json(
      { message: 'Failed to delete engine', error: error.message },
      { status: 500 }
    );
  }
}

