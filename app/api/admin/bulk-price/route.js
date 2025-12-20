import { getCollection } from '@/lib/mongodb';
import { requireAdmin } from '@/lib/auth';
import { NextResponse } from 'next/server';

/**
 * PUT /api/admin/bulk-price - Bulk update prices for stages
 * 
 * Supports updating prices at different levels:
 * - Brand level: Update all stages for all engines under a brand
 * - Model level: Update all stages for all engines under a model
 * - Generation level: Update all stages for all engines under a generation (type)
 * - Engine level: Update all stages for a specific engine
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
    const {
      level,      // 'brand', 'model', 'generation', 'engine'
      targetId,   // ID of the target (brandId, modelId, typeId, or engineId)
      groupId,    // Optional: Filter by group (only for brand/model level)
      priceData,  // { stageName: price } or { percentage: number, operation: 'increase'|'decrease'|'set' }
      updateType  // 'absolute' or 'percentage'
    } = await request.json();

    if (!level || !targetId) {
      return NextResponse.json(
        { message: 'Level and targetId are required' },
        { status: 400 }
      );
    }

    // Get the stages collection
    const stagesCollection = await getCollection('stages');
    const enginesCollection = await getCollection('engines');
    const typesCollection = await getCollection('types');
    const modelsCollection = await getCollection('models');

    // Build the list of engine IDs to update based on level
    let engineIds = [];

    if (level === 'engine') {
      engineIds = [parseInt(targetId)];
    } else if (level === 'generation') {
      // Get all engines for this generation (type)
      const engines = await enginesCollection.find({ typeId: parseInt(targetId) }).toArray();
      engineIds = engines.map(e => e.id);
    } else if (level === 'model') {
      // Get all types for this model, then all engines for those types
      const types = await typesCollection.find({ modelId: parseInt(targetId) }).toArray();
      const typeIds = types.map(t => t.id);
      const engines = await enginesCollection.find({ typeId: { $in: typeIds } }).toArray();
      engineIds = engines.map(e => e.id);
    } else if (level === 'brand') {
      // Get all models for this brand (optionally filtered by group), then all types, then all engines
      const modelQuery = { brandId: parseInt(targetId) };
      if (groupId) {
        modelQuery.groupId = parseInt(groupId);
        console.log('🔍 Bulk update with group filter:', { brandId: targetId, groupId });
      }
      const models = await modelsCollection.find(modelQuery).toArray();
      const modelIds = models.map(m => m.id);

      console.log(`📊 Found ${models.length} models for brand ${targetId}${groupId ? ` in group ${groupId}` : ''}`);

      if (modelIds.length === 0) {
        return NextResponse.json(
          { message: 'No models found for the specified brand/group' },
          { status: 404 }
        );
      }

      const types = await typesCollection.find({ modelId: { $in: modelIds } }).toArray();
      const typeIds = types.map(t => t.id);
      const engines = await enginesCollection.find({ typeId: { $in: typeIds } }).toArray();
      engineIds = engines.map(e => e.id);

      console.log(`🔧 Found ${engines.length} engines across ${types.length} generations`);
    }

    if (engineIds.length === 0) {
      return NextResponse.json(
        { message: 'No engines found for the specified target' },
        { status: 404 }
      );
    }

    // Get all stages for these engines
    const stages = await stagesCollection.find({ engineId: { $in: engineIds } }).toArray();

    if (stages.length === 0) {
      return NextResponse.json(
        { message: 'No stages found for the specified engines' },
        { status: 404 }
      );
    }

    let updatedCount = 0;
    const bulkOperations = [];

    if (updateType === 'absolute' && priceData.prices) {
      // Build bulk operations for absolute price updates
      for (const stage of stages) {
        const stageName = stage.stageName?.toLowerCase().replace(/\s+/g, '').replace(/\+/g, 'plus');
        const price = priceData.prices[stageName] ?? priceData.prices[stage.stageName];

        if (price !== undefined && price !== null) {
          bulkOperations.push({
            updateOne: {
              filter: { id: stage.id },
              update: { $set: { price: parseInt(price) } }
            }
          });
          updatedCount++;
        }
      }
    } else if (updateType === 'percentage') {
      // Build bulk operations for percentage updates
      const { percentage, operation } = priceData;

      for (const stage of stages) {
        let newPrice = stage.price || 0;

        if (operation === 'increase') {
          newPrice = Math.round(newPrice * (1 + percentage / 100));
        } else if (operation === 'decrease') {
          newPrice = Math.round(newPrice * (1 - percentage / 100));
        } else if (operation === 'set') {
          newPrice = parseInt(percentage); // In this case, percentage is actually the absolute value
        }

        bulkOperations.push({
          updateOne: {
            filter: { id: stage.id },
            update: { $set: { price: Math.max(0, newPrice) } }
          }
        });
        updatedCount++;
      }
    } else if (updateType === 'fixed' && priceData.price !== undefined) {
      // Set all stages to a fixed price using updateMany (already efficient)
      await stagesCollection.updateMany(
        { engineId: { $in: engineIds } },
        { $set: { price: parseInt(priceData.price) } }
      );
      updatedCount = stages.length;
    }

    // Execute bulk operations in a single database call
    if (bulkOperations.length > 0) {
      const result = await stagesCollection.bulkWrite(bulkOperations, { ordered: false });
      console.log(`✅ Bulk write complete: ${result.modifiedCount} stages modified`);
    }

    console.log(`✅ Bulk update complete: ${updatedCount} stages updated across ${engineIds.length} engines`);

    return NextResponse.json({
      message: `Successfully updated ${updatedCount} stage prices across ${engineIds.length} engines`,
      updatedCount,
      totalStages: stages.length,
      engineCount: engineIds.length,
      groupFiltered: !!groupId
    });
  } catch (error) {
    console.error('❌ Bulk price update error:', error);
    return NextResponse.json(
      { message: 'Failed to update prices', error: error.message },
      { status: 500 }
    );
  }
}

