# Graphviz DOT Generator

Static graph visualization generator that creates professional diagrams from the MCP Knowledge Graph using Graphviz DOT language.

## Features

- **Multiple Layout Algorithms**: Hierarchical, Circular, Force-directed, Radial, and Organic layouts
- **TELOS Category Clustering**: Entities grouped by category with colored backgrounds
- **Relationship Styling**: Different line styles and colors for each relationship type
- **Professional Output**: High-quality PNG and SVG files suitable for documentation
- **Statistics Dashboard**: Graph metrics and analysis
- **Batch Generation**: Creates all layouts automatically

## Quick Start

```bash
# Generate all visualizations
./generate.sh

# Or run directly with Node.js
node generate-dot.js
```

## Generated Files

### DOT Files (always generated)
- `knowledge-graph-hierarchical.dot` - Top-down tree layout
- `knowledge-graph-circular.dot` - Circular arrangement
- `knowledge-graph-force_directed.dot` - Spring-based physics layout
- `knowledge-graph-radial.dot` - Radial from center
- `knowledge-graph-organic.dot` - Multiscale organic layout
- `knowledge-graph-stats.dot` - Statistics and metrics

### Image Files (if Graphviz installed)
- `knowledge-graph-*.png` - High-resolution raster images
- `knowledge-graph-*.svg` - Scalable vector graphics

## Installation Requirements

### Node.js (Required)
```bash
# Ubuntu/Debian
sudo apt-get install nodejs npm

# macOS
brew install node

# Or download from: https://nodejs.org/
```

### Graphviz (Optional, for image generation)
```bash
# Ubuntu/Debian
sudo apt-get install graphviz

# macOS
brew install graphviz

# RHEL/CentOS/Fedora
sudo yum install graphviz

# Arch Linux
sudo pacman -S graphviz
```

## Layout Descriptions

### Hierarchical (`dot`)
- **Best for**: Showing clear hierarchical relationships and data flow
- **Characteristics**: Top-down tree structure, clear parent-child relationships
- **Use case**: Understanding how entities support or enable each other

### Circular (`circo`)
- **Best for**: Overview of all entities and their interconnections
- **Characteristics**: Nodes arranged in a circle with connections across
- **Use case**: Getting a holistic view of the knowledge graph

### Force-Directed (`neato`)
- **Best for**: Natural clustering and relationship strength visualization
- **Characteristics**: Physics-based layout with attractive/repulsive forces
- **Use case**: Identifying natural groups and heavily connected nodes

### Radial (`twopi`)
- **Best for**: Highlighting central entities and their influence
- **Characteristics**: One or more central nodes with others radiating outward
- **Use case**: Understanding key entities that connect to many others

### Organic (`sfdp`)
- **Best for**: Large graphs with natural, non-overlapping layouts
- **Characteristics**: Multiscale algorithm that handles complex graphs well
- **Use case**: Best overall layout for complex knowledge graphs

## TELOS Category Colors

Each entity category is represented with consistent colors:

- **Identity**: Red - Core identity and user information
- **Memory**: Blue - Past experiences and learned knowledge
- **Resources**: Green - Available tools, systems, and capabilities
- **Context**: Orange - Environmental and situational factors
- **Conventions**: Purple - Rules, standards, and methodologies
- **Objectives**: Dark Orange - Goals and desired outcomes
- **Projects**: Teal - Active initiatives and work streams
- **Habits**: Dark Gray - Regular practices and routines
- **Risks**: Dark Red - Potential threats and concerns
- **DecisionJournal**: Indigo - Important decisions and their reasoning
- **Relationships**: Dark Cyan - Connections with people and teams
- **Retros**: Dark Green - Reflections and lessons learned

## Relationship Styles

- **supports**: Green solid line → Shows positive reinforcement
- **enables**: Blue solid line → Shows capability provision
- **constrains**: Red dashed line → Shows limitations or restrictions
- **mentors**: Purple solid line with diamond → Shows guidance relationship
- **informs**: Orange dotted line → Shows information flow
- **reflects_on**: Teal solid line with vee → Shows reflection relationship
- **threatens**: Dark red bold line with tee → Shows risk relationship

## Customization

Edit `generate-dot.js` to customize:

- **Colors**: Modify `categoryColors` and `relationshipStyles` objects
- **Node sizes**: Adjust node attributes in the DOT generation
- **Clustering**: Change how entities are grouped
- **Labels**: Modify text truncation and display
- **Layout parameters**: Add Graphviz engine-specific attributes

## Integration

### With Documentation Systems
```bash
# Generate SVG for web embedding
dot -Tsvg knowledge-graph-hierarchical.dot -o docs/graph.svg

# Generate PNG for presentations  
dot -Tpng -Gdpi=300 knowledge-graph-circular.dot -o presentation.png
```

### With Live Data
Replace the sample data in `loadKnowledgeGraph()` with:

```javascript
// Fetch from MCP memory API
const { spawn } = require('child_process');
const mcp = spawn('mcp-memory', ['read_graph']);
// Process MCP response...
```

## Troubleshooting

### "Command not found" errors
- Install Node.js and ensure it's in your PATH
- For Graphviz, install the full package including command-line tools

### Large graphs render slowly
- Use `sfdp` engine for large graphs (>100 nodes)
- Reduce image DPI: `dot -Tpng -Gdpi=150`
- Generate SVG instead of PNG for better performance

### Overlapping nodes
- Try different layout engines
- Adjust node separation: add `nodesep=1.0` to graph attributes
- Use organic layout (`sfdp`) which handles overlap better

## Output Examples

The generator creates professional-quality diagrams suitable for:
- Technical documentation
- Presentations and reports
- Knowledge management systems
- System architecture documentation
- Team collaboration and planning