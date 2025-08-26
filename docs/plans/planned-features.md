# Planned Features

## Multiple Memory Contexts

We plan to implement a memory context system that allows users to define and switch between multiple memory files. This feature will support both static named contexts and dynamic project-based memory paths, enabling AI models to access different memory stores for different projects while maintaining a clear and safe user experience.

## Entity Versioning and Update Operations

We plan to implement version tracking for entities and relations in the knowledge graph, enabling history tracking and evolution of knowledge over time. This enhancement will be accompanied by new update operations that allow modifying existing entities and relations while preserving version history. Additionally, we'll add flexible configuration options through environment variables and Docker containerization support for easier deployment.

## Configuration Integration & DX Improvements

### Tech Debt: Memory Path Synchronization

**Issue**: Setup and validation scripts (`npm run setup:taxonomy`, `npm run validate:taxonomy`) require manual `--memory-path` parameter to match the MCP server configuration. This creates a poor developer experience where the same path must be specified in multiple places.

**Impact**: 
- Users must manually ensure path consistency between MCP server config and setup scripts
- Risk of data being written to wrong location (discovered during v1.0.3 testing)
- Cognitive overhead for users during initial setup

**Proposed Solutions**:
1. **Auto-detect MCP configuration**: Scripts read `~/.claude.json` to automatically use the configured memory path
2. **Shared configuration file**: Create a project-level config file that both MCP server and scripts reference
3. **Environment variable**: Support `MCP_MEMORY_PATH` environment variable as default
4. **Interactive path selection**: Prompt user to select/confirm memory path during setup

**Priority**: High - affects user onboarding experience

**Status**: Partial fix implemented in v1.0.3+ (manual `--memory-path` parameter support)
