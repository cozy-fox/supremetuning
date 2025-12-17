import { insertOne, updateById, deleteById } from '@/lib/data';
import { requireAdmin } from '@/lib/auth';
import { NextResponse } from 'next/server';

/**
 * POST /api/admin/stage - Create a new stage
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
    const { engineId, stageName, stockHp, tunedHp, stockNm, tunedNm, price, ecuUnlock, cpcUpgrade } = await request.json();

    if (!engineId || !stageName) {
      return NextResponse.json(
        { message: 'Engine ID and stage name are required' },
        { status: 400 }
      );
    }

    const newStage = {
      engineId: parseInt(engineId),
      stageName: stageName.trim(),
      stockHp: stockHp ? parseInt(stockHp) : 0,
      tunedHp: tunedHp ? parseInt(tunedHp) : 0,
      stockNm: stockNm ? parseInt(stockNm) : 0,
      tunedNm: tunedNm ? parseInt(tunedNm) : 0,
      gainHp: (tunedHp ? parseInt(tunedHp) : 0) - (stockHp ? parseInt(stockHp) : 0),
      gainNm: (tunedNm ? parseInt(tunedNm) : 0) - (stockNm ? parseInt(stockNm) : 0),
      price: price ? parseInt(price) : 0,
      ecuUnlock: ecuUnlock || false,
      cpcUpgrade: cpcUpgrade || false
    };

    const result = await insertOne('stages', newStage);

    return NextResponse.json({
      message: 'Stage created successfully',
      stage: result
    });
  } catch (error) {
    console.error('❌ Create stage error:', error);
    return NextResponse.json(
      { message: 'Failed to create stage', error: error.message },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/stage - Update a stage
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
    const { id, stageName, stockHp, tunedHp, stockNm, tunedNm, price, ecuUnlock, cpcUpgrade } = await request.json();

    if (!id) {
      return NextResponse.json(
        { message: 'Stage ID is required' },
        { status: 400 }
      );
    }

    const updateData = {};
    if (stageName !== undefined) updateData.stageName = stageName.trim();
    if (stockHp !== undefined) updateData.stockHp = parseInt(stockHp);
    if (tunedHp !== undefined) updateData.tunedHp = parseInt(tunedHp);
    if (stockNm !== undefined) updateData.stockNm = parseInt(stockNm);
    if (tunedNm !== undefined) updateData.tunedNm = parseInt(tunedNm);
    if (price !== undefined) updateData.price = parseInt(price);
    if (ecuUnlock !== undefined) updateData.ecuUnlock = ecuUnlock;
    if (cpcUpgrade !== undefined) updateData.cpcUpgrade = cpcUpgrade;

    // Calculate gains if HP/NM values are updated
    if (stockHp !== undefined || tunedHp !== undefined) {
      const stock = stockHp !== undefined ? parseInt(stockHp) : 0;
      const tuned = tunedHp !== undefined ? parseInt(tunedHp) : 0;
      updateData.gainHp = tuned - stock;
    }

    if (stockNm !== undefined || tunedNm !== undefined) {
      const stock = stockNm !== undefined ? parseInt(stockNm) : 0;
      const tuned = tunedNm !== undefined ? parseInt(tunedNm) : 0;
      updateData.gainNm = tuned - stock;
    }

    await updateById('stages', id, updateData);

    return NextResponse.json({
      message: 'Stage updated successfully',
      stage: { id, ...updateData }
    });
  } catch (error) {
    console.error('❌ Update stage error:', error);
    return NextResponse.json(
      { message: 'Failed to update stage', error: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/stage - Delete a stage
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
    const stageId = searchParams.get('id');

    if (!stageId) {
      return NextResponse.json(
        { message: 'Stage ID is required' },
        { status: 400 }
      );
    }

    await deleteById('stages', parseInt(stageId));

    return NextResponse.json({
      message: 'Stage deleted successfully'
    });
  } catch (error) {
    console.error('❌ Delete stage error:', error);
    return NextResponse.json(
      { message: 'Failed to delete stage', error: error.message },
      { status: 500 }
    );
  }
}

