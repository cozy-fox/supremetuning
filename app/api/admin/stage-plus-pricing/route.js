import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function PUT(request) {
  try {
    const {
      level = 'all',
      targetId = null,
      stage1PlusPercentage,
      stage2PlusPercentage,
      groupId = null
    } = await request.json();

    console.log('🎯 Stage+ Pricing Request:', {
      level,
      targetId,
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
      if (stage1 && stage1Plus && stage1.price) {
        const newPrice = Math.round(stage1.price * (1 + stage1PlusPercentage / 100));
        bulkOperations.push({
          updateOne: {
            filter: { id: stage1Plus.id },
            update: { $set: { price: newPrice } }
          }
        });
        updatedCount++;
        console.log(`  Stage 1+: €${stage1.price} → €${newPrice} (+${stage1PlusPercentage}%)`);
      }

      // Update Stage 2+ based on Stage 2
      if (stage2 && stage2Plus && stage2.price) {
        const newPrice = Math.round(stage2.price * (1 + stage2PlusPercentage / 100));
        bulkOperations.push({
          updateOne: {
            filter: { id: stage2Plus.id },
            update: { $set: { price: newPrice } }
          }
        });
        updatedCount++;
        console.log(`  Stage 2+: €${stage2.price} → €${newPrice} (+${stage2PlusPercentage}%)`);
      }
    }

    // Execute bulk update
    if (bulkOperations.length > 0) {
      const result = await stagesCollection.bulkWrite(bulkOperations);
      console.log(`✅ Updated ${result.modifiedCount} stage prices`);
    }

    return NextResponse.json({
      message: `Successfully updated ${updatedCount} Stage+ prices`,
      updatedCount,
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

