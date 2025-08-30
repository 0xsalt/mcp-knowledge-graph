# D3.js Knowledge Graph Viewer

Interactive web-based visualization of the MCP Knowledge Graph using D3.js force-directed layout.

## Features

- **Interactive Force-Directed Graph**: Drag nodes, zoom, and pan
- **Multiple Layouts**: Force, Circular, and Hierarchical arrangements
- **TELOS Category Colors**: Each entity category has a distinct color
- **Relationship Type Colors**: Different relationship types shown with unique colors
- **Hover Tooltips**: Detailed information on hover
- **Click Highlighting**: Click nodes to highlight their connections
- **Adjustable Force Strength**: Fine-tune the layout physics
- **Toggle Labels**: Show/hide node labels for cleaner view

## Usage

0. Open `index.html` in a web browser
1. Click "Load Graph Data" to visualize the current knowledge graph
2. Use mouse to drag nodes and zoom/pan the view
3. Click nodes to highlight their connections
4. Try different layouts from the dropdown
5. Adjust force strength with the slider
6. Toggle labels on/off as needed

## TELOS Category Colors

- **Identity**: Red (#e74c3c)
- **Memory**: Blue (#3498db) 
- **Resources**: Green (#2ecc71)
- **Context**: Orange (#f39c12)
- **Conventions**: Purple (#9b59b6)
- **Objectives**: Dark Orange (#e67e22)
- **Projects**: Teal (#1abc9c)
- **Habits**: Dark Blue-Gray (#34495e)
- **Risks**: Dark Red (#c0392b)
- **DecisionJournal**: Dark Purple (#8e44ad)
- **Relationships**: Dark Teal (#16a085)
- **Retros**: Dark Green (#27ae60)

## Relationship Type Colors

- **supports**: Green (#2ecc71)
- **enables**: Blue (#3498db)
- **constrains**: Red (#e74c3c)
- **mentors**: Purple (#9b59b6)
- **informs**: Orange (#f39c12)
- **reflects_on**: Teal (#1abc9c)
- **threatens**: Dark Red (#c0392b)

## Extending for Live Data

To connect to live MCP memory data, replace the sample data in `loadData()` with:

```javascript
// Fetch from MCP memory API
const response = await fetch('/mcp/memory/read_graph');
const data = await response.json();
```