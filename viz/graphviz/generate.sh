#!/bin/bash

# Graphviz Knowledge Graph Generator
# Generates DOT files and renders them to PNG/SVG if Graphviz is installed

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "=== MCP Knowledge Graph - Graphviz Generator ==="
echo

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is required but not installed."
    echo "Install Node.js: https://nodejs.org/"
    exit 1
fi

# Check if Graphviz is available
if command -v dot &> /dev/null; then
    echo "✓ Graphviz found - will generate PNG and SVG files"
    GRAPHVIZ_AVAILABLE=true
else
    echo "⚠ Graphviz not found - will generate DOT files only"
    echo "  Install with:"
    echo "    Ubuntu/Debian: sudo apt-get install graphviz"
    echo "    macOS: brew install graphviz"
    echo "    RHEL/CentOS: sudo yum install graphviz"
    echo
    GRAPHVIZ_AVAILABLE=false
fi

# Generate the DOT files
echo "Generating knowledge graph visualizations..."
echo

node generate-dot.js

echo
echo "=== Generated Files ==="

# List all generated files
for file in knowledge-graph-*.dot; do
    if [ -f "$file" ]; then
        echo "📄 $file"
        
        # Show corresponding image files if they exist
        basename="${file%.dot}"
        if [ -f "${basename}.png" ]; then
            echo "🖼️  ${basename}.png"
        fi
        if [ -f "${basename}.svg" ]; then
            echo "🖼️  ${basename}.svg" 
        fi
    fi
done

echo
echo "=== Usage Instructions ==="
echo
echo "DOT files can be:"
echo "1. Opened in any text editor to view the graph definition"
echo "2. Rendered manually with Graphviz:"
echo "   dot -Tpng knowledge-graph-hierarchical.dot -o output.png"
echo "   dot -Tsvg knowledge-graph-hierarchical.dot -o output.svg"
echo
echo "3. Viewed online at: http://magjac.com/graphviz-visual-editor/"
echo "   (paste DOT content)"
echo
echo "4. Imported into draw.io, yEd, or other graph tools"

if [ "$GRAPHVIZ_AVAILABLE" = true ]; then
    echo
    echo "PNG/SVG files can be:"
    echo "1. Opened directly in image viewers/browsers"
    echo "2. Embedded in documentation"
    echo "3. Used in presentations"
fi

echo
echo "=== Layout Descriptions ==="
echo
echo "• hierarchical: Top-down tree layout (best for showing flow)"
echo "• circular: Nodes arranged in a circle (good for overview)"
echo "• force_directed: Physics-based spring layout (natural clustering)"
echo "• radial: Central node with others radiating outward"
echo "• organic: Multiscale organic layout (good for large graphs)"

echo
echo "Done! 🎉"