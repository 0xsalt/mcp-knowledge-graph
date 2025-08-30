# MCP Knowledge Graph - Visualization Tools

Three complementary visualization tools for the MCP Knowledge Graph, each optimized for different use cases.

## Quick Start

```bash
# Interactive web viewer
cd d3-viewer && open index.html

# Static professional diagrams  
cd graphviz && ./generate.sh

# Terminal-friendly text visualizations
cd ascii-graph && ./generate.sh
```

## Tools Overview

### 🌐 D3.js Interactive Web Viewer (`d3-viewer/`)
**Best for:** Exploration, presentations, interactive analysis

- Interactive force-directed graph with zoom/pan
- Multiple layouts (force, circular, hierarchical) 
- TELOS category colors and relationship styling
- Hover tooltips and click highlighting
- Real-time layout adjustments

**Open `d3-viewer/index.html` in your browser**

### 📊 Graphviz DOT Generator (`graphviz/`)
**Best for:** Documentation, reports, high-quality diagrams

- Professional static diagrams (PNG/SVG)
- 5 different layout algorithms (hierarchical, circular, force-directed, radial, organic)
- TELOS category clustering with colored backgrounds
- Publication-ready output with legends
- Batch generation of all formats

**Run `graphviz/generate.sh` to create DOT files and images**

### 📄 ASCII Text Visualizer (`ascii-graph/`)
**Best for:** Terminal environments, email, documentation

- 5 different text views (tree, network, matrix, compact, legend)
- Terminal-friendly Unicode box-drawing characters
- Perfect for CLI workflows and text-based documentation
- Works everywhere - no dependencies beyond Node.js

**Run `ascii-graph/generate.sh` to create text files**

## Feature Comparison

| Feature | D3.js Web | Graphviz | ASCII Text |
|---------|-----------|----------|------------|
| Interactivity | ✅ Full | ❌ Static | ❌ Static |
| Professional Output | ✅ High | ✅ Highest | ⚠️ Basic |
| Terminal Friendly | ❌ No | ❌ No | ✅ Yes |
| Documentation Ready | ✅ Yes | ✅ Yes | ✅ Yes |
| Dependencies | Browser only | Graphviz optional | Node.js only |
| Export Formats | Screenshot | PNG, SVG, DOT | TXT |

## Usage Examples

### For Development Teams
1. **Daily standup**: Use ASCII tree view in terminal
2. **Sprint planning**: Interactive D3.js web viewer
3. **Documentation**: Graphviz hierarchical diagram

### For Documentation
1. **README files**: ASCII compact view
2. **Architecture docs**: Graphviz professional diagrams  
3. **Web documentation**: D3.js interactive embedding

### For Analysis
1. **Quick exploration**: ASCII network view
2. **Pattern discovery**: D3.js interactive with highlighting
3. **Relationship mapping**: Graphviz matrix or circular layout

## Data Integration

All tools use the same sample data structure. To connect to live MCP memory:

```javascript
// Replace sample data with MCP memory API calls
const data = await fetch('/api/mcp/memory/read_graph');
```

Each tool includes integration examples in its README.

## File Structure

```
viz/
├── README.md                 # This overview
├── d3-viewer/               # Interactive web visualization
│   ├── index.html          # Main web interface  
│   ├── graph-visualizer.js # D3.js implementation
│   └── README.md          # Detailed usage guide
├── graphviz/               # Static diagram generation
│   ├── generate-dot.js     # DOT file generator
│   ├── generate.sh        # Batch generation script
│   └── README.md         # Installation & usage
└── ascii-graph/           # Text-based visualization
    ├── ascii-visualizer.js # ASCII generator
    ├── generate.sh        # Generation script
    └── README.md         # Symbols & usage guide
```

## Generated Files

### D3.js Web Viewer
- `index.html` - Interactive visualization (open in browser)
- Real-time rendering from data

### Graphviz Generator  
- `*.dot` files - Graph definitions for all layouts
- `*.png` files - High-resolution images (if Graphviz installed)
- `*.svg` files - Scalable vector graphics (if Graphviz installed)

### ASCII Visualizer
- `knowledge-graph-tree.txt` - Hierarchical tree by categories
- `knowledge-graph-network.txt` - Network view by connections
- `knowledge-graph-matrix.txt` - 2D relationship matrix
- `knowledge-graph-compact.txt` - Grouped by relationship type
- `knowledge-graph-legend.txt` - Symbol explanations
- `knowledge-graph-all-views.txt` - Combined file

## Choose Your Tool

**Need to explore relationships interactively?** → D3.js Web Viewer  
**Creating presentation slides or documentation?** → Graphviz Generator  
**Working in terminal or need text format?** → ASCII Visualizer  
**Want all three perspectives?** → Run all tools for comprehensive analysis

Each tool provides a different lens on the same knowledge graph data, optimized for specific workflows and output requirements.