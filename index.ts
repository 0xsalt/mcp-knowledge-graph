#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import minimist from 'minimist';
import { isAbsolute } from 'path';
import { 
  RelationshipType, 
  TelosCategory, 
  validateRelationship,
  getDefaultRelationship,
  getSuggestedRelationships,
  detectTelosCategory,
  isValidRelationshipType,
  isValidTelosCategory 
} from './src/types/relationship-schema.js';

// Parse args and handle paths safely
const argv = minimist(process.argv.slice(2));
let memoryPath = argv['memory-path'];

// Show help if requested
if (argv.help || argv.h) {
  console.log(`
MCP Knowledge Graph Server

Usage: node dist/index.js [options]

Options:
  --memory-path <path>    Custom path for memory.jsonl file
  --help, -h              Show this help message

Examples:
  node dist/index.js --memory-path ~/.claude/memory.jsonl
  node dist/index.js --memory-path ./my-memory.jsonl

Default memory location: ./memory.jsonl (relative to current working directory)
`);
  process.exit(0);
}

// If a custom path is provided, ensure it's absolute
if (memoryPath && !isAbsolute(memoryPath)) {
    memoryPath = path.resolve(process.cwd(), memoryPath);
}

// Define the path to the JSONL file
const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Use the custom path or default to the current working directory
const MEMORY_FILE_PATH = memoryPath || path.join(process.cwd(), 'memory.jsonl');

// We are storing our memory using entities, relations, and observations in a graph structure
interface Entity {
  name: string;
  entityType: string;
  telosCategory?: TelosCategory;
  observations: string[];
}

interface Relation {
  from: string;
  to: string;
  relationType: string;
  fromCategory?: TelosCategory;
  toCategory?: TelosCategory;
}

interface KnowledgeGraph {
  entities: Entity[];
  relations: Relation[];
}

// The KnowledgeGraphManager class contains all operations to interact with the knowledge graph
class KnowledgeGraphManager {
  private async loadGraph(): Promise<KnowledgeGraph> {
    try {
      const data = await fs.readFile(MEMORY_FILE_PATH, "utf-8");
      const lines = data.split("\n").filter(line => line.trim() !== "");
      return lines.reduce((graph: KnowledgeGraph, line) => {
        const item = JSON.parse(line);
        if (item.type === "entity") graph.entities.push(item as Entity);
        if (item.type === "relation") graph.relations.push(item as Relation);
        return graph;
      }, { entities: [], relations: [] });
    } catch (error) {
      if (error instanceof Error && 'code' in error && (error as any).code === "ENOENT") {
        return { entities: [], relations: [] };
      }
      throw error;
    }
  }

  private async saveGraph(graph: KnowledgeGraph): Promise<void> {
    const lines = [
      ...graph.entities.map(e => JSON.stringify({ type: "entity", ...e })),
      ...graph.relations.map(r => JSON.stringify({ type: "relation", ...r })),
    ];
    await fs.writeFile(MEMORY_FILE_PATH, lines.join("\n"));
  }

  async createEntities(entities: Entity[]): Promise<Entity[]> {
    const graph = await this.loadGraph();
    const newEntities = entities.filter(e => !graph.entities.some(existingEntity => existingEntity.name === e.name));
    
    // Auto-detect TELOS category for new entities if not provided
    const entitiesWithCategories = newEntities.map(entity => {
      const telosCategory = entity.telosCategory || detectTelosCategory(entity.name, entity.observations);
      return {
        ...entity,
        telosCategory
      };
    });
    
    graph.entities.push(...entitiesWithCategories);
    await this.saveGraph(graph);
    return entitiesWithCategories;
  }

  async createRelations(relations: Relation[]): Promise<Relation[]> {
    const graph = await this.loadGraph();
    const validatedRelations: Relation[] = [];
    const validationErrors: string[] = [];
    
    for (const relation of relations) {
      // Skip if relation already exists
      const exists = graph.relations.some(existingRelation =>
        existingRelation.from === relation.from &&
        existingRelation.to === relation.to &&
        existingRelation.relationType === relation.relationType
      );
      
      if (exists) continue;
      
      // Find source and target entities to get their categories
      const fromEntity = graph.entities.find(e => e.name === relation.from);
      const toEntity = graph.entities.find(e => e.name === relation.to);
      
      if (!fromEntity || !toEntity) {
        validationErrors.push(`Entities not found for relation: ${relation.from} -> ${relation.to}`);
        continue;
      }
      
      const fromCategory = fromEntity.telosCategory || TelosCategory.CONTEXT;
      const toCategory = toEntity.telosCategory || TelosCategory.CONTEXT;
      
      // Validate relationship type if it's a known type
      if (isValidRelationshipType(relation.relationType)) {
        const validation = validateRelationship(fromCategory, toCategory, relation.relationType as RelationshipType);
        
        if (!validation.isValid) {
          const suggestedType = getDefaultRelationship(fromCategory, toCategory);
          validationErrors.push(`${validation.errorMessage}. Suggested: '${suggestedType}'`);
          
          // Auto-correct to suggested type
          validatedRelations.push({
            ...relation,
            relationType: suggestedType,
            fromCategory,
            toCategory
          });
        } else {
          validatedRelations.push({
            ...relation,
            fromCategory,
            toCategory
          });
        }
      } else {
        // Unknown relationship type - suggest default
        const suggestedType = getDefaultRelationship(fromCategory, toCategory);
        validationErrors.push(`Unknown relationship type '${relation.relationType}'. Using suggested: '${suggestedType}'`);
        
        validatedRelations.push({
          ...relation,
          relationType: suggestedType,
          fromCategory,
          toCategory
        });
      }
    }
    
    graph.relations.push(...validatedRelations);
    await this.saveGraph(graph);
    
    // Log validation errors for debugging
    if (validationErrors.length > 0) {
      console.error('Relationship validation warnings:', validationErrors);
    }
    
    return validatedRelations;
  }

  async addObservations(observations: { entityName: string; contents: string[] }[]): Promise<{ entityName: string; addedObservations: string[] }[]> {
    const graph = await this.loadGraph();
    const results = observations.map(o => {
      const entity = graph.entities.find(e => e.name === o.entityName);
      if (!entity) {
        throw new Error(`Entity with name ${o.entityName} not found`);
      }
      const newObservations = o.contents.filter(content => !entity.observations.includes(content));
      entity.observations.push(...newObservations);
      return { entityName: o.entityName, addedObservations: newObservations };
    });
    await this.saveGraph(graph);
    return results;
  }

  async deleteEntities(entityNames: string[]): Promise<void> {
    const graph = await this.loadGraph();
    graph.entities = graph.entities.filter(e => !entityNames.includes(e.name));
    graph.relations = graph.relations.filter(r => !entityNames.includes(r.from) && !entityNames.includes(r.to));
    await this.saveGraph(graph);
  }

  async deleteObservations(deletions: { entityName: string; observations: string[] }[]): Promise<void> {
    const graph = await this.loadGraph();
    deletions.forEach(d => {
      const entity = graph.entities.find(e => e.name === d.entityName);
      if (entity) {
        entity.observations = entity.observations.filter(o => !d.observations.includes(o));
      }
    });
    await this.saveGraph(graph);
  }

  async deleteRelations(relations: Relation[]): Promise<void> {
    const graph = await this.loadGraph();
    graph.relations = graph.relations.filter(r => !relations.some(delRelation =>
      r.from === delRelation.from &&
      r.to === delRelation.to &&
      r.relationType === delRelation.relationType
    ));
    await this.saveGraph(graph);
  }

  async readGraph(): Promise<KnowledgeGraph> {
    return this.loadGraph();
  }

  // Very basic search function
  async searchNodes(query: string): Promise<KnowledgeGraph> {
    const graph = await this.loadGraph();

    // Filter entities
    const filteredEntities = graph.entities.filter(e =>
      e.name.toLowerCase().includes(query.toLowerCase()) ||
      e.entityType.toLowerCase().includes(query.toLowerCase()) ||
      e.observations.some(o => o.toLowerCase().includes(query.toLowerCase()))
    );

    // Create a Set of filtered entity names for quick lookup
    const filteredEntityNames = new Set(filteredEntities.map(e => e.name));

    // Filter relations to only include those between filtered entities
    const filteredRelations = graph.relations.filter(r =>
      filteredEntityNames.has(r.from) && filteredEntityNames.has(r.to)
    );

    const filteredGraph: KnowledgeGraph = {
      entities: filteredEntities,
      relations: filteredRelations,
    };

    return filteredGraph;
  }

  async openNodes(names: string[]): Promise<KnowledgeGraph> {
    const graph = await this.loadGraph();

    // Filter entities
    const filteredEntities = graph.entities.filter(e => names.includes(e.name));

    // Create a Set of filtered entity names for quick lookup
    const filteredEntityNames = new Set(filteredEntities.map(e => e.name));

    // Filter relations to only include those between filtered entities
    const filteredRelations = graph.relations.filter(r =>
      filteredEntityNames.has(r.from) && filteredEntityNames.has(r.to)
    );

    const filteredGraph: KnowledgeGraph = {
      entities: filteredEntities,
      relations: filteredRelations,
    };

    return filteredGraph;
  }

  async queryRelationshipsByType(relationshipType: string): Promise<Relation[]> {
    const graph = await this.loadGraph();
    return graph.relations.filter(r => r.relationType === relationshipType);
  }

  async findRelationshipPaths(fromEntity: string, toEntity: string, maxDepth: number = 3): Promise<{ path: string[]; relationshipTypes: string[] }[]> {
    const graph = await this.loadGraph();
    const paths: { path: string[]; relationshipTypes: string[] }[] = [];
    const visited = new Set<string>();
    
    const findPaths = (current: string, target: string, currentPath: string[], currentRelationships: string[], depth: number) => {
      if (depth > maxDepth) return;
      if (current === target && currentPath.length > 1) {
        paths.push({ path: [...currentPath], relationshipTypes: [...currentRelationships] });
        return;
      }
      
      if (visited.has(current)) return;
      visited.add(current);
      
      // Find all relations from current entity
      const outgoingRelations = graph.relations.filter(r => r.from === current);
      
      for (const relation of outgoingRelations) {
        findPaths(
          relation.to,
          target,
          [...currentPath, relation.to],
          [...currentRelationships, relation.relationType],
          depth + 1
        );
      }
      
      visited.delete(current);
    };
    
    findPaths(fromEntity, toEntity, [fromEntity], [], 0);
    return paths;
  }

  async getRelationshipSuggestions(fromEntity: string, toEntity: string): Promise<{ suggestions: string[]; fromCategory: string; toCategory: string }> {
    const graph = await this.loadGraph();
    
    const fromEntityObj = graph.entities.find(e => e.name === fromEntity);
    const toEntityObj = graph.entities.find(e => e.name === toEntity);
    
    if (!fromEntityObj || !toEntityObj) {
      throw new Error(`One or both entities not found: ${fromEntity}, ${toEntity}`);
    }
    
    const fromCategory = fromEntityObj.telosCategory || TelosCategory.CONTEXT;
    const toCategory = toEntityObj.telosCategory || TelosCategory.CONTEXT;
    
    const suggestions = getSuggestedRelationships(fromCategory, toCategory);
    
    return {
      suggestions: suggestions.map(s => s.toString()),
      fromCategory: fromCategory.toString(),
      toCategory: toCategory.toString()
    };
  }
}

const knowledgeGraphManager = new KnowledgeGraphManager();


// The server instance and tools exposed to AI models
const server = new Server({
  name: "mcp-knowledge-graph",
  version: "1.0.1",
},    {
    capabilities: {
      tools: {},
    },
  },);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "create_entities",
        description: "Create multiple new entities in the knowledge graph",
        inputSchema: {
          type: "object",
          properties: {
            entities: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string", description: "The name of the entity" },
                  entityType: { type: "string", description: "The type of the entity" },
                  telosCategory: { 
                    type: "string", 
                    description: "Optional TELOS category (Identity, Memory, Resources, Context, Conventions, Objectives, Projects, Habits, Risks, DecisionJournal, Relationships, Retros). Will be auto-detected if not provided.",
                    enum: ["Identity", "Memory", "Resources", "Context", "Conventions", "Objectives", "Projects", "Habits", "Risks", "DecisionJournal", "Relationships", "Retros"]
                  },
                  observations: {
                    type: "array",
                    items: { type: "string" },
                    description: "An array of observation contents associated with the entity"
                  },
                },
                required: ["name", "entityType", "observations"],
              },
            },
          },
          required: ["entities"],
        },
      },
      {
        name: "create_relations",
        description: "Create multiple new relations between entities in the knowledge graph. Relations should be in active voice",
        inputSchema: {
          type: "object",
          properties: {
            relations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  from: { type: "string", description: "The name of the entity where the relation starts" },
                  to: { type: "string", description: "The name of the entity where the relation ends" },
                  relationType: { type: "string", description: "The type of the relation" },
                },
                required: ["from", "to", "relationType"],
              },
            },
          },
          required: ["relations"],
        },
      },
      {
        name: "add_observations",
        description: "Add new observations to existing entities in the knowledge graph",
        inputSchema: {
          type: "object",
          properties: {
            observations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  entityName: { type: "string", description: "The name of the entity to add the observations to" },
                  contents: {
                    type: "array",
                    items: { type: "string" },
                    description: "An array of observation contents to add"
                  },
                },
                required: ["entityName", "contents"],
              },
            },
          },
          required: ["observations"],
        },
      },
      {
        name: "delete_entities",
        description: "Delete multiple entities and their associated relations from the knowledge graph",
        inputSchema: {
          type: "object",
          properties: {
            entityNames: {
              type: "array",
              items: { type: "string" },
              description: "An array of entity names to delete"
            },
          },
          required: ["entityNames"],
        },
      },
      {
        name: "delete_observations",
        description: "Delete specific observations from entities in the knowledge graph",
        inputSchema: {
          type: "object",
          properties: {
            deletions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  entityName: { type: "string", description: "The name of the entity containing the observations" },
                  observations: {
                    type: "array",
                    items: { type: "string" },
                    description: "An array of observations to delete"
                  },
                },
                required: ["entityName", "observations"],
              },
            },
          },
          required: ["deletions"],
        },
      },
      {
        name: "delete_relations",
        description: "Delete multiple relations from the knowledge graph",
        inputSchema: {
          type: "object",
          properties: {
            relations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  from: { type: "string", description: "The name of the entity where the relation starts" },
                  to: { type: "string", description: "The name of the entity where the relation ends" },
                  relationType: { type: "string", description: "The type of the relation" },
                },
                required: ["from", "to", "relationType"],
              },
              description: "An array of relations to delete"
            },
          },
          required: ["relations"],
        },
      },
      {
        name: "read_graph",
        description: "Read the entire knowledge graph",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "search_nodes",
        description: "Search for nodes in the knowledge graph based on a query",
        inputSchema: {
          type: "object",
          properties: {
            query: { type: "string", description: "The search query to match against entity names, types, and observation content" },
          },
          required: ["query"],
        },
      },
      {
        name: "open_nodes",
        description: "Open specific nodes in the knowledge graph by their names",
        inputSchema: {
          type: "object",
          properties: {
            names: {
              type: "array",
              items: { type: "string" },
              description: "An array of entity names to retrieve",
            },
          },
          required: ["names"],
        },
      },
      {
        name: "query_relationships_by_type",
        description: "Query relationships by their type (supports, enables, constrains, etc.)",
        inputSchema: {
          type: "object",
          properties: {
            relationshipType: {
              type: "string",
              description: "The relationship type to filter by (supports, enables, constrains, mentors, informs, reflects_on, threatens)"
            },
          },
          required: ["relationshipType"],
        },
      },
      {
        name: "find_relationship_paths",
        description: "Find relationship paths between two entities with specified maximum depth",
        inputSchema: {
          type: "object",
          properties: {
            fromEntity: {
              type: "string",
              description: "The name of the starting entity"
            },
            toEntity: {
              type: "string",
              description: "The name of the target entity"
            },
            maxDepth: {
              type: "number",
              description: "Maximum depth to search (default: 3)",
              default: 3
            },
          },
          required: ["fromEntity", "toEntity"],
        },
      },
      {
        name: "get_relationship_suggestions",
        description: "Get suggested relationship types between two entities based on their TELOS categories",
        inputSchema: {
          type: "object",
          properties: {
            fromEntity: {
              type: "string",
              description: "The name of the source entity"
            },
            toEntity: {
              type: "string",
              description: "The name of the target entity"
            },
          },
          required: ["fromEntity", "toEntity"],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (!args) {
    throw new Error(`No arguments provided for tool: ${name}`);
  }

  switch (name) {
    case "create_entities":
      return { content: [{ type: "text", text: JSON.stringify(await knowledgeGraphManager.createEntities(args.entities as Entity[]), null, 2) }] };
    case "create_relations":
      return { content: [{ type: "text", text: JSON.stringify(await knowledgeGraphManager.createRelations(args.relations as Relation[]), null, 2) }] };
    case "add_observations":
      return { content: [{ type: "text", text: JSON.stringify(await knowledgeGraphManager.addObservations(args.observations as { entityName: string; contents: string[] }[]), null, 2) }] };
    case "delete_entities":
      await knowledgeGraphManager.deleteEntities(args.entityNames as string[]);
      return { content: [{ type: "text", text: "Entities deleted successfully" }] };
    case "delete_observations":
      await knowledgeGraphManager.deleteObservations(args.deletions as { entityName: string; observations: string[] }[]);
      return { content: [{ type: "text", text: "Observations deleted successfully" }] };
    case "delete_relations":
      await knowledgeGraphManager.deleteRelations(args.relations as Relation[]);
      return { content: [{ type: "text", text: "Relations deleted successfully" }] };
    case "read_graph":
      return { content: [{ type: "text", text: JSON.stringify(await knowledgeGraphManager.readGraph(), null, 2) }] };
    case "search_nodes":
      return { content: [{ type: "text", text: JSON.stringify(await knowledgeGraphManager.searchNodes(args.query as string), null, 2) }] };
    case "open_nodes":
      return { content: [{ type: "text", text: JSON.stringify(await knowledgeGraphManager.openNodes(args.names as string[]), null, 2) }] };
    case "query_relationships_by_type":
      return { content: [{ type: "text", text: JSON.stringify(await knowledgeGraphManager.queryRelationshipsByType(args.relationshipType as string), null, 2) }] };
    case "find_relationship_paths":
      return { content: [{ type: "text", text: JSON.stringify(await knowledgeGraphManager.findRelationshipPaths(args.fromEntity as string, args.toEntity as string, args.maxDepth as number || 3), null, 2) }] };
    case "get_relationship_suggestions":
      return { content: [{ type: "text", text: JSON.stringify(await knowledgeGraphManager.getRelationshipSuggestions(args.fromEntity as string, args.toEntity as string), null, 2) }] };
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Knowledge Graph MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
