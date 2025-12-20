import { getCollection } from '@/lib/mongodb';
import { requireAdmin } from '@/lib/auth';
import { NextResponse } from 'next/server';

/**
 * PUT /api/admin/bulk-price - Bulk update prices, power, or torque for stages
 *
 * Supports updating at different levels:
 * - Brand level: Update all stages for all engines under a brand
 * - Model level: Update all stages for all engines under a model
 * - Generation level: Update all stages for all engines under a generation (type)
 * - Engine level: Update all stages for a specific engine
 *
 * Supports different data types:
 * - price: Update stage prices
 * - power: Update tunedHp (and recalculate gainHp)
 * - torque: Update tunedNm (and recalculate gainNm)
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
      dataType = 'price',  // 'price', 'power', or 'torque'
      updateData, // { values: {...}, percentage, operation, value }
      updateType, // 'absolute', 'percentage', or 'fixed'
      // Legacy support for old priceData format
      priceData
    } = await request.json();

    // Support legacy priceData format (backwards compatibility)
    const effectiveUpdateData = updateData || priceData;

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

    // Determine which field to update based on dataType
    const getFieldName = () => {
      switch (dataType) {
        case 'power': return 'tunedHp';
        case 'torque': return 'tunedNm';
        default: return 'price';
      }
    };

    const getGainFieldName = () => {
      switch (dataType) {
        case 'power': return 'gainHp';
        case 'torque': return 'gainNm';
        default: return null;
      }
    };

    const getStockFieldName = () => {
      switch (dataType) {
        case 'power': return 'stockHp';
        case 'torque': return 'stockNm';
        default: return null;
      }
    };

    const fieldName = getFieldName();
    const gainFieldName = getGainFieldName();
    const stockFieldName = getStockFieldName();

    // Get values from effectiveUpdateData (support both new and legacy formats)
    const values = effectiveUpdateData?.values || effectiveUpdateData?.prices;
    const fixedValue = effectiveUpdateData?.value ?? effectiveUpdateData?.price;

    if (updateType === 'absolute' && values) {
      // Build bulk operations for absolute value updates
      for (const stage of stages) {
        const stageName = stage.stageName?.toLowerCase().replace(/\s+/g, '').replace(/\+/g, 'plus');
        const newValue = values[stageName] ?? values[stage.stageName];

        if (newValue !== undefined && newValue !== null) {
          const updateFields = { [fieldName]: parseInt(newValue) };

          // Calculate gain for power/torque
          if (gainFieldName && stockFieldName) {
            const stockValue = stage[stockFieldName] || 0;
            updateFields[gainFieldName] = parseInt(newValue) - stockValue;
          }

          bulkOperations.push({
            updateOne: {
              filter: { id: stage.id },
              update: { $set: updateFields }
            }
          });
          updatedCount++;
        }
      }
    } else if (updateType === 'percentage') {
      // Build bulk operations for percentage updates
      const { percentage, operation } = effectiveUpdateData;

      for (const stage of stages) {
        let currentValue = stage[fieldName] || 0;
        let newValue = currentValue;

        if (operation === 'increase') {
          newValue = Math.round(currentValue * (1 + percentage / 100));
        } else if (operation === 'decrease') {
          newValue = Math.round(currentValue * (1 - percentage / 100));
        } else if (operation === 'set') {
          newValue = parseInt(percentage);
        }

        const updateFields = { [fieldName]: Math.max(0, newValue) };

        // Calculate gain for power/torque
        if (gainFieldName && stockFieldName) {
          const stockValue = stage[stockFieldName] || 0;
          updateFields[gainFieldName] = Math.max(0, newValue) - stockValue;
        }

        bulkOperations.push({
          updateOne: {
            filter: { id: stage.id },
            update: { $set: updateFields }
          }
        });
        updatedCount++;
      }
    } else if (updateType === 'fixed' && fixedValue !== undefined) {
      // Set all stages to a fixed value
      // For power/torque, we need to calculate gains individually
      if (gainFieldName && stockFieldName) {
        for (const stage of stages) {
          const stockValue = stage[stockFieldName] || 0;
          const updateFields = {
            [fieldName]: parseInt(fixedValue),
            [gainFieldName]: parseInt(fixedValue) - stockValue
          };

          bulkOperations.push({
            updateOne: {
              filter: { id: stage.id },
              update: { $set: updateFields }
            }
          });
          updatedCount++;
        }
      } else {
        // For price, use updateMany (more efficient)
        await stagesCollection.updateMany(
          { engineId: { $in: engineIds } },
          { $set: { [fieldName]: parseInt(fixedValue) } }
        );
        updatedCount = stages.length;
      }
    }

    // Execute bulk operations in a single database call
    if (bulkOperations.length > 0) {
      const result = await stagesCollection.bulkWrite(bulkOperations, { ordered: false });
      console.log(`✅ Bulk write complete: ${result.modifiedCount} stages modified`);
    }

    const dataTypeLabel = dataType === 'power' ? 'power (HP)' : dataType === 'torque' ? 'torque (Nm)' : 'prices';
    console.log(`✅ Bulk update complete: ${updatedCount} stage ${dataTypeLabel} updated across ${engineIds.length} engines`);

    return NextResponse.json({
      message: `Successfully updated ${updatedCount} stage ${dataTypeLabel} across ${engineIds.length} engines`,
      updatedCount,
      totalStages: stages.length,
      engineCount: engineIds.length,
      dataType,
      groupFiltered: !!groupId
    });
  } catch (error) {
    console.error('❌ Bulk update error:', error);
    return NextResponse.json(
      { message: 'Failed to update data', error: error.message },
      { status: 500 }
    );
  }
}

