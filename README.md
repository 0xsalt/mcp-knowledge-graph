# mcp-knowledge-graph
![Status](https://img.shields.io/badge/status-work--in--progress-yellow)
> Local Knowledge Graph Memory Server for MCP

An improved implementation of persistent memory using a local knowledge graph with a customizable `--memory-path`.

Works with any AI model or client that supports the Model Context Protocol (MCP) or function-calling interfaces. Use a stable path so memory survives restarts and npx cache wipes.

> [!NOTE]
> ### Project Status: Work in Progress
>
>This repository is a **public fork** and is currently under **active development**.  
>Features are being added, but **things may be broken** at the moment.
>
>You’re welcome to clone and experiment.
>Setup instructions are currently messy so walk through them carefully until I can clean them  up.
>For the original, stable version, see: [upstream repository](https://github.com/shaneholloman/mcp-knowledge-graph).


> [!NOTE] 
> - Original: [Memory Server, Anthropic](https://github.com/modelcontextprotocol/servers/tree/main/src/memory)
> - Fork: [shaneholloman/mcp-knowledge-graph](https://github.com/shaneholloman/mcp-knowledge-graph)
>   - avoids the ephemeral **npx** install method
> - This repo: maintains persistent, explicit storage via `--memory-path`

## Quick Start

### 0. Prerequisites

Ensure you have the following installed:
- **Node.js** (version 18 or higher)
- **npm** (comes with Node.js)

Verify your installation:
```bash
node --version
npm --version
```

### 1. Clone & Install Persistently

```bash
# Clone the repository
git clone https://github.com/0xsalt/mcp-knowledge-graph.git
cd mcp-knowledge-graph

# Install dependencies
npm install

# Build the project
npm run build

# Verify the build was successful
node dist/index.js --help
```

**Expected output:**
```
MCP Knowledge Graph Server

Usage: node dist/index.js [options]

Options:
  --memory-path <path>    Custom path for memory.jsonl file
  --help, -h              Show this help message

Examples:
  node dist/index.js --memory-path ~/.claude/memory.jsonl
  node dist/index.js --memory-path ./my-memory.jsonl

Default memory location: ./memory.jsonl (relative to current working directory)
```

### 2. Optional: Make Globally Available

```bash
# Make the command available globally
npm link

# Verify global installation
mcp-knowledge-graph --help
```

**Troubleshooting:** If `mcp-knowledge-graph` command is not found after `npm link`, try:
- Restart your terminal
- Check if your npm global bin is in your PATH
- Use the full path: `node /path/to/mcp-knowledge-graph/dist/index.js`

### 3. Choose Your Memory Location

Pick where you want to store your memory file:

- **Local (project folder):** `./memory.jsonl` (default)
- **System-wide:** `/home/username/.claude/memory.jsonl` (replace `username`)  
- **Custom location:** `/your/custom/path/memory.jsonl`

Create the directory if it doesn't exist:
```bash
# For system-wide
mkdir -p ~/.claude

# For custom path
mkdir -p /your/custom/directory
```

**Note:** The memory file will be created automatically when the server first runs. You don't need to create it manually.

### 4. Configure Your Claude Client

#### Option A: Claude Desktop

**If you used `npm link` (cleaner approach):**
```json
{
  "mcpServers": {
    "memory": {
      "command": "mcp-knowledge-graph",
      "args": [
        "--memory-path",
        "/home/username/.claude/memory.jsonl"
      ],
      "autoapprove": [
        "mcp__memory__create_entities",
        "mcp__memory__create_relations",
        "mcp__memory__add_observations", 
        "mcp__memory__delete_entities",
        "mcp__memory__delete_observations",
        "mcp__memory__delete_relations",
        "mcp__memory__read_graph",
        "mcp__memory__search_nodes",
        "mcp__memory__open_nodes"
      ]
    }
  }
}
```


**If you didn't use `npm link` (full path approach):**
```json
{
  "mcpServers": {
    "memory": {
      "command": "node",
      "args": [
        "/full/path/to/mcp-knowledge-graph/dist/index.js",
        "--memory-path",
        "/home/username/.claude/memory.jsonl"
      ],
      "autoapprove": [
        "mcp__memory__create_entities",
        "mcp__memory__create_relations", 
        "mcp__memory__add_observations",
        "mcp__memory__delete_entities",
        "mcp__memory__delete_observations",
        "mcp__memory__delete_relations",
        "mcp__memory__read_graph",
        "mcp__memory__search_nodes",
        "mcp__memory__open_nodes"
      ]
    }
  }
}
```

**Examples for different memory locations:**
- Local: `"--memory-path", "./memory.jsonl"`
- System-wide: `"--memory-path", "/home/username/.claude/memory.jsonl"`
- Custom: `"--memory-path", "/your/custom/path/memory.jsonl"`

**Important:** Replace `/full/path/to/mcp-knowledge-graph` with the actual path where you cloned the repository.

#### Option B: Claude CLI

Configure the MCP server using the `claude mcp add-json` command:

**If you used `npm link` (global installation):**
```bash
claude mcp add-json memory '{"command": "mcp-knowledge-graph", "args": ["--memory-path", "/home/username/.claude/memory.jsonl"], "autoapprove": ["create_entities", "create_relations", "add_observations", "delete_entities", "delete_observations", "delete_relations", "read_graph", "search_nodes", "open_nodes"]}' -s user
```

**If you didn't use `npm link` (local installation):**
```bash
# Replace /full/path/to/mcp-knowledge-graph with your actual project path
claude mcp add-json memory '{"command": "node", "args": ["/full/path/to/mcp-knowledge-graph/dist/index.js", "--memory-path", "/home/username/.claude/memory.jsonl"], "autoapprove": ["create_entities", "create_relations", "add_observations", "delete_entities", "delete_observations", "delete_relations", "read_graph", "search_nodes", "open_nodes"]}' -s user
```

3. **Verify the configuration:**
```bash
claude mcp list
```

**Expected output:**
```
memory: node dist/index.js --memory-path /home/username/.claude/memory.jsonl - ✓ Connected
```

**Examples for different memory locations:**
- Local: `"--memory-path", "./memory.jsonl"`
- System-wide: `"--memory-path", "/home/username/.claude/memory.jsonl"`
- Custom: `"--memory-path", "/your/custom/path/memory.jsonl"`

**Important Configuration Notes:** 
- Replace `/home/username/.claude/memory.jsonl` with your chosen memory path
- Replace `/full/path/to/mcp-knowledge-graph` with the actual path where you cloned the repository
- The `autoapprove` array ensures all memory operations are automatically approved without prompting
- The `-s user` flag ensures the configuration is available from any directory globally, making the MCP server accessible across all projects

**Why `-s user` scope?** This makes the memory system available from any directory, enabling persistent memory that works across all your projects and conversations.


#### Option C: Other AI Platforms

For other MCP-compatible platforms (Cursor, VS Code with MCP extensions, etc.), refer to their specific MCP configuration documentation. The server configuration remains the same - just adapt the config format to your platform.

### 5. Add Memory Instructions to Your AI

#### For Claude Projects

In Claude Projects, you can set custom instructions by:
1. Navigate to [claude.ai/projects](https://claude.ai/projects) 
2. Click "+ New Project" in the upper right corner
3. Click "Set Custom Instructions" inside your project
4. Copy and paste the following text directly into the custom instructions field:

#### For Claude CLI

For Claude CLI users, you can set up custom instructions in multiple ways:

**Global Instructions (applies to all projects):**
Create or edit `~/.claude/CLAUDE.md` and paste the following text:

**Project-Specific Instructions:**
Create `.claude/CLAUDE.md` in your project directory and paste the following text:

```txt
Follow these steps for each interaction:

1. User Identification:
   - You should assume that you are interacting with default_user

2. Memory Retrieval:
   - Always begin your chat by saying only "Remembering..." and retrieve all relevant information from your knowledge graph
   - Always refer to your knowledge graph as your "memory"

3. Memory Gathering:
   - While conversing with the user, be attentive to any new information that falls into these categories described in mcp-knowledge-graph.mdc Section 3: Context, Conventions, Decisions, Habits, Identity, Memory, Objectives, Projects, Relationships, Resources, Retros, or Risks.

4. Memory Update:
   - If any new information was gathered during the interaction, update your memory as follows:
     a) Create entities for categories described in mcp-knowledge-graph.mdc Section 3
     b) Connect them to the current entities using relation tags defined in mcp-knowledge-graph.mdc Section 3
     c) Categories into the above categories and link where relevant
```

#### For Other AI Platforms

For agentic coding partners or other platforms, refer to: **[mcp-knowledge-graph.mdc](./docs/mcp-knowledge-graph.mdc)**

### 5. Initialize TELOS Knowledge Graph

Set up your knowledge graph with the comprehensive TELOS taxonomy structure:

```bash
# Initialize TELOS taxonomy with sample data (uses memory path from MCP configuration)
npm run setup:taxonomy -- --memory-path /home/username/.claude/memory.jsonl

# Validate the setup (optional)
npm run validate:taxonomy -- --memory-path /home/username/.claude/memory.jsonl
```

**Important:** Replace `/home/username/.claude/memory.jsonl` with the same path you configured in your MCP server setup.

**What this does:**
- Creates 12 sample entities covering all TELOS categories
- Establishes 15 relationships demonstrating all 7 relationship types
- Sets up your `memory.jsonl` file with a working knowledge graph
- Provides examples of Identity, Projects, Habits, Resources, Objectives, etc.

**Expected output:**
```
PASS TELOS taxonomy setup completed successfully!
Memory file created: ./memory.jsonl
Created 12 entities and 15 relationships
Your TELOS knowledge graph is ready to use!
```

### 6. Test Your Configuration

#### Step 1: Verify MCP Server Configuration

Check that your MCP server is properly configured:

```bash
# For Claude CLI
claude mcp list

# Expected output:
# memory: mcp-knowledge-graph --memory-path /path/to/memory.jsonl - ✓ Connected
```

#### Step 2: Test Memory Operations

Start Claude and test the memory system:

```bash
# Start Claude CLI
claude

# Test the memory system (should work without prompts)
"What do you remember about me?"
```

**Expected Response:**
The AI should respond with "Remembering..." and show you the sample TELOS entities you just created, including your default_user identity and the knowledge graph structure.

#### Step 3: Test with Claude Desktop
1. Restart Claude Desktop
2. Start a new conversation  
3. Ask: "What do you remember about me?"

**Expected Response:**
The AI should respond with "Remembering..." and show you the sample TELOS entities you just created.

#### Troubleshooting

**If MCP server shows as disconnected:**
- Check that you built the project: `npm run build`
- Verify the memory path exists and is writable
- Ensure you have Node.js 18+ installed

**If Claude CLI shows "No MCP servers configured":**
- **CRITICAL**: Run the `claude mcp add-json` command from Option B before testing
- Verify with `claude mcp list` that the server shows as "✓ Connected"
- Check that the JSON syntax is correct
- Verify the command and args are valid

**If Claude asks for permission to use tools:**
- The `autoapprove` array in your `claude mcp add-json` command is missing or incorrect
- Re-run the `claude mcp add-json` command with the complete autoapprove configuration
- Check that all tool names are spelled correctly (without `mcp__memory__` prefix)

**If memory operations fail:**
- Check file permissions on your memory path
- Ensure the directory exists and is writable
- Verify the memory file isn't corrupted
- Run `npm run validate:taxonomy` to check knowledge graph integrity
- Test the server directly: `echo '{"jsonrpc": "2.0", "id": 1, "method": "tools/call", "params": {"name": "read_graph", "arguments": {}}}' | mcp-knowledge-graph --memory-path /your/path/memory.jsonl`

**If TELOS taxonomy setup fails:**
- Ensure you've run `npm run build` first
- **Important:** Use the `--memory-path` parameter to match your MCP server configuration
- Check that the memory directory is writable
- Run `npm run validate:taxonomy -- --memory-path /your/path/memory.jsonl` to diagnose issues
- Delete the memory file and rerun setup with the correct path

**If Claude doesn't see your TELOS data:**
- Verify the memory paths match between setup script and MCP server configuration
- Check `claude mcp list` to see the configured memory path
- Ensure both setup and MCP server use the same `--memory-path`

---

## Uninstall & Clean Wipe Instructions

If you want to completely remove the MCP Knowledge Graph server and start fresh, follow these steps:

### 0. Remove MCP Server Configuration

**For Claude CLI:**
```bash
# Remove the MCP server from Claude CLI
claude mcp remove memory -s local

# Verify it's removed
claude mcp list
```

**For Claude Desktop:**
- Remove the `mcpServers` section from your `claude_desktop_config.json`
- Or delete the entire `claude_desktop_config.json` file

### 1. Remove Global Installation (if used)

```bash
# If you used npm link, unlink it
npm unlink mcp-knowledge-graph

# Verify it's removed
which mcp-knowledge-graph
```

### 2. Remove Memory Files

```bash
# Remove your memory file (replace with your actual path)
rm /home/username/.claude/memory.jsonl

# Or remove the entire memory directory
rm -rf /home/username/.claude/

# Or remove custom memory location
rm /your/custom/path/memory.jsonl
```

### 3. Remove Project Files

```bash
# Remove the entire project directory
cd ..
rm -rf mcp-knowledge-graph/

# Or if you want to keep the project but start fresh
cd mcp-knowledge-graph
rm -rf dist/
rm -rf node_modules/
rm package-lock.json
```

### 4. Clean Claude CLI Configuration (Optional)

If you want to completely clean Claude CLI's project configuration:

```bash
# Backup your global Claude CLI config first
cp ~/.claude.json ~/.claude.json.backup

# Remove the project-specific section from ~/.claude.json
# This requires manual editing to remove the project entry
```

### 5. Verify Complete Removal

```bash
# Check that MCP server is gone
claude mcp list

# Check that global command is gone
which mcp-knowledge-graph

# Check that memory file is gone
ls -la /home/username/.claude/memory.jsonl
```

**Expected results:**
- `claude mcp list` should show "No MCP servers configured"
- `which mcp-knowledge-graph` should return nothing
- Memory file should not exist

### 6. Fresh Installation

After complete removal, you can follow the Quick Start instructions from the beginning to reinstall everything fresh.

---

## TELOS Relationship Taxonomy

**New in v1.0.3+**: This version introduces a comprehensive relationship taxonomy based on the TELOS structure, supporting 7 distinct relationship types across 12 categories for rich semantic knowledge modeling.

### 7 Relationship Types

1. **`supports`** - Forward progress toward goals (default for most connections)
2. **`enables`** - Provides capability, resources, or tools  
3. **`constrains`** - Limitations, boundaries, or restrictions
4. **`mentors`** - Human relationships and guidance (people only)
5. **`informs`** - Knowledge, context, or information sharing
6. **`reflects_on`** - Retrospective analysis and learning
7. **`threatens`** - Risk relationships and potential negative impacts

### 12 TELOS Categories

- **Identity**: Values, mission, principles
- **Memory**: Past experiences, lessons learned
- **Resources**: Tools, assets, capabilities
- **Context**: Environment, situation, constraints
- **Conventions**: Standards, processes, methodologies
- **Objectives**: Goals, targets, desired outcomes
- **Projects**: Active initiatives and implementations
- **Habits**: Routines, practices, regular behaviors
- **Risks**: Threats, concerns, potential issues
- **DecisionJournal**: Choices made and their reasoning
- **Relationships**: People, teams, stakeholder connections
- **Retros**: Reflections, reviews, feedback loops

### Enhanced Tools

The new taxonomy adds these relationship query capabilities:

- **`query_relationships_by_type`** - Filter relationships by type
- **`find_relationship_paths`** - Discover connection paths between entities
- **`get_relationship_suggestions`** - Get AI-suggested relationship types

All entities now support automatic TELOS category detection and relationship validation.

For complete documentation, see [`docs/relationship-taxonomy.md`](docs/relationship-taxonomy.md).

---

## Server Name

```txt
mcp-knowledge-graph
```

![screen-of-server-name](https://raw.githubusercontent.com/0xsalt/mcp-knowledge-graph/main/img/server-name.png)

![read-function](https://raw.githubusercontent.com/0xsalt/mcp-knowledge-graph/main/img/read-function.png)

## Core Concepts

### Entities

Entities are the primary nodes in the knowledge graph. Each entity has:

- A unique name (identifier)
- An entity type (e.g., "person", "organization", "event")
- A TELOS category (auto-detected or manually specified)
- A list of observations

Example:

```json
{
  "name": "John_Smith",
  "entityType": "person",
  "telosCategory": "Relationships",
  "observations": ["Speaks fluent Spanish"]
}
```

### Relations

Relations define directed connections between entities. They are always stored in active voice and describe how entities interact or relate to each other.

Example:

```json
{
  "from": "John_Smith",
  "to": "ExampleCorp",
  "relationType": "works_at"
}
```

### Observations

Observations are discrete pieces of information about an entity. They are:

- Stored as strings
- Attached to specific entities
- Can be added or removed independently
- Should be atomic (one fact per observation)

Example:

```json
{
  "entityName": "John_Smith",
  "observations": [
    "Speaks fluent Spanish",
    "Graduated in 2019",
    "Prefers morning meetings"
  ]
}
```

## API

### Tools

- **create_entities**
  - Create multiple new entities in the knowledge graph
  - Input: `entities` (array of objects)
    - Each object contains:
      - `name` (string): Entity identifier
      - `entityType` (string): Type classification
      - `telosCategory` (string, optional): TELOS category (auto-detected if not provided)
      - `observations` (string[]): Associated observations
  - Ignores entities with existing names
  - Automatically detects TELOS categories based on content

- **create_relations**
  - Create multiple new relations between entities
  - Input: `relations` (array of objects)
    - Each object contains:
      - `from` (string): Source entity name
      - `to` (string): Target entity name
      - `relationType` (string): Relationship type (validates against TELOS taxonomy)
  - Skips duplicate relations
  - Validates relationship types against TELOS category matrix
  - Auto-suggests valid relationship types for invalid combinations

- **add_observations**
  - Add new observations to existing entities
  - Input: `observations` (array of objects)
    - Each object contains:
      - `entityName` (string): Target entity
      - `contents` (string[]): New observations to add
  - Returns added observations per entity
  - Fails if entity doesn't exist

- **delete_entities**
  - Remove entities and their relations
  - Input: `entityNames` (string[])
  - Cascading deletion of associated relations
  - Silent operation if entity doesn't exist

- **delete_observations**
  - Remove specific observations from entities
  - Input: `deletions` (array of objects)
    - Each object contains:
      - `entityName` (string): Target entity
      - `observations` (string[]): Observations to remove
  - Silent operation if observation doesn't exist

- **delete_relations**
  - Remove specific relations from the graph
  - Input: `relations` (array of objects)
    - Each object contains:
      - `from` (string): Source entity name
      - `to` (string): Target entity name
      - `relationType` (string): Relationship type
  - Silent operation if relation doesn't exist

- **read_graph**
  - Read the entire knowledge graph
  - No input required
  - Returns complete graph structure with all entities and relations

- **search_nodes**
  - Search for nodes based on query
  - Input: `query` (string)
  - Searches across:
    - Entity names
    - Entity types
    - Observation content
  - Returns matching entities and their relations

- **open_nodes**
  - Retrieve specific nodes by name
  - Input: `names` (string[])
  - Returns:
    - Requested entities
    - Relations between requested entities
  - Silently skips non-existent nodes

- **query_relationships_by_type**
  - Query relationships filtered by type
  - Input: `relationshipType` (string)
  - Returns: All relationships of the specified type
  - Supports all 7 TELOS relationship types

- **find_relationship_paths**
  - Find connection paths between two entities
  - Input: 
    - `fromEntity` (string): Starting entity name
    - `toEntity` (string): Target entity name
    - `maxDepth` (number, optional): Maximum search depth (default: 3)
  - Returns: Array of paths with relationship types
  - Useful for discovering indirect connections

- **get_relationship_suggestions**
  - Get suggested relationship types between entities
  - Input:
    - `fromEntity` (string): Source entity name
    - `toEntity` (string): Target entity name
  - Returns: Suggested relationship types based on TELOS categories
  - Includes category information for both entities

## Usage with MCP-Compatible Platforms

This server can be used with any AI platform that supports the Model Context Protocol (MCP) or function calling capabilities, including Claude, GPT, Llama, and others.

### Setup with Claude Desktop

Add this to your claude_desktop_config.json:

```json
{
  "mcpServers": {
    "memory": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-knowledge-graph",
        "--memory-path",
        "/home/username/.claude/memory.jsonl"
      ],
      "autoapprove": [
        "mcp__memory__create_entities",
        "mcp__memory__create_relations",
        "mcp__memory__add_observations",
        "mcp__memory__delete_entities",
        "mcp__memory__delete_observations",
        "mcp__memory__delete_relations",
        "mcp__memory__read_graph",
        "mcp__memory__search_nodes",
        "mcp__memory__open_nodes"
      ]
    },
  }
}
```

### Setup with Other AI Platforms

Any AI platform that supports function calling or the MCP standard can connect to this server. The specific configuration will depend on the platform, but the server exposes standard tools through the MCP interface.

### Custom Memory Path

You can specify a custom path for the memory file:

```json
{
  "mcpServers": {
    "memory": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-knowledge-graph",
        "--memory-path",
        "/home/username/.claude/memory.jsonl"
      ],
      "autoapprove": [
        "mcp__memory__create_entities",
        "mcp__memory__create_relations",
        "mcp__memory__add_observations",
        "mcp__memory__delete_entities",
        "mcp__memory__delete_observations",
        "mcp__memory__delete_relations",
        "mcp__memory__read_graph",
        "mcp__memory__search_nodes",
        "mcp__memory__open_nodes"
      ]
    },
  }
}
```

If no path is specified, it will default to memory.jsonl in the server's installation directory.

### System Prompt

The prompt for utilizing memory depends on the use case and the AI model you're using. Changing the prompt will help the model determine the frequency and types of memories created.

Here is an example prompt for chat personalization that can be adapted for any AI model. For Claude users, you could use this prompt in the "Custom Instructions" field of a [Claude.ai Project](https://www.anthropic.com/news/projects). For other models, adapt it to their respective instruction formats.

```txt
Follow these steps for each interaction:

1. User Identification:
   - You should assume that you are interacting with default_user

2. Memory Retrieval:
   - Always begin your chat by saying only "Remembering..." and retrieve all relevant information from your knowledge graph
   - Always refer to your knowledge graph as your "memory"
   - If your memory is empty on first use, immediately create a default_user entity and init a single entry that today their TELOS-structured knowledge graph began. No other content at this time. 

3. Memory Gathering:
   - While conversing with the user, be attentive to any new information that falls into these categories described in mcp-knowledge-graph.mdc Section 3: Context, Conventions, Decisions, Habits, Identity, Memory, Objectives, Projects, Relationships, Resources, Retros, or Risks.

4. Memory Update:
   - If any new information was gathered during the interaction, update your memory as follows:
     a) Create entities for categories described in mcp-knowledge-graph.mdc Section 3
     b) Connect them to the current entities using relation tags defined in mcp-knowledge-graph.mdc Section 3
     c) Categories into the above categories and link where relevant
```

## Integration with Other AI Models

This server implements the Model Context Protocol (MCP) standard, making it compatible with any AI model that supports function calling. The knowledge graph structure and API are model-agnostic, allowing for flexible integration with various AI platforms.

To integrate with other models:

1. Configure the model to access the MCP server
2. Ensure the model can make function calls to the exposed tools
3. Adapt the system prompt to the specific model's instruction format
4. Use the same knowledge graph operations regardless of the model

## License

This MCP server is licensed under the MIT License. This means you are free to use, modify, and distribute the software, subject to the terms and conditions of the MIT License. For more details, please see the LICENSE file in the project repository.
