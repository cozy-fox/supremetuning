/**
 * MongoDB Schema Definitions and Validation Rules
 * Professional database schema for Supreme Tuning application
 */

/**
 * Brand Schema
 * Top-level entity representing car manufacturers
 */
export const brandSchema = {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['id', 'name'],
      properties: {
        id: {
          bsonType: 'int',
          description: 'Unique brand identifier - required'
        },
        name: {
          bsonType: 'string',
          minLength: 1,
          maxLength: 100,
          description: 'Brand name - required'
        },
        slug: {
          bsonType: 'string',
          description: 'URL-friendly slug (optional)'
        }
      }
    }
  },
  validationLevel: 'strict',
  validationAction: 'error'
};

/**
 * Model Schema
 * Car models belonging to a brand
 */
export const modelSchema = {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['id', 'brandId', 'name'],
      properties: {
        id: {
          bsonType: 'int',
          description: 'Unique model identifier - required'
        },
        brandId: {
          bsonType: 'int',
          description: 'Foreign key to brands collection - required'
        },
        name: {
          bsonType: 'string',
          minLength: 1,
          maxLength: 100,
          description: 'Model name - required'
        },
        slug: {
          bsonType: 'string',
          description: 'URL-friendly slug (optional)'
        }
      }
    }
  },
  validationLevel: 'strict',
  validationAction: 'error'
};

/**
 * Type/Generation Schema
 * Specific generations or variants of a model
 */
export const typeSchema = {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['id', 'modelId', 'brandId', 'name'],
      properties: {
        id: {
          bsonType: 'int',
          description: 'Unique type identifier - required'
        },
        modelId: {
          bsonType: 'int',
          description: 'Foreign key to models collection - required'
        },
        brandId: {
          bsonType: 'int',
          description: 'Foreign key to brands collection - required'
        },
        brandName: {
          bsonType: 'string',
          description: 'Denormalized brand name for performance'
        },
        modelName: {
          bsonType: 'string',
          description: 'Denormalized model name for performance'
        },
        name: {
          bsonType: 'string',
          minLength: 1,
          maxLength: 200,
          description: 'Type/generation name (e.g., "GB - 2018 ->...") - required'
        },
        slug: {
          bsonType: 'string',
          description: 'URL-friendly slug (optional)'
        }
      }
    }
  },
  validationLevel: 'strict',
  validationAction: 'error'
};

/**
 * Engine Schema
 * Engine variants for a specific type/generation
 */
export const engineSchema = {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['id', 'typeId', 'modelId', 'name', 'type'],
      properties: {
        id: {
          bsonType: 'int',
          description: 'Unique engine identifier - required'
        },
        typeId: {
          bsonType: 'int',
          description: 'Foreign key to types collection - required'
        },
        modelId: {
          bsonType: 'int',
          description: 'Foreign key to models collection - required'
        },
        code: {
          bsonType: 'string',
          description: 'Engine code (optional)'
        },
        name: {
          bsonType: 'string',
          minLength: 1,
          maxLength: 200,
          description: 'Engine name (e.g., "25 TFSi - 1.0T") - required'
        },
        startYear: {
          bsonType: 'string',
          description: 'Production start year'
        },
        endYear: {
          bsonType: 'string',
          description: 'Production end year or "now"'
        },
        type: {
          bsonType: 'string',
          enum: ['petrol', 'diesel', 'hybrid', 'electric'],
          description: 'Engine fuel type - required'
        },
        power: {
          bsonType: 'int',
          minimum: 0,
          description: 'Stock power in HP'
        },
        slug: {
          bsonType: 'string',
          description: 'URL-friendly slug (optional)'
        }
      }
    }
  },
  validationLevel: 'strict',
  validationAction: 'error'
};

/**
 * Stage Schema
 * Tuning stages for a specific engine
 */
export const stageSchema = {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['id', 'engineId', 'stageName'],
      properties: {
        id: {
          bsonType: 'int',
          description: 'Unique stage identifier - required'
        },
        engineId: {
          bsonType: 'int',
          description: 'Foreign key to engines collection - required'
        },
        stageName: {
          bsonType: 'string',
          minLength: 1,
          maxLength: 100,
          description: 'Stage name (e.g., "Stage 1", "Stage 2") - required'
        },
        stockHp: {
          bsonType: ['int', 'null'],
          minimum: 0,
          description: 'Stock horsepower'
        },
        stockNm: {
          bsonType: ['int', 'null'],
          minimum: 0,
          description: 'Stock torque in Nm'
        },
        tunedHp: {
          bsonType: ['int', 'null'],
          minimum: 0,
          description: 'Tuned horsepower'
        },
        tunedNm: {
          bsonType: ['int', 'null'],
          minimum: 0,
          description: 'Tuned torque in Nm'
        },
        gainHp: {
          bsonType: ['int', 'null'],
          description: 'HP gain (calculated)'
        },
        gainNm: {
          bsonType: ['int', 'null'],
          description: 'Nm gain (calculated)'
        },
        oldPrice: {
          bsonType: ['string', 'null'],
          description: 'Old price (legacy field)'
        },
        newPrice: {
          bsonType: ['string', 'null'],
          description: 'New price (legacy field)'
        },
        price: {
          bsonType: ['int', 'null'],
          minimum: 0,
          description: 'Current price in cents'
        },
        currency: {
          bsonType: 'string',
          enum: ['EUR', 'USD', 'GBP'],
          description: 'Price currency'
        },
        hardwareMods: {
          bsonType: 'array',
          items: {
            bsonType: 'string'
          },
          description: 'Required hardware modifications'
        },
        ecuUnlock: {
          bsonType: ['bool', 'null'],
          description: 'ECU unlock required'
        },
        cpcUpgrade: {
          bsonType: ['bool', 'null'],
          description: 'CPC upgrade required'
        },
        gearboxLimitNm: {
          bsonType: ['int', 'null'],
          description: 'Gearbox torque limit in Nm'
        },
        recommendedGearboxTune: {
          bsonType: 'bool',
          description: 'Gearbox tune recommended'
        },
        notes: {
          bsonType: 'string',
          description: 'Additional notes'
        }
      }
    }
  },
  validationLevel: 'strict',
  validationAction: 'error'
};

/**
 * Backup Schema
 * Database backups with timestamp
 */
export const backupSchema = {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['timestamp', 'data'],
      properties: {
        timestamp: {
          bsonType: 'string',
          description: 'ISO timestamp - required'
        },
        data: {
          bsonType: 'object',
          description: 'Backup data - required'
        },
        description: {
          bsonType: 'string',
          description: 'Backup description (optional)'
        }
      }
    }
  },
  validationLevel: 'strict',
  validationAction: 'error'
};

/**
 * Metadata Schema
 * Application metadata and settings
 */
export const metadataSchema = {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['key'],
      properties: {
        key: {
          bsonType: 'string',
          description: 'Metadata key - required'
        },
        value: {
          description: 'Metadata value (any type)'
        },
        updatedAt: {
          bsonType: 'date',
          description: 'Last update timestamp'
        }
      }
    }
  },
  validationLevel: 'strict',
  validationAction: 'error'
};

/**
 * Index definitions for all collections
 */
export const indexDefinitions = {
  brands: [
    { key: { id: 1 }, options: { unique: true, name: 'id_unique' } },
    { key: { name: 1 }, options: { name: 'name_index' } },
    { key: { slug: 1 }, options: { sparse: true, name: 'slug_index' } }
  ],
  models: [
    { key: { id: 1 }, options: { unique: true, name: 'id_unique' } },
    { key: { brandId: 1 }, options: { name: 'brandId_index' } },
    { key: { name: 1 }, options: { name: 'name_index' } },
    { key: { brandId: 1, name: 1 }, options: { name: 'brand_name_compound' } },
    { key: { slug: 1 }, options: { sparse: true, name: 'slug_index' } }
  ],
  types: [
    { key: { id: 1 }, options: { unique: true, name: 'id_unique' } },
    { key: { modelId: 1 }, options: { name: 'modelId_index' } },
    { key: { brandId: 1 }, options: { name: 'brandId_index' } },
    { key: { modelId: 1, name: 1 }, options: { name: 'model_name_compound' } },
    { key: { slug: 1 }, options: { sparse: true, name: 'slug_index' } }
  ],
  engines: [
    { key: { id: 1 }, options: { unique: true, name: 'id_unique' } },
    { key: { typeId: 1 }, options: { name: 'typeId_index' } },
    { key: { modelId: 1 }, options: { name: 'modelId_index' } },
    { key: { type: 1 }, options: { name: 'type_index' } },
    { key: { typeId: 1, name: 1 }, options: { name: 'type_name_compound' } },
    { key: { slug: 1 }, options: { sparse: true, name: 'slug_index' } }
  ],
  stages: [
    { key: { id: 1 }, options: { unique: true, name: 'id_unique' } },
    { key: { engineId: 1 }, options: { name: 'engineId_index' } },
    { key: { engineId: 1, stageName: 1 }, options: { name: 'engine_stage_compound' } }
  ],
  backups: [
    { key: { timestamp: -1 }, options: { name: 'timestamp_desc' } }
  ],
  metadata: [
    { key: { key: 1 }, options: { unique: true, name: 'key_unique' } }
  ]
};

/**
 * Get schema for a collection
 */
export function getSchema(collectionName) {
  const schemas = {
    brands: brandSchema,
    models: modelSchema,
    types: typeSchema,
    engines: engineSchema,
    stages: stageSchema,
    backups: backupSchema,
    metadata: metadataSchema
  };
  return schemas[collectionName];
}

/**
 * Get indexes for a collection
 */
export function getIndexes(collectionName) {
  return indexDefinitions[collectionName] || [];
}


