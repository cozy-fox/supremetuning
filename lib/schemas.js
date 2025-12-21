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
        },
        logo: {
          bsonType: ['string', 'null'],
          description: 'Brand logo as base64 data URL (optional)'
        }
      }
    }
  },
  validationLevel: 'strict',
  validationAction: 'error'
};

/**
 * Group Schema
 * Performance/category groups within a brand (e.g., Audi RS, BMW M, Mercedes-AMG)
 */
export const groupSchema = {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['id', 'brandId', 'name'],
      properties: {
        id: {
          bsonType: 'int',
          description: 'Unique group identifier - required'
        },
        brandId: {
          bsonType: 'int',
          description: 'Foreign key to brands collection - required'
        },
        name: {
          bsonType: 'string',
          minLength: 1,
          maxLength: 100,
          description: 'Group name (e.g., "RS", "M", "AMG", "Standard") - required'
        },
        slug: {
          bsonType: 'string',
          description: 'URL-friendly slug (optional)'
        },
        isPerformance: {
          bsonType: 'bool',
          description: 'Whether this is a performance group (RS, M, AMG)'
        },
        logo: {
          bsonType: 'string',
          description: 'Logo/icon path for the group (optional)'
        },
        order: {
          bsonType: 'int',
          description: 'Display order within brand (optional)'
        }
      }
    }
  },
  validationLevel: 'strict',
  validationAction: 'error'
};

/**
 * Model Schema
 * Car models belonging to a brand and group
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
        groupId: {
          bsonType: 'int',
          description: 'Foreign key to groups collection (optional for backward compatibility)'
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
 * Audit Log Schema
 * Tracks all changes to data with before/after snapshots
 */
export const auditLogSchema = {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['collection', 'documentId', 'action', 'changedAt'],
      properties: {
        collection: {
          bsonType: 'string',
          enum: ['brands', 'groups', 'models', 'types', 'engines', 'stages'],
          description: 'Collection name - required'
        },
        documentId: {
          bsonType: 'int',
          description: 'Document ID that was changed - required'
        },
        action: {
          bsonType: 'string',
          enum: ['create', 'update', 'delete', 'move'],
          description: 'Type of action performed - required'
        },
        before: {
          bsonType: ['object', 'null'],
          description: 'Document state before change (null for create)'
        },
        after: {
          bsonType: ['object', 'null'],
          description: 'Document state after change (null for delete)'
        },
        changes: {
          bsonType: 'object',
          description: 'Specific fields that changed (optional)'
        },
        changedBy: {
          bsonType: 'string',
          description: 'Admin username who made the change (optional)'
        },
        changedAt: {
          bsonType: 'date',
          description: 'Timestamp of change - required'
        },
        version: {
          bsonType: 'int',
          description: 'Version number for this document (optional)'
        },
        metadata: {
          bsonType: 'object',
          description: 'Additional metadata (IP, user agent, etc.)'
        }
      }
    }
  },
  validationLevel: 'strict',
  validationAction: 'error'
};

/**
 * Full Backup Schema
 * Stores complete database snapshots
 */
export const fullBackupSchema = {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['timestamp', 'type', 'status'],
      properties: {
        timestamp: {
          bsonType: 'date',
          description: 'Backup timestamp - required'
        },
        type: {
          bsonType: 'string',
          enum: ['manual', 'scheduled', 'pre-operation'],
          description: 'Backup type - required'
        },
        status: {
          bsonType: 'string',
          enum: ['in_progress', 'completed', 'failed'],
          description: 'Backup status - required'
        },
        description: {
          bsonType: 'string',
          description: 'Backup description (optional)'
        },
        filePath: {
          bsonType: 'string',
          description: 'Path to backup file (optional)'
        },
        size: {
          bsonType: 'int',
          description: 'Backup size in bytes (optional)'
        },
        collections: {
          bsonType: 'object',
          description: 'Document counts per collection'
        },
        error: {
          bsonType: 'string',
          description: 'Error message if failed (optional)'
        },
        createdBy: {
          bsonType: 'string',
          description: 'Admin who created backup (optional)'
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
  groups: [
    { key: { id: 1 }, options: { unique: true, name: 'id_unique' } },
    { key: { brandId: 1 }, options: { name: 'brandId_index' } },
    { key: { name: 1 }, options: { name: 'name_index' } },
    { key: { brandId: 1, name: 1 }, options: { name: 'brand_name_compound' } },
    { key: { brandId: 1, order: 1 }, options: { name: 'brand_order_compound' } },
    { key: { slug: 1 }, options: { sparse: true, name: 'slug_index' } }
  ],
  models: [
    { key: { id: 1 }, options: { unique: true, name: 'id_unique' } },
    { key: { brandId: 1 }, options: { name: 'brandId_index' } },
    { key: { groupId: 1 }, options: { sparse: true, name: 'groupId_index' } },
    { key: { name: 1 }, options: { name: 'name_index' } },
    { key: { brandId: 1, name: 1 }, options: { name: 'brand_name_compound' } },
    { key: { groupId: 1, name: 1 }, options: { sparse: true, name: 'group_name_compound' } },
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
  ],
  audit_logs: [
    { key: { changedAt: -1 }, options: { name: 'changedAt_desc' } },
    { key: { collection: 1, documentId: 1 }, options: { name: 'collection_document_compound' } },
    { key: { collection: 1, changedAt: -1 }, options: { name: 'collection_time_compound' } },
    { key: { action: 1, changedAt: -1 }, options: { name: 'action_time_compound' } }
  ],
  full_backups: [
    { key: { timestamp: -1 }, options: { name: 'timestamp_desc' } },
    { key: { type: 1, timestamp: -1 }, options: { name: 'type_time_compound' } },
    { key: { status: 1 }, options: { name: 'status_index' } }
  ]
};

/**
 * Get schema for a collection
 */
export function getSchema(collectionName) {
  const schemas = {
    brands: brandSchema,
    groups: groupSchema,
    models: modelSchema,
    types: typeSchema,
    engines: engineSchema,
    stages: stageSchema,
    backups: backupSchema,
    metadata: metadataSchema,
    audit_logs: auditLogSchema,
    full_backups: fullBackupSchema
  };
  return schemas[collectionName];
}

/**
 * Get indexes for a collection
 */
export function getIndexes(collectionName) {
  return indexDefinitions[collectionName] || [];
}


