import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function PUT(request) {
  try {
    const { stage1PlusPercentage, stage2PlusPercentage } = await request.json();

    console.log('🎯 Stage+ Pricing Request:', { stage1PlusPercentage, stage2PlusPercentage });

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

    // Get all stages
    const allStages = await stagesCollection.find({}).toArray();
    
    console.log(`📊 Found ${allStages.length} total stages`);

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

