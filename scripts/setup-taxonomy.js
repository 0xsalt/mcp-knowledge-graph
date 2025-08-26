#!/usr/bin/env node

/**
 * TELOS Taxonomy Setup Script
 * 
 * This script initializes a basic TELOS knowledge graph structure with
 * sample entities and relationships using the new taxonomy system.
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
TELOS Taxonomy Setup Script

Usage: node scripts/setup-taxonomy.js [options]

Options:
  --memory-path <path>    Custom path for memory.jsonl file
  --help, -h              Show this help message

Examples:
  node scripts/setup-taxonomy.js --memory-path ~/.claude/memory.jsonl
  node scripts/setup-taxonomy.js --memory-path ./my-memory.jsonl

Default memory location: ./memory.jsonl (relative to current working directory)
`);
  process.exit(0);
}

// Use custom path or default to current working directory
const MEMORY_FILE_PATH = memoryPath || path.join(process.cwd(), 'memory.jsonl');

// Sample TELOS entities covering all 12 categories
const SAMPLE_ENTITIES = [
  {
    name: "default_user",
    entityType: "Identity",
    telosCategory: "Identity",
    observations: ["Today their TELOS-structured knowledge graph began", "Interested in optimizing knowledge systems"]
  },
  {
    name: "knowledge_graph_implementation",
    entityType: "Projects",
    telosCategory: "Projects", 
    observations: ["Implementing comprehensive TELOS relationship taxonomy", "7 relationship types across 12 categories", "Focus on usability and rich semantic connections"]
  },
  {
    name: "daily_reflection_habit",
    entityType: "Habits",
    telosCategory: "Habits",
    observations: ["Daily practice of reviewing progress and insights", "Supports continuous learning", "15 minutes each evening"]
  },
  {
    name: "claude_mcp_integration",
    entityType: "Resources",
    telosCategory: "Resources",
    observations: ["MCP Knowledge Graph server for persistent memory", "TypeScript-based implementation", "Provides semantic search capabilities"]
  },
  {
    name: "productivity_optimization_goal",
    entityType: "Objectives", 
    telosCategory: "Objectives",
    observations: ["12-18 month goal to optimize personal and team productivity", "Focus on knowledge management systems", "Measurable through improved task completion rates"]
  },
  {
    name: "remote_work_context",
    entityType: "Context",
    telosCategory: "Context",
    observations: ["Distributed team environment", "Async communication preferred", "Multiple time zones"]
  },
  {
    name: "tdd_development_convention",
    entityType: "Conventions",
    telosCategory: "Conventions", 
    observations: ["Test-driven development methodology", "Write tests before implementation", "Debug logging for complex features"]
  },
  {
    name: "ai_knowledge_systems_learning",
    entityType: "Memory",
    telosCategory: "Memory",
    observations: ["Experience building knowledge graph systems", "Understanding of semantic relationships", "Lessons learned about balancing complexity with usability"]
  },
  {
    name: "scope_creep_risk",
    entityType: "Risks",
    telosCategory: "Risks",
    observations: ["Risk of over-engineering taxonomy system", "Could make system too complex for daily use", "Mitigation: Regular usability testing"]
  },
  {
    name: "taxonomy_design_decision",
    entityType: "DecisionJournal",
    telosCategory: "DecisionJournal",
    observations: ["Decision to use 7 relationship types instead of 3", "Reasoning: Need to capture constraints and risks", "Expected outcome: Richer semantic modeling"]
  },
  {
    name: "development_team_relationship",
    entityType: "Relationships", 
    telosCategory: "Relationships",
    observations: ["Active collaboration on knowledge systems", "Weekly sync meetings", "Shared interest in AI and productivity tools"]
  },
  {
    name: "weekly_project_retrospective",
    entityType: "Retros",
    telosCategory: "Retros",
    observations: ["Weekly review of project progress", "Focus on what worked well and areas for improvement", "Action items for next iteration"]
  }
];

// Sample relationships demonstrating all 7 relationship types
const SAMPLE_RELATIONSHIPS = [
  // supports relationships
  { from: "daily_reflection_habit", to: "knowledge_graph_implementation", relationType: "supports" },
  { from: "knowledge_graph_implementation", to: "productivity_optimization_goal", relationType: "supports" },
  { from: "tdd_development_convention", to: "knowledge_graph_implementation", relationType: "supports" },
  
  // enables relationships
  { from: "claude_mcp_integration", to: "knowledge_graph_implementation", relationType: "enables" },
  { from: "remote_work_context", to: "productivity_optimization_goal", relationType: "enables" },
  
  // constrains relationships  
  { from: "remote_work_context", to: "knowledge_graph_implementation", relationType: "constrains" },
  { from: "tdd_development_convention", to: "daily_reflection_habit", relationType: "constrains" },
  
  // mentors relationships (from people/relationships)
  { from: "development_team_relationship", to: "knowledge_graph_implementation", relationType: "mentors" },
  { from: "development_team_relationship", to: "productivity_optimization_goal", relationType: "mentors" },
  
  // informs relationships
  { from: "ai_knowledge_systems_learning", to: "taxonomy_design_decision", relationType: "informs" },
  { from: "remote_work_context", to: "productivity_optimization_goal", relationType: "informs" },
  
  // reflects_on relationships
  { from: "weekly_project_retrospective", to: "knowledge_graph_implementation", relationType: "reflects_on" },
  { from: "taxonomy_design_decision", to: "daily_reflection_habit", relationType: "reflects_on" },
  
  // threatens relationships (from risks)
  { from: "scope_creep_risk", to: "knowledge_graph_implementation", relationType: "threatens" },
  { from: "scope_creep_risk", to: "productivity_optimization_goal", relationType: "threatens" }
];

async function createMemoryFile() {
  try {
    // Create JSONL entries
    const entityLines = SAMPLE_ENTITIES.map(entity => 
      JSON.stringify({ type: "entity", ...entity })
    );
    
    const relationLines = SAMPLE_RELATIONSHIPS.map(relation => 
      JSON.stringify({ type: "relation", ...relation })
    );
    
    const allLines = [...entityLines, ...relationLines];
    
    // Write to memory file
    await fs.writeFile(MEMORY_FILE_PATH, allLines.join('\n'));
    
    console.log('PASS TELOS taxonomy setup completed successfully!');
    console.log(`Memory file created: ${MEMORY_FILE_PATH}`);
    console.log(`Created ${SAMPLE_ENTITIES.length} entities and ${SAMPLE_RELATIONSHIPS.length} relationships`);
    
    // Show summary by category
    const categoryCounts = SAMPLE_ENTITIES.reduce((counts, entity) => {
      counts[entity.telosCategory] = (counts[entity.telosCategory] || 0) + 1;
      return counts;
    }, {});
    
    console.log('\nEntities by TELOS Category:');
    Object.entries(categoryCounts).forEach(([category, count]) => {
      console.log(`   ${category}: ${count}`);
    });
    
    // Show relationship type summary
    const relationshipCounts = SAMPLE_RELATIONSHIPS.reduce((counts, relation) => {
      counts[relation.relationType] = (counts[relation.relationType] || 0) + 1;
      return counts;
    }, {});
    
    console.log('\nRelationships by Type:');
    Object.entries(relationshipCounts).forEach(([type, count]) => {
      console.log(`   ${type}: ${count}`);
    });
    
    console.log('\nYour TELOS knowledge graph is ready to use!');
    console.log('You can now start the MCP server and begin adding your own entities and relationships.');
    
  } catch (error) {
    console.error('❌ Error setting up TELOS taxonomy:', error.message);
    process.exit(1);
  }
}

async function main() {
  console.log('🚀 Setting up TELOS Relationship Taxonomy...\n');
  
  // Check if memory file already exists
  try {
    await fs.access(MEMORY_FILE_PATH);
    console.log('Memory file already exists:', MEMORY_FILE_PATH);
    console.log('This will overwrite the existing file. Continue? (y/N)');
    
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.on('data', async (key) => {
      const input = key.toString().toLowerCase();
      if (input === 'y' || input === 'yes\n') {
        process.stdin.pause();
        await createMemoryFile();
        process.exit(0);
      } else {
        console.log('Setup cancelled.');
        process.exit(0);
      }
    });
  } catch (error) {
    // File doesn't exist, proceed with setup
    await createMemoryFile();
  }
}

// Handle command line execution
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}