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
>You’re welcome to clone and experiment, but please note that setup may fail or behave unexpectedly until stabilization.  
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

**Alternative: Use allowedTools in settings.local.json (for Claude CLI)**
If using Claude CLI, you can skip tool approval prompts by adding this to `~/.claude/settings.local.json`:
```json
{
  "allowedTools": [
    "mcp__memory__read_graph:*",
    "mcp__memory__search_nodes:*",
    "mcp__memory__open_nodes:*",
    "mcp__memory__create_entities:*",
    "mcp__memory__create_relations:*",
    "mcp__memory__add_observations:*",
    "mcp__memory__delete_entities:*",
    "mcp__memory__delete_observations:*",
    "mcp__memory__delete_relations:*"
  ]
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

**Claude CLI uses a different configuration system than Claude Desktop.** Currently, you need to configure manually using project-local `.mcp.json` files and `settings.local.json`. The `claude mcp add-json` command will be added in the next Claude CLI release.

**Current Method (Manual Configuration):**

1. **Create or edit `.mcp.json` in your project directory:**
```json
{
  "mcpServers": {
    "memory": {
      "command": "node",
      "args": ["dist/index.js", "--memory-path", "/home/username/.claude/memory.jsonl"],
      "env": {}
    }
  }
}
```

2. **Create or edit `~/.claude/settings.local.json` to skip approval prompts:**
```json
{
  "allowedTools": [
    "mcp__memory__read_graph:*",
    "mcp__memory__search_nodes:*",
    "mcp__memory__open_nodes:*",
    "mcp__memory__create_entities:*",
    "mcp__memory__create_relations:*",
    "mcp__memory__add_observations:*",
    "mcp__memory__delete_entities:*",
    "mcp__memory__delete_observations:*",
    "mcp__memory__delete_relations:*"
  ]
}
```

**Future Method (Next Release):**
```bash
# If you used npm link (use -s user for global access from any directory)
claude mcp add-json memory '{"command": "mcp-knowledge-graph", "args": ["--memory-path", "/home/username/.claude/memory.jsonl"], "autoapprove": ["mcp__memory__create_entities", "mcp__memory__create_relations", "mcp__memory__add_observations", "mcp__memory__delete_entities", "mcp__memory__delete_observations", "mcp__memory__delete_relations", "mcp__memory__read_graph", "mcp__memory__search_nodes", "mcp__memory__open_nodes"]}' -s user

# If you didn't use npm link (replace with your actual path)
claude mcp add-json memory '{"command": "node", "args": ["/full/path/to/mcp-knowledge-graph/dist/index.js", "--memory-path", "/home/username/.claude/memory.jsonl"], "autoapprove": ["mcp__memory__create_entities", "mcp__memory__create_relations", "mcp__memory__add_observations", "mcp__memory__delete_entities", "mcp__memory__delete_observations", "mcp__memory__delete_relations", "mcp__memory__read_graph", "mcp__memory__search_nodes", "mcp__memory__open_nodes"]}' -s user
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
- The `allowedTools` array in `settings.local.json` ensures all memory operations are automatically approved without prompting
- Tools are prefixed with `mcp__memory__` (e.g., `mcp__memory__create_entities`) - this is the actual tool namespace
- The `-s user` flag (in future releases) ensures the configuration is available from any directory globally, making the MCP server accessible across all projects. This stores configuration in the global `~/.claude.json` file in your home directory.

**Why `-s user` scope?** This makes the memory system available from any directory, which enables persistent memory that should work across all your projects and conversations.


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

### 5. Test Your Configuration

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

**Expected Response On First Use:**
The AI should respond with "Remembering..." and begin building your TELOS-structured memory graph.

#### Step 3: Test with Claude Desktop
1. Restart Claude Desktop
2. Start a new conversation  
3. Ask: "What do you remember about me?"

**Expected Response On First Use:**
The AI should respond with "Remembering..." and begin building your TELOS-structured memory graph.

#### Troubleshooting

**If MCP server shows as disconnected:**
- Check that you built the project: `npm run build`
- Verify the memory path exists and is writable
- Ensure you have Node.js 18+ installed

**If Claude CLI shows "No MCP servers configured":**
- **CRITICAL**: Run the `claude mcp add-json` command from step 1 before testing
- Verify with `claude mcp list` that the server shows as "✓ Connected"
- Check that the JSON syntax is correct
- Verify the command and args are valid

**If Claude asks for permission to use tools:**
- The `autoapprove` array is missing or incorrect
- Re-add the MCP server with the complete autoapprove configuration
- Check that all tool names are spelled correctly

**If memory operations fail:**
- Check file permissions on your memory path
- Ensure the directory exists and is writable
- Verify the memory file isn't corrupted
- Test the server directly: `echo '{"jsonrpc": "2.0", "id": 1, "method": "tools/call", "params": {"name": "read_graph", "arguments": {}}}' | mcp-knowledge-graph --memory-path /your/path/memory.jsonl`

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
- A list of observations

Example:

```json
{
  "name": "John_Smith",
  "entityType": "person",
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
      - `observations` (string[]): Associated observations
  - Ignores entities with existing names

- **create_relations**
  - Create multiple new relations between entities
  - Input: `relations` (array of objects)
    - Each object contains:
      - `from` (string): Source entity name
      - `to` (string): Target entity name
      - `relationType` (string): Relationship type in active voice
  - Skips duplicate relations

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
