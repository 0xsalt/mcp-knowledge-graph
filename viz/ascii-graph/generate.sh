#!/bin/bash

# ASCII Knowledge Graph Generator
# Generates text-based visualizations of the MCP Knowledge Graph

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "=== MCP Knowledge Graph - ASCII Generator ==="
echo

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is required but not installed."
    echo "Install Node.js: https://nodejs.org/"
    exit 1
fi

echo "✓ Node.js found - generating ASCII visualizations"
echo

# Generate the ASCII visualizations
echo "Generating ASCII graph visualizations..."
echo

node ascii-visualizer.js

echo
echo "=== Generated Files ==="
echo

# List all generated files with descriptions
if [ -f "knowledge-graph-tree.txt" ]; then
    echo "📄 knowledge-graph-tree.txt"
    echo "   └── Tree view grouped by TELOS categories"
fi

if [ -f "knowledge-graph-network.txt" ]; then
    echo "📄 knowledge-graph-network.txt" 
    echo "   └── Network view showing connections per node"
fi

if [ -f "knowledge-graph-matrix.txt" ]; then
    echo "📄 knowledge-graph-matrix.txt"
    echo "   └── Relationship matrix with symbols"
fi

if [ -f "knowledge-graph-compact.txt" ]; then
    echo "📄 knowledge-graph-compact.txt"
    echo "   └── Compact list grouped by relationship type"
fi

if [ -f "knowledge-graph-legend.txt" ]; then
    echo "📄 knowledge-graph-legend.txt"
    echo "   └── Symbol legend and relationship descriptions"
fi

if [ -f "knowledge-graph-all-views.txt" ]; then
    echo "📄 knowledge-graph-all-views.txt"
    echo "   └── Combined file with all views"
fi

echo
echo "=== Usage Instructions ==="
echo
echo "View files with any text editor or terminal pager:"
echo "  cat knowledge-graph-tree.txt"
echo "  less knowledge-graph-network.txt"
echo "  nano knowledge-graph-matrix.txt"
echo
echo "Best for:"
echo "  • Terminal environments without GUI"
echo "  • Email/text documentation"
echo "  • Code comments and README files"
echo "  • Quick console output"
echo "  • Logging and debugging"

echo
echo "=== View Descriptions ==="
echo
echo "📊 TREE VIEW (knowledge-graph-tree.txt)"
echo "   • Hierarchical view grouped by TELOS categories"
echo "   • Shows entity relationships as tree branches"
echo "   • Best for understanding category structure"
echo
echo "🌐 NETWORK VIEW (knowledge-graph-network.txt)"
echo "   • Node-centric view sorted by connection count"
echo "   • Shows incoming and outgoing relationships"
echo "   • Best for finding highly connected entities"
echo
echo "⬜ MATRIX VIEW (knowledge-graph-matrix.txt)"
echo "   • 2D grid showing all possible relationships"
echo "   • Compact overview of entire graph structure"
echo "   • Best for spotting patterns and gaps"
echo
echo "📋 COMPACT VIEW (knowledge-graph-compact.txt)"
echo "   • List format grouped by relationship type"
echo "   • Shows relationship frequency and patterns"
echo "   • Best for relationship analysis"
echo
echo "❓ LEGEND (knowledge-graph-legend.txt)"
echo "   • Symbol explanations and descriptions"
echo "   • TELOS category definitions"
echo "   • Reference for interpreting other views"

echo
echo "=== Integration Examples ==="
echo
echo "# Include in documentation:"
echo "cat knowledge-graph-compact.txt >> README.md"
echo
echo "# Email-friendly format:"
echo "mail -s \"Knowledge Graph\" team@company.com < knowledge-graph-all-views.txt"
echo
echo "# Terminal dashboard:"
echo "watch -n 30 'cat knowledge-graph-tree.txt'"
echo
echo "# Log analysis:"
echo "grep \"threatens\" knowledge-graph-*.txt"

echo
echo "Done! 🎉"

# Show a preview of one file if it exists
if [ -f "knowledge-graph-tree.txt" ]; then
    echo
    echo "=== Preview (first 20 lines of tree view) ==="
    head -20 knowledge-graph-tree.txt
    echo "..."
    echo "(see full file: knowledge-graph-tree.txt)"
fi