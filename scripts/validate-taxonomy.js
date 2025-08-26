#!/usr/bin/env node

/**
 * TELOS Taxonomy Validation Script
 * 
 * This script validates the knowledge graph against the TELOS relationship
 * taxonomy rules and provides a comprehensive report of the graph structure.
 */

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import minimist from 'minimist';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Parse command line arguments
const argv = minimist(process.argv.slice(2));
let memoryPath = argv['memory-path'];

// Show help if requested
if (argv.help || argv.h) {
  console.log(`
TELOS Taxonomy Validation Script

Usage: node scripts/validate-taxonomy.js [options]

Options:
  --memory-path <path>    Custom path for memory.jsonl file
  --help, -h              Show this help message

Examples:
  node scripts/validate-taxonomy.js --memory-path ~/.claude/memory.jsonl
  node scripts/validate-taxonomy.js --memory-path ./my-memory.jsonl

Default memory location: ./memory.jsonl (relative to current working directory)
`);
  process.exit(0);
}

// Use custom path or default to current working directory
const MEMORY_FILE_PATH = memoryPath || path.join(process.cwd(), 'memory.jsonl');

// Import relationship validation logic
const VALID_TELOS_CATEGORIES = [
  'Identity', 'Memory', 'Resources', 'Context', 'Conventions', 
  'Objectives', 'Projects', 'Habits', 'Risks', 'DecisionJournal', 
  'Relationships', 'Retros'
];

const VALID_RELATIONSHIP_TYPES = [
  'supports', 'enables', 'constrains', 'mentors', 
  'informs', 'reflects_on', 'threatens'
];

const RELATIONSHIP_MATRIX = {
  'Identity': ['supports', 'enables', 'constrains', 'mentors', 'informs', 'reflects_on'],
  'Memory': ['supports', 'enables', 'constrains', 'informs'],
  'Resources': ['supports', 'enables', 'constrains', 'informs'],
  'Context': ['supports', 'enables', 'constrains', 'informs'],
  'Conventions': ['supports', 'enables', 'constrains', 'informs'],
  'Objectives': ['supports', 'enables', 'constrains', 'mentors', 'informs', 'reflects_on'],
  'Projects': ['supports', 'enables', 'constrains', 'mentors', 'informs', 'reflects_on'],
  'Habits': ['supports', 'enables', 'constrains', 'mentors', 'informs', 'reflects_on'],
  'Risks': ['mentors', 'informs', 'reflects_on', 'threatens'],
  'DecisionJournal': ['supports', 'enables', 'constrains', 'mentors', 'informs', 'reflects_on'],
  'Relationships': ['supports', 'enables', 'constrains', 'mentors', 'informs', 'reflects_on'],
  'Retros': ['supports', 'enables', 'constrains', 'mentors', 'informs', 'reflects_on']
};

async function loadKnowledgeGraph() {
  try {
    const data = await fs.readFile(MEMORY_FILE_PATH, 'utf-8');
    const lines = data.split('\n').filter(line => line.trim() !== '');
    
    const entities = [];
    const relations = [];
    
    for (const line of lines) {
      try {
        const item = JSON.parse(line);
        if (item.type === 'entity') entities.push(item);
        if (item.type === 'relation') relations.push(item);
      } catch (parseError) {
        console.warn(`Skipping invalid JSON line: ${line}`);
      }
    }
    
    return { entities, relations };
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw new Error(`Memory file not found: ${MEMORY_FILE_PATH}. Run setup-taxonomy.js first.`);
    }
    throw error;
  }
}

function validateEntities(entities) {
  const validation = {
    valid: 0,
    invalid: 0,
    issues: [],
    categoryDistribution: {}
  };
  
  for (const entity of entities) {
    let isValid = true;
    
    // Check required fields
    if (!entity.name || !entity.entityType) {
      validation.issues.push(`Entity missing required fields: ${JSON.stringify(entity)}`);
      isValid = false;
    }
    
    // Check TELOS category
    const category = entity.telosCategory;
    if (category) {
      if (!VALID_TELOS_CATEGORIES.includes(category)) {
        validation.issues.push(`Invalid TELOS category '${category}' for entity '${entity.name}'`);
        isValid = false;
      } else {
        validation.categoryDistribution[category] = (validation.categoryDistribution[category] || 0) + 1;
      }
    } else {
      validation.issues.push(`Entity '${entity.name}' missing TELOS category`);
      isValid = false;
    }
    
    // Check observations
    if (!entity.observations || !Array.isArray(entity.observations)) {
      validation.issues.push(`Entity '${entity.name}' missing or invalid observations array`);
      isValid = false;
    }
    
    if (isValid) {
      validation.valid++;
    } else {
      validation.invalid++;
    }
  }
  
  return validation;
}

function validateRelationships(relations, entities) {
  const validation = {
    valid: 0,
    invalid: 0,
    issues: [],
    typeDistribution: {},
    orphanedRelations: []
  };
  
  const entityNames = new Set(entities.map(e => e.name));
  const entityCategories = new Map(entities.map(e => [e.name, e.telosCategory]));
  
  for (const relation of relations) {
    let isValid = true;
    
    // Check required fields
    if (!relation.from || !relation.to || !relation.relationType) {
      validation.issues.push(`Relation missing required fields: ${JSON.stringify(relation)}`);
      isValid = false;
      continue;
    }
    
    // Check if entities exist
    if (!entityNames.has(relation.from)) {
      validation.orphanedRelations.push(`Relation references non-existent entity: ${relation.from}`);
      isValid = false;
    }
    if (!entityNames.has(relation.to)) {
      validation.orphanedRelations.push(`Relation references non-existent entity: ${relation.to}`);
      isValid = false;
    }
    
    // Check relationship type validity
    if (!VALID_RELATIONSHIP_TYPES.includes(relation.relationType)) {
      validation.issues.push(`Invalid relationship type '${relation.relationType}' in relation ${relation.from} -> ${relation.to}`);
      isValid = false;
    } else {
      validation.typeDistribution[relation.relationType] = (validation.typeDistribution[relation.relationType] || 0) + 1;
    }
    
    // Check relationship type against TELOS categories
    if (entityNames.has(relation.from) && entityNames.has(relation.to)) {
      const fromCategory = entityCategories.get(relation.from);
      const toCategory = entityCategories.get(relation.to);
      
      if (fromCategory && RELATIONSHIP_MATRIX[fromCategory]) {
        if (!RELATIONSHIP_MATRIX[fromCategory].includes(relation.relationType)) {
          validation.issues.push(
            `Relationship type '${relation.relationType}' not valid for category '${fromCategory}' ` +
            `(${relation.from} -> ${relation.to}). Valid types: ${RELATIONSHIP_MATRIX[fromCategory].join(', ')}`
          );
          isValid = false;
        }
      }
      
      // Special validations
      if (relation.relationType === 'mentors' && fromCategory !== 'Relationships') {
        validation.issues.push(
          `'mentors' relationship should only be used by Relationships category, ` + 
          `not '${fromCategory}' (${relation.from} -> ${relation.to})`
        );
        isValid = false;
      }
      
      if (relation.relationType === 'threatens' && fromCategory !== 'Risks') {
        validation.issues.push(
          `'threatens' relationship should only be used by Risks category, ` +
          `not '${fromCategory}' (${relation.from} -> ${relation.to})`
        );
        isValid = false;
      }
    }
    
    if (isValid) {
      validation.valid++;
    } else {
      validation.invalid++;
    }
  }
  
  return validation;
}

function generateReport(entityValidation, relationshipValidation, entities, relations) {
  console.log('🔍 TELOS Taxonomy Validation Report');
  console.log('=====================================\n');
  
  // Overall summary
  const totalEntities = entities.length;
  const totalRelations = relations.length;
  const overallValid = entityValidation.invalid === 0 && relationshipValidation.invalid === 0;
  
  console.log(`Overall Status: ${overallValid ? 'PASS VALID' : 'FAIL ISSUES FOUND'}`);
  console.log(`Total Entities: ${totalEntities} (${entityValidation.valid} valid, ${entityValidation.invalid} invalid)`);
  console.log(`Total Relations: ${totalRelations} (${relationshipValidation.valid} valid, ${relationshipValidation.invalid} invalid)\\n`);
  
  // Entity validation details
  console.log('Entity Validation:');
  if (entityValidation.invalid === 0) {
    console.log('   PASS All entities are valid');
  } else {
    console.log(`   FAIL ${entityValidation.invalid} invalid entities found`);
    entityValidation.issues.forEach(issue => console.log(`   • ${issue}`));
  }
  
  // TELOS category distribution
  console.log('\nTELOS Category Distribution:');
  const sortedCategories = Object.entries(entityValidation.categoryDistribution)
    .sort(([,a], [,b]) => b - a);
  
  if (sortedCategories.length === 0) {
    console.log('   No valid categories found');
  } else {
    sortedCategories.forEach(([category, count]) => {
      console.log(`   ${category}: ${count}`);
    });
  }
  
  // Relationship validation details
  console.log('\nRelationship Validation:');
  if (relationshipValidation.invalid === 0) {
    console.log('   PASS All relationships are valid');
  } else {
    console.log(`   FAIL ${relationshipValidation.invalid} invalid relationships found`);
    relationshipValidation.issues.forEach(issue => console.log(`   • ${issue}`));
  }
  
  // Orphaned relations
  if (relationshipValidation.orphanedRelations.length > 0) {
    console.log('\n🔍 Orphaned Relations:');
    relationshipValidation.orphanedRelations.forEach(orphan => console.log(`   • ${orphan}`));
  }
  
  // Relationship type distribution
  console.log('\nRelationship Type Distribution:');
  const sortedTypes = Object.entries(relationshipValidation.typeDistribution)
    .sort(([,a], [,b]) => b - a);
  
  if (sortedTypes.length === 0) {
    console.log('   No valid relationship types found');
  } else {
    sortedTypes.forEach(([type, count]) => {
      console.log(`   ${type}: ${count}`);
    });
  }
  
  // Coverage analysis
  console.log('\nCoverage Analysis:');
  const usedCategories = Object.keys(entityValidation.categoryDistribution);
  const missingCategories = VALID_TELOS_CATEGORIES.filter(cat => !usedCategories.includes(cat));
  
  if (missingCategories.length === 0) {
    console.log('   PASS All TELOS categories are represented');
  } else {
    console.log(`   📝 Missing categories (${missingCategories.length}): ${missingCategories.join(', ')}`);
  }
  
  const usedRelationshipTypes = Object.keys(relationshipValidation.typeDistribution);
  const missingRelationshipTypes = VALID_RELATIONSHIP_TYPES.filter(type => !usedRelationshipTypes.includes(type));
  
  if (missingRelationshipTypes.length === 0) {
    console.log('   PASS All relationship types are represented');
  } else {
    console.log(`   Missing relationship types (${missingRelationshipTypes.length}): ${missingRelationshipTypes.join(', ')}`);
  }
  
  console.log('\n=====================================');
  console.log(`Validation completed: ${overallValid ? 'PASS SUCCESS' : 'FAIL FAILED'}`);
}

async function main() {
  try {
    console.log('🔍 Validating TELOS knowledge graph...\n');
    
    const { entities, relations } = await loadKnowledgeGraph();
    
    const entityValidation = validateEntities(entities);
    const relationshipValidation = validateRelationships(relations, entities);
    
    generateReport(entityValidation, relationshipValidation, entities, relations);
    
    // Exit with error code if validation failed
    const hasErrors = entityValidation.invalid > 0 || relationshipValidation.invalid > 0;
    process.exit(hasErrors ? 1 : 0);
    
  } catch (error) {
    console.error('FAIL Validation failed:', error.message);
    process.exit(1);
  }
}

// Handle command line execution
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}