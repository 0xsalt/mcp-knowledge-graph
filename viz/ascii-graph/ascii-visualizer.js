#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

class AsciiGraphVisualizer {
    constructor() {
        // ASCII symbols for different relationship types
        this.relationshipSymbols = {
            'supports': '├─→',
            'enables': '╞═→',
            'constrains': '├─┤',
            'mentors': '├◆→',
            'informs': '├··→',
            'reflects_on': '├~→',
            'threatens': '├××→'
        };
        
        // Category prefixes
        this.categoryPrefixes = {
            'Identity': '[I]',
            'Memory': '[M]',
            'Resources': '[R]',
            'Context': '[C]',
            'Conventions': '[V]',
            'Objectives': '[O]',
            'Projects': '[P]',
            'Habits': '[H]',
            'Risks': '[!]',
            'DecisionJournal': '[D]',
            'Relationships': '[~]',
            'Retros': '[↺]'
        };
        
        this.maxWidth = 120;
        this.indentSize = 2;
    }
    
    async loadKnowledgeGraph() {
        // Sample data - in production, this would call MCP memory API
        return {
            entities: [
                { name: "default_user", entityType: "Identity", telosCategory: "Identity" },
                { name: "knowledge_graph_implementation", entityType: "Projects", telosCategory: "Projects" },
                { name: "daily_reflection_habit", entityType: "Habits", telosCategory: "Habits" },
                { name: "claude_mcp_integration", entityType: "Resources", telosCategory: "Resources" },
                { name: "productivity_optimization_goal", entityType: "Objectives", telosCategory: "Objectives" },
                { name: "remote_work_context", entityType: "Context", telosCategory: "Context" },
                { name: "tdd_development_convention", entityType: "Conventions", telosCategory: "Conventions" },
                { name: "ai_knowledge_systems_learning", entityType: "Memory", telosCategory: "Memory" },
                { name: "scope_creep_risk", entityType: "Risks", telosCategory: "Risks" },
                { name: "taxonomy_design_decision", entityType: "DecisionJournal", telosCategory: "DecisionJournal" },
                { name: "development_team_relationship", entityType: "Relationships", telosCategory: "Relationships" },
                { name: "weekly_project_retrospective", entityType: "Retros", telosCategory: "Retros" },
                { name: "Ubuntu MATE Setup", entityType: "Project", telosCategory: "Projects" }
            ],
            relations: [
                { from: "daily_reflection_habit", to: "knowledge_graph_implementation", relationType: "supports" },
                { from: "knowledge_graph_implementation", to: "productivity_optimization_goal", relationType: "supports" },
                { from: "tdd_development_convention", to: "knowledge_graph_implementation", relationType: "supports" },
                { from: "claude_mcp_integration", to: "knowledge_graph_implementation", relationType: "enables" },
                { from: "remote_work_context", to: "productivity_optimization_goal", relationType: "enables" },
                { from: "remote_work_context", to: "knowledge_graph_implementation", relationType: "constrains" },
                { from: "tdd_development_convention", to: "daily_reflection_habit", relationType: "constrains" },
                { from: "development_team_relationship", to: "knowledge_graph_implementation", relationType: "mentors" },
                { from: "development_team_relationship", to: "productivity_optimization_goal", relationType: "mentors" },
                { from: "ai_knowledge_systems_learning", to: "taxonomy_design_decision", relationType: "informs" },
                { from: "remote_work_context", to: "productivity_optimization_goal", relationType: "informs" },
                { from: "weekly_project_retrospective", to: "knowledge_graph_implementation", relationType: "reflects_on" },
                { from: "taxonomy_design_decision", to: "daily_reflection_habit", relationType: "reflects_on" },
                { from: "scope_creep_risk", to: "knowledge_graph_implementation", relationType: "threatens" },
                { from: "scope_creep_risk", to: "productivity_optimization_goal", relationType: "threatens" }
            ]
        };
    }
    
    truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength - 3) + '...';
    }
    
    wrapText(text, maxWidth, indent = 0) {
        const words = text.split(' ');
        const lines = [];
        let currentLine = ' '.repeat(indent);
        
        for (const word of words) {
            if (currentLine.length + word.length + 1 <= maxWidth) {
                currentLine += (currentLine.trim() ? ' ' : '') + word;
            } else {
                lines.push(currentLine);
                currentLine = ' '.repeat(indent) + word;
            }
        }
        
        if (currentLine.trim()) {
            lines.push(currentLine);
        }
        
        return lines;
    }
    
    generateTreeView(data) {
        let output = [];
        
        // Header
        output.push('═'.repeat(this.maxWidth));
        output.push('MCP KNOWLEDGE GRAPH - TREE VIEW'.center(this.maxWidth));
        output.push('═'.repeat(this.maxWidth));
        output.push('');
        
        // Statistics
        const stats = this.calculateStatistics(data);
        output.push('GRAPH STATISTICS:');
        output.push(`  Total Entities: ${stats.totalEntities}`);
        output.push(`  Total Relations: ${stats.totalRelations}`);
        output.push(`  TELOS Categories: ${stats.telosCategories}`);
        output.push(`  Relationship Types: ${stats.relationshipTypes}`);
        output.push(`  Avg Connections per Node: ${stats.avgConnections}`);
        output.push('');
        
        // Group entities by category
        const categories = {};
        data.entities.forEach(entity => {
            const category = entity.telosCategory;
            if (!categories[category]) categories[category] = [];
            categories[category].push(entity);
        });
        
        // Generate tree for each category
        Object.keys(categories).sort().forEach(category => {
            output.push(`${this.categoryPrefixes[category] || '[?]'} ${category.toUpperCase()}`);
            output.push('├' + '─'.repeat(this.maxWidth - 2));
            
            const entities = categories[category];
            entities.forEach((entity, entityIndex) => {
                const isLastEntity = entityIndex === entities.length - 1;
                const entityPrefix = isLastEntity ? '└── ' : '├── ';
                
                // Entity name
                const entityName = this.truncateText(entity.name, this.maxWidth - 8);
                output.push(`${entityPrefix}${entityName}`);
                
                // Find all outgoing relationships
                const outgoingRelations = data.relations.filter(r => r.from === entity.name);
                const incomingRelations = data.relations.filter(r => r.to === entity.name);
                
                // Show outgoing relationships
                outgoingRelations.forEach((relation, relIndex) => {
                    const isLastRel = relIndex === outgoingRelations.length - 1 && incomingRelations.length === 0;
                    const relationPrefix = isLastEntity ? '    ' : '│   ';
                    const symbol = this.relationshipSymbols[relation.relationType] || '├─→';
                    const targetName = this.truncateText(relation.to, this.maxWidth - 12);
                    
                    output.push(`${relationPrefix}${symbol} ${targetName}`);
                });
                
                // Show incoming relationships (if any)
                if (incomingRelations.length > 0 && outgoingRelations.length > 0) {
                    const relationPrefix = isLastEntity ? '    ' : '│   ';
                    output.push(`${relationPrefix}┌── INCOMING:`);
                }
                
                incomingRelations.forEach((relation, relIndex) => {
                    const relationPrefix = isLastEntity ? '    ' : '│   ';
                    const symbol = this.relationshipSymbols[relation.relationType] || '├─→';
                    const sourceName = this.truncateText(relation.from, this.maxWidth - 12);
                    
                    output.push(`${relationPrefix}← ${symbol} ${sourceName}`);
                });
                
                if (entityIndex < entities.length - 1) {
                    output.push('│');
                }
            });
            
            output.push('');
        });
        
        return output.join('\n');
    }
    
    generateNetworkView(data) {
        let output = [];
        
        // Header
        output.push('═'.repeat(this.maxWidth));
        output.push('MCP KNOWLEDGE GRAPH - NETWORK VIEW'.center(this.maxWidth));
        output.push('═'.repeat(this.maxWidth));
        output.push('');
        
        // Create adjacency map
        const adjacency = new Map();
        data.entities.forEach(entity => {
            adjacency.set(entity.name, {
                entity: entity,
                outgoing: [],
                incoming: []
            });
        });
        
        data.relations.forEach(relation => {
            if (adjacency.has(relation.from)) {
                adjacency.get(relation.from).outgoing.push(relation);
            }
            if (adjacency.has(relation.to)) {
                adjacency.get(relation.to).incoming.push(relation);
            }
        });
        
        // Sort by connection count (most connected first)
        const sortedEntities = Array.from(adjacency.values()).sort((a, b) => {
            const aConnections = a.outgoing.length + a.incoming.length;
            const bConnections = b.outgoing.length + b.incoming.length;
            return bConnections - aConnections;
        });
        
        sortedEntities.forEach((node, index) => {
            const entity = node.entity;
            const prefix = this.categoryPrefixes[entity.telosCategory] || '[?]';
            const entityName = this.truncateText(entity.name, this.maxWidth - 10);
            
            output.push(`${prefix} ${entityName}`);
            output.push('  ' + '═'.repeat(this.maxWidth - 4));
            
            // Show outgoing connections
            if (node.outgoing.length > 0) {
                output.push('  PROVIDES:');
                node.outgoing.forEach(relation => {
                    const symbol = this.relationshipSymbols[relation.relationType] || '├─→';
                    const targetName = this.truncateText(relation.to, this.maxWidth - 15);
                    output.push(`    ${symbol} ${targetName}`);
                });
                output.push('');
            }
            
            // Show incoming connections
            if (node.incoming.length > 0) {
                output.push('  RECEIVES:');
                node.incoming.forEach(relation => {
                    const symbol = this.relationshipSymbols[relation.relationType] || '←─┤';
                    const sourceName = this.truncateText(relation.from, this.maxWidth - 15);
                    output.push(`    ${symbol} ${sourceName}`);
                });
                output.push('');
            }
            
            if (index < sortedEntities.length - 1) {
                output.push('');
            }
        });
        
        return output.join('\n');
    }
    
    generateMatrixView(data) {
        let output = [];
        
        // Header
        output.push('═'.repeat(this.maxWidth));
        output.push('MCP KNOWLEDGE GRAPH - RELATIONSHIP MATRIX'.center(this.maxWidth));
        output.push('═'.repeat(this.maxWidth));
        output.push('');
        
        // Create relationship matrix
        const entities = data.entities.map(e => e.name);
        const maxNameLength = Math.min(20, Math.max(...entities.map(name => name.length)));
        
        // Header row
        let headerRow = ' '.repeat(maxNameLength + 2);
        entities.forEach(entity => {
            const shortName = entity.substring(0, 3).toUpperCase();
            headerRow += shortName.padEnd(4);
        });
        output.push(headerRow);
        
        // Separator
        output.push('─'.repeat(maxNameLength + 2) + '┼' + '─'.repeat(entities.length * 4));
        
        // Matrix rows
        entities.forEach(fromEntity => {
            let row = this.truncateText(fromEntity, maxNameLength).padEnd(maxNameLength) + ' │';
            
            entities.forEach(toEntity => {
                const relation = data.relations.find(r => r.from === fromEntity && r.to === toEntity);
                if (relation) {
                    const symbol = this.relationshipSymbols[relation.relationType]?.[2] || '●';
                    row += ` ${symbol} `.padEnd(4);
                } else if (fromEntity === toEntity) {
                    row += ' ■ '.padEnd(4);
                } else {
                    row += '   '.padEnd(4);
                }
            });
            
            output.push(row);
        });
        
        // Legend
        output.push('');
        output.push('LEGEND:');
        output.push('  ■ = Self (diagonal)');
        Object.entries(this.relationshipSymbols).forEach(([type, symbol]) => {
            output.push(`  ${symbol[2]} = ${type}`);
        });
        
        return output.join('\n');
    }
    
    generateCompactList(data) {
        let output = [];
        
        // Header
        output.push('═'.repeat(this.maxWidth));
        output.push('MCP KNOWLEDGE GRAPH - COMPACT LIST'.center(this.maxWidth));
        output.push('═'.repeat(this.maxWidth));
        output.push('');
        
        // Group by relationship type
        const relationshipGroups = {};
        data.relations.forEach(relation => {
            if (!relationshipGroups[relation.relationType]) {
                relationshipGroups[relation.relationType] = [];
            }
            relationshipGroups[relation.relationType].push(relation);
        });
        
        Object.keys(relationshipGroups).sort().forEach(relationType => {
            const symbol = this.relationshipSymbols[relationType] || '├─→';
            output.push(`${symbol} ${relationType.toUpperCase()} (${relationshipGroups[relationType].length})`);
            output.push('  ' + '─'.repeat(this.maxWidth - 4));
            
            relationshipGroups[relationType].forEach(relation => {
                const fromEntity = data.entities.find(e => e.name === relation.from);
                const toEntity = data.entities.find(e => e.name === relation.to);
                
                const fromPrefix = this.categoryPrefixes[fromEntity?.telosCategory] || '[?]';
                const toPrefix = this.categoryPrefixes[toEntity?.telosCategory] || '[?]';
                
                const fromName = this.truncateText(relation.from, 35);
                const toName = this.truncateText(relation.to, 35);
                
                output.push(`  ${fromPrefix} ${fromName} → ${toPrefix} ${toName}`);
            });
            
            output.push('');
        });
        
        return output.join('\n');
    }
    
    generateLegend() {
        let output = [];
        
        output.push('═'.repeat(this.maxWidth));
        output.push('LEGEND & SYMBOLS'.center(this.maxWidth));
        output.push('═'.repeat(this.maxWidth));
        output.push('');
        
        output.push('TELOS CATEGORIES:');
        Object.entries(this.categoryPrefixes).forEach(([category, prefix]) => {
            output.push(`  ${prefix} ${category}`);
        });
        output.push('');
        
        output.push('RELATIONSHIP SYMBOLS:');
        Object.entries(this.relationshipSymbols).forEach(([type, symbol]) => {
            output.push(`  ${symbol} ${type}`);
        });
        output.push('');
        
        output.push('RELATIONSHIP DESCRIPTIONS:');
        const descriptions = {
            'supports': 'Provides positive reinforcement or assistance',
            'enables': 'Provides capability or makes something possible',
            'constrains': 'Limits or restricts in some way',
            'mentors': 'Provides guidance or teaching',
            'informs': 'Provides information or knowledge',
            'reflects_on': 'Considers or evaluates',
            'threatens': 'Poses a risk or danger to'
        };
        
        Object.entries(descriptions).forEach(([type, description]) => {
            const lines = this.wrapText(`${type}: ${description}`, this.maxWidth - 4, 4);
            lines.forEach(line => output.push(line));
        });
        
        return output.join('\n');
    }
    
    calculateStatistics(data) {
        const relationCounts = data.relations.length;
        const entityCounts = data.entities.length;
        const telosCategories = new Set(data.entities.map(e => e.telosCategory)).size;
        const relationshipTypes = new Set(data.relations.map(r => r.relationType)).size;
        const avgConnections = entityCounts > 0 ? (relationCounts * 2 / entityCounts).toFixed(1) : 0;
        
        return {
            totalEntities: entityCounts,
            totalRelations: relationCounts,
            telosCategories: telosCategories,
            relationshipTypes: relationshipTypes,
            avgConnections: avgConnections
        };
    }
    
    async generateAll() {
        try {
            console.log('Loading knowledge graph data...');
            const data = await this.loadKnowledgeGraph();
            
            const views = {
                'tree': this.generateTreeView(data),
                'network': this.generateNetworkView(data),
                'matrix': this.generateMatrixView(data),
                'compact': this.generateCompactList(data),
                'legend': this.generateLegend()
            };
            
            // Write individual files
            Object.entries(views).forEach(([name, content]) => {
                const filename = path.join(__dirname, `knowledge-graph-${name}.txt`);
                fs.writeFileSync(filename, content);
                console.log(`Generated: ${filename}`);
            });
            
            // Create combined file
            const combinedContent = Object.entries(views)
                .map(([name, content]) => content)
                .join('\n\n' + '═'.repeat(this.maxWidth) + '\n\n');
                
            const combinedFile = path.join(__dirname, 'knowledge-graph-all-views.txt');
            fs.writeFileSync(combinedFile, combinedContent);
            console.log(`Generated: ${combinedFile}`);
            
            console.log('\nASCII visualization complete!');
            
        } catch (error) {
            console.error('Error generating ASCII visualizations:', error);
        }
    }
}

// Extend String prototype for centering text
String.prototype.center = function(width) {
    const padding = Math.max(0, width - this.length);
    const leftPadding = Math.floor(padding / 2);
    const rightPadding = padding - leftPadding;
    return ' '.repeat(leftPadding) + this + ' '.repeat(rightPadding);
};

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
    const visualizer = new AsciiGraphVisualizer();
    visualizer.generateAll().catch(console.error);
}

export default AsciiGraphVisualizer;