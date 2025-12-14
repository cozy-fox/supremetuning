import { updateById, findById } from '@/lib/data';
import { requireAdmin } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';

/**
 * POST /api/admin/move - Move an item to a different parent (supports cross-hierarchy moves)
 * Supports moving:
 * - Model to ANY group (across all brands) or brand
 * - Type to ANY model (across all brands/groups)
 * - Engine to ANY type (across all brands/models)
 *
 * The API automatically updates all related foreign keys (brandId, modelId, etc.)
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
    const { itemType, itemId, targetParentId, targetParentType } = await request.json();

    if (!itemType || !itemId || !targetParentId || !targetParentType) {
      return NextResponse.json(
        { message: 'itemType, itemId, targetParentId, and targetParentType are required' },
        { status: 400 }
      );
    }

    const id = parseInt(itemId);
    const targetId = parseInt(targetParentId);

    // Validate the move operation
    const validMoves = {
      'model': ['group', 'brand'],
      'type': ['model'],
      'engine': ['type']
    };

    if (!validMoves[itemType] || !validMoves[itemType].includes(targetParentType)) {
      return NextResponse.json(
        { message: `Invalid move: cannot move ${itemType} to ${targetParentType}` },
        { status: 400 }
      );
    }

    // Perform the move based on item type
    let updateData = {};
    let collectionName = '';

    switch (itemType) {
      case 'model':
        collectionName = 'models';
        if (targetParentType === 'group') {
          updateData = { groupId: targetId };
          // Also need to update brandId based on the group's brandId
          const group = await findById('groups', targetId);
          if (group) {
            updateData.brandId = group.brandId;
          }
        } else if (targetParentType === 'brand') {
          updateData = { brandId: targetId, groupId: null };
        }
        break;

      case 'type':
        collectionName = 'types';
        updateData = { modelId: targetId };
        // Also need to update brandId based on the model's brandId
        const model = await findById('models', targetId);
        if (model) {
          updateData.brandId = model.brandId;
        }
        // Update all engines under this type
        const enginesCol = await getCollection('engines');
        await enginesCol.updateMany(
          { typeId: id },
          { $set: { modelId: targetId } }
        );
        break;

      case 'engine':
        collectionName = 'engines';
        updateData = { typeId: targetId };
        // Also need to update modelId based on the type's modelId
        const type = await findById('types', targetId);
        if (type) {
          updateData.modelId = type.modelId;
        }
        break;

      default:
        return NextResponse.json(
          { message: `Unsupported item type: ${itemType}` },
          { status: 400 }
        );
    }

    // Perform the update
    await updateById(collectionName, id, updateData);

    return NextResponse.json({ 
      message: `${itemType} moved successfully`,
      itemType,
      itemId: id,
      targetParentType,
      targetParentId: targetId,
      updateData
    });
  } catch (error) {
    console.error('❌ Move item error:', error);
    return NextResponse.json(
      { message: 'Failed to move item', error: error.message },
      { status: 500 }
    );
  }
}

