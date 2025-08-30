# ASCII Knowledge Graph Visualizer

Terminal-friendly text-based visualization of the MCP Knowledge Graph using Unicode box-drawing characters and symbols.

## Features

- **Multiple ASCII Views**: Tree, Network, Matrix, Compact, and Legend formats
- **Unicode Symbols**: Rich box-drawing characters and relationship symbols
- **TELOS Category Prefixes**: Quick visual identification of entity types
- **Terminal Optimized**: Designed for 120-column terminal windows
- **No Dependencies**: Pure Node.js, works anywhere
- **Text-Based**: Perfect for documentation, email, and terminal environments

## Quick Start

```bash
# Generate all ASCII visualizations
./generate.sh

# Or run directly with Node.js
node ascii-visualizer.js
```

## Generated Files

- `knowledge-graph-tree.txt` - Hierarchical tree view by TELOS categories
- `knowledge-graph-network.txt` - Network view showing connections per node
- `knowledge-graph-matrix.txt` - 2D relationship matrix with symbols
- `knowledge-graph-compact.txt` - Compact list grouped by relationship type
- `knowledge-graph-legend.txt` - Symbol legend and descriptions
- `knowledge-graph-all-views.txt` - Combined file with all views

## View Types

### 1. Tree View (`knowledge-graph-tree.txt`)
Hierarchical display grouped by TELOS categories:
```
[P] PROJECTS
├──────────────────────────────────────────────────────────────────────────────
├── knowledge_graph_implementation
│   ├─→ productivity_optimization_goal
│   ╞═→ claude_mcp_integration
│   └── INCOMING:
│       ← ├─→ daily_reflection_habit
│       ← ├─→ tdd_development_convention
```

### 2. Network View (`knowledge-graph-network.txt`)
Node-centric view sorted by connection count:
```
[P] knowledge_graph_implementation
  ══════════════════════════════════════════════════════════════════════════════
  PROVIDES:
    ├─→ productivity_optimization_goal
  
  RECEIVES:
    ├─→ daily_reflection_habit
    ╞═→ claude_mcp_integration
    ├─→ tdd_development_convention
```

### 3. Matrix View (`knowledge-graph-matrix.txt`)
2D grid showing all possible relationships:
```
                      DEF KNO DAI CLA PRO REM TDD
default_user         │ ■                        
knowledge_graph...   │   ■   ●   ●   ●   ×   ×
daily_reflection...  │   ●   ■               ×  
```

### 4. Compact View (`knowledge-graph-compact.txt`)
List format grouped by relationship type:
```
├─→ SUPPORTS (3)
  ──────────────────────────────────────────────────────────────────────────────
  [H] daily_reflection_habit → [P] knowledge_graph_implementation
  [P] knowledge_graph_implementation → [O] productivity_optimization_goal
  [V] tdd_development_convention → [P] knowledge_graph_implementation
```

### 5. Legend (`knowledge-graph-legend.txt`)
Symbol explanations and TELOS category definitions.

## TELOS Category Prefixes

- **[I] Identity** - Core identity and user information
- **[M] Memory** - Past experiences and learned knowledge
- **[R] Resources** - Available tools, systems, and capabilities
- **[C] Context** - Environmental and situational factors
- **[V] Conventions** - Rules, standards, and methodologies
- **[O] Objectives** - Goals and desired outcomes
- **[P] Projects** - Active initiatives and work streams
- **[H] Habits** - Regular practices and routines
- **[!] Risks** - Potential threats and concerns
- **[D] DecisionJournal** - Important decisions and their reasoning
- **[~] Relationships** - Connections with people and teams
- **[↺] Retros** - Reflections and lessons learned

## Relationship Symbols

- **├─→** supports - Provides positive reinforcement
- **╞═→** enables - Provides capability or makes possible
- **├─┤** constrains - Limits or restricts
- **├◆→** mentors - Provides guidance or teaching
- **├··→** informs - Provides information or knowledge
- **├~→** reflects_on - Considers or evaluates
- **├××→** threatens - Poses a risk or danger

## Use Cases

### Documentation
```bash
# Include in README files
cat knowledge-graph-tree.txt >> README.md

# Add to project documentation
echo "## Knowledge Graph" >> docs/architecture.md
cat knowledge-graph-compact.txt >> docs/architecture.md
```

### Communication
```bash
# Email-friendly format
mail -s "Knowledge Graph Analysis" team@company.com < knowledge-graph-all-views.txt

# Slack/chat formatting
cat knowledge-graph-compact.txt | sed 's/^/    /' # Add code block indentation
```

### Terminal Integration
```bash
# Dashboard monitoring
watch -n 30 'head -50 knowledge-graph-network.txt'

# Quick lookup
alias kg-tree='cat /path/to/knowledge-graph-tree.txt'
alias kg-matrix='cat /path/to/knowledge-graph-matrix.txt'
```

### Analysis and Search
```bash
# Find threat relationships
grep "threatens" knowledge-graph-*.txt

# Count relationships by type
grep "├─→" knowledge-graph-compact.txt | wc -l

# Find highly connected nodes
grep -A 10 "PROVIDES:" knowledge-graph-network.txt
```

## Customization

### Modify Symbols
Edit the `relationshipSymbols` object in `ascii-visualizer.js`:
```javascript
this.relationshipSymbols = {
    'supports': '└─→',    // Change to different Unicode chars
    'enables': '╰═→',     // Customize per relationship type
    // ...
};
```

### Adjust Width
Change the `maxWidth` property:
```javascript
this.maxWidth = 100;  // Adjust for different terminal sizes
```

### Add New Views
Extend the class with new visualization methods:
```javascript
generateMyCustomView(data) {
    // Custom visualization logic
    return asciiOutput;
}
```

## Terminal Compatibility

The ASCII visualizer uses Unicode box-drawing characters that work in:
- ✅ Modern terminals (Terminal.app, iTerm2, Windows Terminal)
- ✅ Linux consoles with UTF-8 support
- ✅ SSH sessions with proper locale settings
- ✅ Text editors and IDEs
- ⚠️ Basic terminals may show fallback characters

For maximum compatibility, set your terminal to UTF-8:
```bash
export LANG=en_US.UTF-8
export LC_ALL=en_US.UTF-8
```

## Integration with Live Data

Replace the sample data in `loadKnowledgeGraph()` with MCP memory API calls:

```javascript
async loadKnowledgeGraph() {
    // Example integration
    const { spawn } = require('child_process');
    const process = spawn('claude', ['mcp', 'memory', 'read_graph']);
    
    return new Promise((resolve, reject) => {
        let data = '';
        process.stdout.on('data', chunk => data += chunk);
        process.on('close', () => resolve(JSON.parse(data)));
    });
}
```

## Performance

- **Fast Generation**: Processes hundreds of nodes in milliseconds
- **Lightweight Output**: Text files are typically 1-10KB
- **Memory Efficient**: Minimal memory usage during generation
- **Scalable**: Handles large graphs by truncating labels and using compact layouts

The ASCII visualizer is perfect for quick analysis, documentation, and situations where graphical tools aren't available.