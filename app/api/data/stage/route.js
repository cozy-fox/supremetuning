import {
  getBrandByName,
  getModelByName,
  getTypeByName,
  getEngineByName,
  getStages,
  updateStage
} from '@/lib/data';
import { requireAdmin } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { getEngineById } from '@/lib/data-json';

/**
 * PUT /api/data/stage
 * Update a stage using direct MongoDB queries (no loading all data)
 */
export async function PUT(request) {
  console.log('PUT /api/data/stage');

  const authResult = requireAdmin(request);
  if (authResult.error) {
    return NextResponse.json(
      { message: authResult.error },
      { status: authResult.status }
    );
  }

  try {
    const { brand, model, type, engine, stageIndex, stageData } = await request.json();

    // Validate required fields
    if (!brand || !model || !type || !engine || stageIndex === undefined || !stageData) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Step 1: Find brand using direct MongoDB query
    const brandData = await getBrandByName(brand);

    if (!brandData) {
      return NextResponse.json(
        { message: `Brand not found: ${brand}` },
        { status: 404 }
      );
    }

    // Step 2: Find model using direct MongoDB query
    const modelData = await getModelByName(brandData.id, model);

    if (!modelData) {
      return NextResponse.json(
        { message: `Model not found: ${model} for brand ${brand}` },
        { status: 404 }
      );
    }

    // Step 3: Find type using direct MongoDB query
    const typeData = await getTypeByName(modelData.id, type);

    if (!typeData) {
      return NextResponse.json(
        { message: `Type/Generation not found: ${type} for model ${model}` },
        { status: 404 }
      );
    }

    // Step 4: Find engine using direct MongoDB query
    const engineData = await getEngineById(engine);

    if (!engineData) {
      return NextResponse.json(
        { message: `Engine not found: ${engine} for type ${type}` },
        { status: 404 }
      );
    }

    // Step 5: Get stages for this engine using direct MongoDB query
    const engineStages = await getStages(engineData.id);

    if (!engineStages || engineStages.length === 0) {
      return NextResponse.json(
        { message: 'No stages found for this engine' },
        { status: 404 }
      );
    }

    // Validate stage index
    if (stageIndex < 0 || stageIndex >= engineStages.length) {
      return NextResponse.json(
        { message: `Stage index ${stageIndex} out of range (0-${engineStages.length - 1})` },
        { status: 404 }
      );
    }

    // Get the specific stage to update
    const stageToUpdate = engineStages[stageIndex];

    // Prepare update data (only allowed fields)
    const allowedFields = ['stageName', 'stockHp', 'tunedHp', 'stockNm', 'tunedNm', 'price'];
    const updateData = {};

    allowedFields.forEach(field => {
      if (stageData[field] !== undefined) {
        updateData[field] = stageData[field];
      }
    });

    // Calculate gains if HP/NM values are updated
    if (updateData.stockHp !== undefined || updateData.tunedHp !== undefined) {
      const stockHp = updateData.stockHp ?? stageToUpdate.stockHp;
      const tunedHp = updateData.tunedHp ?? stageToUpdate.tunedHp;
      if (stockHp !== null && tunedHp !== null) {
        updateData.gainHp = tunedHp - stockHp;
      }
    }

    if (updateData.stockNm !== undefined || updateData.tunedNm !== undefined) {
      const stockNm = updateData.stockNm ?? stageToUpdate.stockNm;
      const tunedNm = updateData.tunedNm ?? stageToUpdate.tunedNm;
      if (stockNm !== null && tunedNm !== null) {
        updateData.gainNm = tunedNm - stockNm;
      }
    }

    // Step 6: Update stage using direct MongoDB query (single operation!)
    await updateStage(stageToUpdate.id, updateData);

    return NextResponse.json({
      message: 'Stage updated successfully',
      stage: { ...stageToUpdate, ...updateData }
    });

  } catch (error) {
    console.error('❌ Stage update error:', error);
    return NextResponse.json(
      { message: 'Update failed', error: error.message },
      { status: 500 }
    );
  }
}

