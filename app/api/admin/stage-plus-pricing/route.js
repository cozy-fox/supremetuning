import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

/**
 * GET /api/admin/stage-plus-pricing - Get sample values for preview
 *
 * Query params:
 * - level: 'all', 'brand', 'model', 'generation', 'engine'
 * - targetId: ID of the target (optional, required for non-all levels)
 * - groupId: Optional group filter
 * - dataType: 'price', 'power', 'torque' (default: 'price')
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const level = searchParams.get('level') || 'all';
    const targetId = searchParams.get('targetId') ? parseInt(searchParams.get('targetId')) : null;
    const groupId = searchParams.get('groupId') ? parseInt(searchParams.get('groupId')) : null;
    const dataType = searchParams.get('dataType') || 'price';

    const client = await clientPromise;
    const db = client.db('supremetuning');
    const stagesCollection = db.collection('stages');
    const enginesCollection = db.collection('engines');
    const typesCollection = db.collection('types');
    const modelsCollection = db.collection('models');
    const brandsCollection = db.collection('brands');

    // Build filter for engines based on level
    let engineIds = [];
    let sampleInfo = { level };

    if (level === 'all') {
      // Get first engine with stages
      const firstEngine = await enginesCollection.findOne({});
      if (firstEngine) {
        engineIds = [firstEngine.id];
        sampleInfo.engineName = firstEngine.name;
      }
    } else if (level === 'brand' && targetId) {
      // Get first model and engine for this brand
      let brandModelsQuery = { brandId: targetId };
      if (groupId) {
        brandModelsQuery.groupId = groupId;
      }
      const firstModel = await modelsCollection.findOne(brandModelsQuery);
      if (firstModel) {
        const firstType = await typesCollection.findOne({ modelId: firstModel.id });
        if (firstType) {
          const firstEngine = await enginesCollection.findOne({ typeId: firstType.id });
          if (firstEngine) {
            engineIds = [firstEngine.id];
            sampleInfo.modelName = firstModel.name;
            sampleInfo.generationName = firstType.name;
            sampleInfo.engineName = firstEngine.name;
          }
        }
      }
      const brand = await brandsCollection.findOne({ id: targetId });
      if (brand) sampleInfo.brandName = brand.name;
    } else if (level === 'model' && targetId) {
      const firstType = await typesCollection.findOne({ modelId: targetId });
      if (firstType) {
        const firstEngine = await enginesCollection.findOne({ typeId: firstType.id });
        if (firstEngine) {
          engineIds = [firstEngine.id];
          sampleInfo.generationName = firstType.name;
          sampleInfo.engineName = firstEngine.name;
        }
      }
      const model = await modelsCollection.findOne({ id: targetId });
      if (model) sampleInfo.modelName = model.name;
    } else if (level === 'generation' && targetId) {
      const firstEngine = await enginesCollection.findOne({ typeId: targetId });
      if (firstEngine) {
        engineIds = [firstEngine.id];
        sampleInfo.engineName = firstEngine.name;
      }
      const type = await typesCollection.findOne({ id: targetId });
      if (type) sampleInfo.generationName = type.name;
    } else if (level === 'engine' && targetId) {
      engineIds = [targetId];
      const engine = await enginesCollection.findOne({ id: targetId });
      if (engine) sampleInfo.engineName = engine.name;
    }

    if (engineIds.length === 0) {
      return NextResponse.json({
        stage1Price: null,
        stage2Price: null,
        hasData: false,
        sampleInfo
      });
    }

    // Get stages for the sample engine
    const stages = await stagesCollection.find({
      engineId: { $in: engineIds }
    }).toArray();

    // Find Stage 1 and Stage 2
    const stage1 = stages.find(s =>
      s.stageName?.toLowerCase() === 'stage 1' ||
      s.stageName?.toLowerCase() === 'stage1'
    );
    const stage2 = stages.find(s =>
      s.stageName?.toLowerCase() === 'stage 2' ||
      s.stageName?.toLowerCase() === 'stage2'
    );

    // Return values based on dataType
    if (dataType === 'power') {
      return NextResponse.json({
        stage1Value: stage1?.tunedHp || null,
        stage2Value: stage2?.tunedHp || null,
        hasData: !!(stage1?.tunedHp || stage2?.tunedHp),
        sampleInfo,
        dataType,
        unit: 'HP'
      });
    } else if (dataType === 'torque') {
      return NextResponse.json({
        stage1Value: stage1?.tunedNm || null,
        stage2Value: stage2?.tunedNm || null,
        hasData: !!(stage1?.tunedNm || stage2?.tunedNm),
        sampleInfo,
        dataType,
        unit: 'Nm'
      });
    } else {
      // Default: price
      return NextResponse.json({
        stage1Value: stage1?.price || null,
        stage2Value: stage2?.price || null,
        // Keep legacy fields for backward compatibility
        stage1Price: stage1?.price || null,
        stage2Price: stage2?.price || null,
        hasData: !!(stage1?.price || stage2?.price),
        sampleInfo,
        dataType: 'price',
        unit: '€'
      });
    }

  } catch (error) {
    console.error('❌ Stage+ preview error:', error);
    return NextResponse.json(
      { message: 'Failed to get preview prices', error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const {
      level = 'all',
      targetId = null,
      stage1PlusPercentage,
      stage2PlusPercentage,
      groupId = null,
      dataType = 'price' // 'price', 'power', or 'torque'
    } = await request.json();

    console.log('🎯 Stage+ Update Request:', {
      level,
      targetId,
      dataType,
      stage1PlusPercentage,
      stage2PlusPercentage,
      groupId
    });

    if (typeof stage1PlusPercentage !== 'number' || typeof stage2PlusPercentage !== 'number') {
      return NextResponse.json(
        { message: 'Invalid percentage values' },
        { status: 400 }
      );
    }

    if (stage1PlusPercentage < 0 || stage1PlusPercentage > 100 ||
        stage2PlusPercentage < 0 || stage2PlusPercentage > 100) {
      return NextResponse.json(
        { message: 'Percentage must be between 0 and 100' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db('supremetuning');
    const stagesCollection = db.collection('stages');
    const enginesCollection = db.collection('engines');
    const typesCollection = db.collection('types');
    const modelsCollection = db.collection('models');

    // Build filter for engines based on level
    let engineIds = [];

    if (level === 'all') {
      // Get all engines in the database
      const allEngines = await enginesCollection.find({}).toArray();
      engineIds = allEngines.map(e => e.id);
    } else if (level === 'brand') {
      // Get all models for this brand
      let brandModelsQuery = { brandId: targetId };

      // Apply group filter if specified
      if (groupId) {
        brandModelsQuery.groupId = groupId;
        console.log(`🔍 Filtering by group: ${groupId}`);
      }

      const brandModels = await modelsCollection.find(brandModelsQuery).toArray();
      const modelIds = brandModels.map(m => m.id);

      // Get all generations for these models
      const generations = await typesCollection.find({ modelId: { $in: modelIds } }).toArray();
      const generationIds = generations.map(g => g.id);

      // Get all engines for these generations
      const engines = await enginesCollection.find({ typeId: { $in: generationIds } }).toArray();
      engineIds = engines.map(e => e.id);
    } else if (level === 'model') {
      // Get all generations for this model
      const generations = await typesCollection.find({ modelId: targetId }).toArray();
      const generationIds = generations.map(g => g.id);

      // Get all engines for these generations
      const engines = await enginesCollection.find({ typeId: { $in: generationIds } }).toArray();
      engineIds = engines.map(e => e.id);
    } else if (level === 'generation') {
      // Get all engines for this generation
      const engines = await enginesCollection.find({ typeId: targetId }).toArray();
      engineIds = engines.map(e => e.id);
    } else if (level === 'engine') {
      // Just this specific engine
      engineIds = [targetId];
    }

    // Get stages for filtered engines
    const allStages = await stagesCollection.find({
      engineId: { $in: engineIds }
    }).toArray();

    console.log(`📊 Found ${allStages.length} stages for ${engineIds.length} engines (level: ${level}${targetId ? `, targetId: ${targetId}` : ''}${groupId ? `, groupId: ${groupId}` : ''})`);

    // Group stages by engineId
    const stagesByEngine = {};
    allStages.forEach(stage => {
      if (!stagesByEngine[stage.engineId]) {
        stagesByEngine[stage.engineId] = [];
      }
      stagesByEngine[stage.engineId].push(stage);
    });

    let updatedCount = 0;
    const bulkOperations = [];

    // Get the field name and unit based on dataType
    const getFieldInfo = () => {
      switch (dataType) {
        case 'power': return { field: 'tunedHp', unit: 'HP' };
        case 'torque': return { field: 'tunedNm', unit: 'Nm' };
        default: return { field: 'price', unit: '€' };
      }
    };
    const { field, unit } = getFieldInfo();

    // Process each engine's stages
    for (const [engineId, stages] of Object.entries(stagesByEngine)) {
      // Find base stages
      const stage1 = stages.find(s =>
        s.stageName?.toLowerCase() === 'stage 1' ||
        s.stageName?.toLowerCase() === 'stage1'
      );
      const stage2 = stages.find(s =>
        s.stageName?.toLowerCase() === 'stage 2' ||
        s.stageName?.toLowerCase() === 'stage2'
      );

      // Find plus stages
      const stage1Plus = stages.find(s =>
        s.stageName?.toLowerCase() === 'stage 1+' ||
        s.stageName?.toLowerCase() === 'stage1+'
      );
      const stage2Plus = stages.find(s =>
        s.stageName?.toLowerCase() === 'stage 2+' ||
        s.stageName?.toLowerCase() === 'stage2+'
      );

      // Update Stage 1+ based on Stage 1
      if (stage1 && stage1Plus && stage1[field]) {
        const newValue = Math.round(stage1[field] * (1 + stage1PlusPercentage / 100));
        bulkOperations.push({
          updateOne: {
            filter: { id: stage1Plus.id },
            update: { $set: { [field]: newValue } }
          }
        });
        updatedCount++;
        console.log(`  Stage 1+ ${dataType}: ${unit}${stage1[field]} → ${unit}${newValue} (+${stage1PlusPercentage}%)`);
      }

      // Update Stage 2+ based on Stage 2
      if (stage2 && stage2Plus && stage2[field]) {
        const newValue = Math.round(stage2[field] * (1 + stage2PlusPercentage / 100));
        bulkOperations.push({
          updateOne: {
            filter: { id: stage2Plus.id },
            update: { $set: { [field]: newValue } }
          }
        });
        updatedCount++;
        console.log(`  Stage 2+ ${dataType}: ${unit}${stage2[field]} → ${unit}${newValue} (+${stage2PlusPercentage}%)`);
      }
    }

    // Execute bulk update
    if (bulkOperations.length > 0) {
      const result = await stagesCollection.bulkWrite(bulkOperations);
      console.log(`✅ Updated ${result.modifiedCount} stage ${dataType} values`);
    }

    const dataTypeLabels = { price: 'prices', power: 'power values', torque: 'torque values' };
    return NextResponse.json({
      message: `Successfully updated ${updatedCount} Stage+ ${dataTypeLabels[dataType] || 'values'}`,
      updatedCount,
      dataType,
      stage1PlusPercentage,
      stage2PlusPercentage
    });

  } catch (error) {
    console.error('❌ Stage+ pricing error:', error);
    return NextResponse.json(
      { message: 'Failed to update Stage+ pricing', error: error.message },
      { status: 500 }
    );
  }
}

