class KnowledgeGraphVisualizer {
    constructor() {
        this.width = 1160;
        this.height = 800;
        this.showLabels = true;
        this.currentLayout = 'force';
        
        // TELOS category colors
        this.categoryColors = {
            'Identity': '#e74c3c',      // Red
            'Memory': '#3498db',        // Blue  
            'Resources': '#2ecc71',     // Green
            'Context': '#f39c12',       // Orange
            'Conventions': '#9b59b6',   // Purple
            'Objectives': '#e67e22',    // Dark Orange
            'Projects': '#1abc9c',      // Teal
            'Habits': '#34495e',        // Dark Blue-Gray
            'Risks': '#c0392b',         // Dark Red
            'DecisionJournal': '#8e44ad', // Dark Purple
            'Relationships': '#16a085', // Dark Teal
            'Retros': '#27ae60'         // Dark Green
        };
        
        this.relationshipColors = {
            'supports': '#2ecc71',
            'enables': '#3498db',
            'constrains': '#e74c3c',
            'mentors': '#9b59b6',
            'informs': '#f39c12',
            'reflects_on': '#1abc9c',
            'threatens': '#c0392b'
        };
        
        this.initializeGraph();
    }
    
    initializeGraph() {
        const container = d3.select('#graph');
        
        this.svg = container
            .append('svg')
            .attr('width', this.width)
            .attr('height', this.height);
            
        // Define arrow marker
        this.svg.append('defs').append('marker')
            .attr('id', 'arrowhead')
            .attr('viewBox', '0 -5 10 10')
            .attr('refX', 25)
            .attr('refY', 0)
            .attr('markerWidth', 6)
            .attr('markerHeight', 6)
            .attr('orient', 'auto')
            .append('path')
            .attr('d', 'M0,-5L10,0L0,5')
            .attr('fill', '#999');
            
        // Create groups for links and nodes
        this.linkGroup = this.svg.append('g').attr('class', 'links');
        this.nodeGroup = this.svg.append('g').attr('class', 'nodes');
        
        // Add zoom behavior
        const zoom = d3.zoom()
            .scaleExtent([0.1, 4])
            .on('zoom', (event) => {
                this.svg.selectAll('.links, .nodes')
                    .attr('transform', event.transform);
            });
            
        this.svg.call(zoom);
        this.zoomBehavior = zoom;
        
        // Initialize simulation
        this.simulation = d3.forceSimulation()
            .force('link', d3.forceLink().id(d => d.id).distance(150))
            .force('charge', d3.forceManyBody().strength(-300))
            .force('center', d3.forceCenter(this.width / 2, this.height / 2))
            .force('collision', d3.forceCollide().radius(30));
    }
    
    async loadData() {
        try {
            // In a real implementation, this would call the MCP memory API
            // For now, we'll use the sample data from your memory
            const sampleData = {
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
            
            this.processData(sampleData);
            this.createLegend();
            
        } catch (error) {
            console.error('Error loading data:', error);
        }
    }
    
    processData(data) {
        // Process nodes
        this.nodes = data.entities.map(entity => ({
            id: entity.name,
            name: entity.name,
            type: entity.entityType,
            category: entity.telosCategory,
            color: this.categoryColors[entity.telosCategory] || '#95a5a6'
        }));
        
        // Process links
        this.links = data.relations.map(relation => ({
            source: relation.from,
            target: relation.to,
            type: relation.relationType,
            color: this.relationshipColors[relation.relationType] || '#95a5a6'
        }));
        
        this.updateGraph();
    }
    
    updateGraph() {
        // Update simulation
        this.simulation.nodes(this.nodes);
        this.simulation.force('link').links(this.links);
        
        // Update links
        const link = this.linkGroup
            .selectAll('line')
            .data(this.links);
            
        link.enter()
            .append('line')
            .attr('class', 'link')
            .style('stroke', d => d.color)
            .merge(link);
            
        link.exit().remove();
        
        // Update link labels
        const linkLabel = this.linkGroup
            .selectAll('text')
            .data(this.links);
            
        linkLabel.enter()
            .append('text')
            .attr('class', 'link-label')
            .text(d => d.type)
            .merge(linkLabel);
            
        linkLabel.exit().remove();
        
        // Update nodes
        const node = this.nodeGroup
            .selectAll('circle')
            .data(this.nodes);
            
        const nodeEnter = node.enter()
            .append('circle')
            .attr('class', 'node')
            .attr('r', 20)
            .style('fill', d => d.color)
            .call(this.drag())
            .on('mouseover', (event, d) => this.showTooltip(event, d))
            .on('mouseout', () => this.hideTooltip())
            .on('click', (event, d) => this.onNodeClick(event, d));
            
        node.merge(nodeEnter);
        node.exit().remove();
        
        // Update node labels
        const nodeLabel = this.nodeGroup
            .selectAll('text')
            .data(this.nodes);
            
        const nodeLabelEnter = nodeLabel.enter()
            .append('text')
            .attr('class', 'node-label')
            .style('display', this.showLabels ? 'block' : 'none');
            
        nodeLabel.merge(nodeLabelEnter)
            .text(d => this.truncateText(d.name, 12))
            .style('display', this.showLabels ? 'block' : 'none');
            
        nodeLabel.exit().remove();
        
        // Apply layout
        this.applyLayout();
        
        // Start simulation
        this.simulation.on('tick', () => {
            this.linkGroup.selectAll('line')
                .attr('x1', d => d.source.x)
                .attr('y1', d => d.source.y)
                .attr('x2', d => d.target.x)
                .attr('y2', d => d.target.y);
                
            this.linkGroup.selectAll('text')
                .attr('x', d => (d.source.x + d.target.x) / 2)
                .attr('y', d => (d.source.y + d.target.y) / 2);
                
            this.nodeGroup.selectAll('circle')
                .attr('cx', d => d.x)
                .attr('cy', d => d.y);
                
            this.nodeGroup.selectAll('text')
                .attr('x', d => d.x)
                .attr('y', d => d.y);
        });
        
        this.simulation.restart();
    }
    
    applyLayout() {
        switch(this.currentLayout) {
            case 'circular':
                this.applyCircularLayout();
                break;
            case 'hierarchical':
                this.applyHierarchicalLayout();
                break;
            default:
                // Force layout is handled by simulation
                break;
        }
    }
    
    applyCircularLayout() {
        const radius = Math.min(this.width, this.height) / 3;
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        
        this.nodes.forEach((node, i) => {
            const angle = (i / this.nodes.length) * 2 * Math.PI;
            node.fx = centerX + radius * Math.cos(angle);
            node.fy = centerY + radius * Math.sin(angle);
        });
    }
    
    applyHierarchicalLayout() {
        // Group by category
        const categories = [...new Set(this.nodes.map(n => n.category))];
        const categoryHeight = this.height / categories.length;
        
        categories.forEach((category, catIndex) => {
            const categoryNodes = this.nodes.filter(n => n.category === category);
            const nodeWidth = this.width / (categoryNodes.length + 1);
            
            categoryNodes.forEach((node, nodeIndex) => {
                node.fx = nodeWidth * (nodeIndex + 1);
                node.fy = categoryHeight * (catIndex + 0.5);
            });
        });
    }
    
    drag() {
        return d3.drag()
            .on('start', (event, d) => {
                if (!event.active) this.simulation.alphaTarget(0.3).restart();
                d.fx = d.x;
                d.fy = d.y;
            })
            .on('drag', (event, d) => {
                d.fx = event.x;
                d.fy = event.y;
            })
            .on('end', (event, d) => {
                if (!event.active) this.simulation.alphaTarget(0);
                if (this.currentLayout === 'force') {
                    d.fx = null;
                    d.fy = null;
                }
            });
    }
    
    showTooltip(event, d) {
        const tooltip = d3.select('#tooltip');
        tooltip.transition()
            .duration(200)
            .style('opacity', 0.9);
            
        tooltip.html(`
            <strong>${d.name}</strong><br/>
            Type: ${d.type}<br/>
            Category: ${d.category}<br/>
            Connected to ${this.links.filter(l => l.source.id === d.id || l.target.id === d.id).length} nodes
        `)
            .style('left', (event.pageX + 10) + 'px')
            .style('top', (event.pageY - 28) + 'px');
    }
    
    hideTooltip() {
        d3.select('#tooltip').transition()
            .duration(500)
            .style('opacity', 0);
    }
    
    onNodeClick(event, d) {
        // Highlight connected nodes and edges
        const connectedLinks = this.links.filter(l => 
            l.source.id === d.id || l.target.id === d.id
        );
        
        const connectedNodes = new Set([d.id]);
        connectedLinks.forEach(l => {
            connectedNodes.add(l.source.id);
            connectedNodes.add(l.target.id);
        });
        
        // Reset all elements
        this.nodeGroup.selectAll('circle')
            .style('opacity', 1)
            .style('stroke-width', 2);
            
        this.linkGroup.selectAll('line')
            .style('opacity', 0.6)
            .style('stroke-width', 2);
        
        // Highlight selected network
        this.nodeGroup.selectAll('circle')
            .style('opacity', node => connectedNodes.has(node.id) ? 1 : 0.3)
            .style('stroke-width', node => node.id === d.id ? 4 : 2);
            
        this.linkGroup.selectAll('line')
            .style('opacity', link => 
                connectedLinks.includes(link) ? 1 : 0.1
            )
            .style('stroke-width', link => 
                connectedLinks.includes(link) ? 3 : 2
            );
    }
    
    createLegend() {
        const legend = d3.select('#legend');
        legend.selectAll('*').remove();
        
        // Category legend
        legend.append('h3').text('TELOS Categories');
        const categoryLegend = legend.append('div');
        
        Object.entries(this.categoryColors).forEach(([category, color]) => {
            const item = categoryLegend.append('div')
                .attr('class', 'legend-item');
                
            item.append('span')
                .attr('class', 'legend-color')
                .style('background-color', color);
                
            item.append('span').text(category);
        });
        
        // Relationship legend
        legend.append('h3').text('Relationship Types');
        const relationLegend = legend.append('div');
        
        Object.entries(this.relationshipColors).forEach(([relation, color]) => {
            const item = relationLegend.append('div')
                .attr('class', 'legend-item');
                
            item.append('span')
                .attr('class', 'legend-color')
                .style('background-color', color);
                
            item.append('span').text(relation);
        });
    }
    
    truncateText(text, maxLength) {
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    }
    
    resetZoom() {
        this.svg.transition().duration(750).call(
            this.zoomBehavior.transform,
            d3.zoomIdentity
        );
    }
    
    toggleLabels() {
        this.showLabels = !this.showLabels;
        this.nodeGroup.selectAll('text')
            .style('display', this.showLabels ? 'block' : 'none');
    }
    
    changeLayout() {
        this.currentLayout = document.getElementById('layoutSelect').value;
        this.applyLayout();
        this.simulation.restart();
    }
    
    updateForceStrength() {
        const strength = parseInt(document.getElementById('strengthSlider').value) * -3;
        this.simulation.force('charge').strength(strength);
        this.simulation.restart();
    }
}

// Global functions for HTML controls
let visualizer;

function loadData() {
    if (!visualizer) {
        visualizer = new KnowledgeGraphVisualizer();
    }
    visualizer.loadData();
}

function resetZoom() {
    if (visualizer) visualizer.resetZoom();
}

function toggleLabels() {
    if (visualizer) visualizer.toggleLabels();
}

function changeLayout() {
    if (visualizer) visualizer.changeLayout();
}

function updateForceStrength() {
    if (visualizer) visualizer.updateForceStrength();
}

// Auto-load on page ready
document.addEventListener('DOMContentLoaded', function() {
    loadData();
});