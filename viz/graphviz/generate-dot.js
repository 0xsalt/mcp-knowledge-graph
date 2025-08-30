#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

class GraphvizGenerator {
    constructor() {
        // TELOS category colors (using web-safe color names)
        this.categoryColors = {
            'Identity': 'red',
            'Memory': 'blue',
            'Resources': 'green', 
            'Context': 'orange',
            'Conventions': 'purple',
            'Objectives': 'darkorange',
            'Projects': 'teal',
            'Habits': 'darkslategray',
            'Risks': 'darkred',
            'DecisionJournal': 'indigo',
            'Relationships': 'darkcyan',
            'Retros': 'darkgreen'
        };
        
        this.relationshipStyles = {
            'supports': { color: 'green', style: 'solid', arrowhead: 'normal' },
            'enables': { color: 'blue', style: 'solid', arrowhead: 'normal' },
            'constrains': { color: 'red', style: 'dashed', arrowhead: 'normal' },
            'mentors': { color: 'purple', style: 'solid', arrowhead: 'diamond' },
            'informs': { color: 'orange', style: 'dotted', arrowhead: 'normal' },
            'reflects_on': { color: 'teal', style: 'solid', arrowhead: 'vee' },
            'threatens': { color: 'darkred', style: 'bold', arrowhead: 'tee' }
        };
    }
    
    async loadKnowledgeGraph() {
        // In production, this would call the MCP memory API
        // For now, using sample data
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
    
    sanitizeNodeName(name) {
        return name.replace(/[^a-zA-Z0-9_]/g, '_');
    }
    
    truncateLabel(text, maxLength = 20) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength - 3) + '...';
    }
    
    generateDot(data, layout = 'dot') {
        let dot = `digraph KnowledgeGraph {
    rankdir=TB;
    node [fontname="Arial", fontsize=10, style=filled];
    edge [fontname="Arial", fontsize=8];
    
    // Graph properties
    graph [
        label="MCP Knowledge Graph\\nTELOS Categories & Relationships",
        labelloc=t,
        fontsize=14,
        fontname="Arial Bold",
        splines=true,
        overlap=false
    ];
`;

        // Generate subgraphs for each TELOS category
        const categoriesUsed = [...new Set(data.entities.map(e => e.telosCategory))];
        
        categoriesUsed.forEach((category, index) => {
            const categoryEntities = data.entities.filter(e => e.telosCategory === category);
            
            dot += `
    // ${category} Category
    subgraph cluster_${index} {
        label="${category}";
        style=rounded;
        bgcolor="${this.categoryColors[category] || 'lightgray'}20";
        fontcolor="${this.categoryColors[category] || 'black'}";
        
`;
            
            categoryEntities.forEach(entity => {
                const nodeId = this.sanitizeNodeName(entity.name);
                const label = this.truncateLabel(entity.name);
                const color = this.categoryColors[entity.telosCategory] || 'lightgray';
                
                dot += `        ${nodeId} [
            label="${label}",
            fillcolor="${color}",
            fontcolor=white,
            tooltip="${entity.name}\\nType: ${entity.entityType}\\nCategory: ${entity.telosCategory}"
        ];\n`;
            });
            
            dot += `    }\n`;
        });
        
        // Generate relationships
        dot += `
    // Relationships
`;
        
        data.relations.forEach(relation => {
            const fromId = this.sanitizeNodeName(relation.from);
            const toId = this.sanitizeNodeName(relation.to);
            const style = this.relationshipStyles[relation.relationType] || 
                         { color: 'black', style: 'solid', arrowhead: 'normal' };
            
            dot += `    ${fromId} -> ${toId} [
        label="${relation.relationType}",
        color="${style.color}",
        style="${style.style}",
        arrowhead="${style.arrowhead}",
        tooltip="${relation.from} ${relation.relationType} ${relation.to}"
    ];\n`;
        });
        
        // Add legend as a subgraph
        dot += `
    // Legend
    subgraph cluster_legend {
        label="Legend";
        style=rounded;
        bgcolor=lightyellow;
        rank=sink;
        
        // Category legend
        legend_categories [shape=none, label=<
            <TABLE BORDER="1" CELLBORDER="0" CELLSPACING="0" BGCOLOR="white">
                <TR><TD COLSPAN="2"><B>TELOS Categories</B></TD></TR>
`;
        
        categoriesUsed.forEach(category => {
            const color = this.categoryColors[category] || 'lightgray';
            dot += `                <TR><TD BGCOLOR="${color}">   </TD><TD ALIGN="LEFT">${category}</TD></TR>\n`;
        });
        
        dot += `            </TABLE>
        >];
        
        // Relationship legend  
        legend_relations [shape=none, label=<
            <TABLE BORDER="1" CELLBORDER="0" CELLSPACING="0" BGCOLOR="white">
                <TR><TD COLSPAN="2"><B>Relationships</B></TD></TR>
`;
        
        const relationTypesUsed = [...new Set(data.relations.map(r => r.relationType))];
        relationTypesUsed.forEach(relationType => {
            const style = this.relationshipStyles[relationType] || 
                         { color: 'black', style: 'solid', arrowhead: 'normal' };
            dot += `                <TR><TD><FONT COLOR="${style.color}">━━━</FONT></TD><TD ALIGN="LEFT">${relationType}</TD></TR>\n`;
        });
        
        dot += `            </TABLE>
        >];
    }
    
}`;
        
        return dot;
    }
    
    async generateAllFormats() {
        try {
            console.log('Loading knowledge graph data...');
            const data = await this.loadKnowledgeGraph();
            
            console.log(`Found ${data.entities.length} entities and ${data.relations.length} relations`);
            
            // Generate different layouts
            const layouts = {
                'hierarchical': 'dot',      // Top-down hierarchical
                'circular': 'circo',        // Circular layout
                'force_directed': 'neato',  // Force-directed spring
                'radial': 'twopi',          // Radial layout
                'organic': 'sfdp'           // Organic/multiscale
            };
            
            for (const [name, engine] of Object.entries(layouts)) {
                const dotContent = this.generateDot(data, engine);
                const dotFile = path.join(__dirname, `knowledge-graph-${name}.dot`);
                
                fs.writeFileSync(dotFile, dotContent);
                console.log(`Generated: ${dotFile}`);
                
                // Generate PNG if Graphviz is available
                try {
                    const pngFile = path.join(__dirname, `knowledge-graph-${name}.png`);
                    const svgFile = path.join(__dirname, `knowledge-graph-${name}.svg`);
                    
                    execSync(`${engine} -Tpng "${dotFile}" -o "${pngFile}"`, { stdio: 'pipe' });
                    execSync(`${engine} -Tsvg "${dotFile}" -o "${svgFile}"`, { stdio: 'pipe' });
                    
                    console.log(`Generated: ${pngFile}`);
                    console.log(`Generated: ${svgFile}`);
                } catch (error) {
                    console.log(`Graphviz not available for ${name} layout. DOT file generated only.`);
                    console.log('Install Graphviz with: sudo apt-get install graphviz (Ubuntu) or brew install graphviz (macOS)');
                }
            }
            
            // Generate combined comparison
            this.generateComparison(data);
            
        } catch (error) {
            console.error('Error generating Graphviz files:', error);
        }
    }
    
    generateComparison(data) {
        const comparisonDot = `digraph Comparison {
    compound=true;
    rankdir=TB;
    
    subgraph cluster_stats {
        label="Knowledge Graph Statistics";
        style=filled;
        bgcolor=lightblue;
        
        stats [shape=none, label=<
            <TABLE BORDER="1" CELLBORDER="0" CELLSPACING="0" BGCOLOR="white">
                <TR><TD COLSPAN="2"><B>Graph Metrics</B></TD></TR>
                <TR><TD>Total Entities</TD><TD>${data.entities.length}</TD></TR>
                <TR><TD>Total Relations</TD><TD>${data.relations.length}</TD></TR>
                <TR><TD>TELOS Categories</TD><TD>${[...new Set(data.entities.map(e => e.telosCategory))].length}</TD></TR>
                <TR><TD>Relation Types</TD><TD>${[...new Set(data.relations.map(r => r.relationType))].length}</TD></TR>
                <TR><TD>Avg Connections/Node</TD><TD>${(data.relations.length * 2 / data.entities.length).toFixed(1)}</TD></TR>
            </TABLE>
        >];
    }
}`;
        
        const comparisonFile = path.join(__dirname, 'knowledge-graph-stats.dot');
        fs.writeFileSync(comparisonFile, comparisonDot);
        console.log(`Generated: ${comparisonFile}`);
    }
}

// CLI execution  
if (import.meta.url === `file://${process.argv[1]}`) {
    const generator = new GraphvizGenerator();
    generator.generateAllFormats().catch(console.error);
}

export default GraphvizGenerator;