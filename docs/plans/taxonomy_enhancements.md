# TELOS Relationship Taxonomy Enhancement Plan

## Overview
Implement a comprehensive relationship taxonomy system for the MCP Knowledge Graph that supports all 12 TELOS categories with 7 distinct relationship types. This plan enables rich semantic connections while maintaining usability.

## Context
- User selected **Proposal 3: Hybrid Specificity** approach
- Must integrate into existing MCP server architecture
- Must be enforced during installation/setup
- Current system uses basic `supports` and `mentors` relationships

## Relationship Taxonomy Definition

### Core Relationships (7 types)
1. **`supports`** - forward progress toward goals (default for most connections)
2. **`enables`** - provides capability/resources/tools
3. **`constrains`** - limitations/boundaries/restrictions
4. **`mentors`** - human relationships (people only)
5. **`informs`** - knowledge/context sharing
6. **`reflects_on`** - retrospective analysis/learning
7. **`threatens`** - risk relationships

### TELOS Categories (12 total)
Identity, Memory, Resources, Context, Conventions, Objectives, Projects, Habits, Risks, DecisionJournal, Relationships, Retros

## Implementation Steps

### Phase 1: Documentation & Schema Design

#### Task 1.1: Create Core Documentation
**File**: `docs/relationship-taxonomy.md`
**Requirements**:
- Document all 7 relationship types with definitions and examples
- Create 12x12 matrix showing valid TELOS category connections (From→To)
- Include usage guidelines and best practices
- Provide examples for each relationship type

**Content Structure**:
```markdown
# TELOS Relationship Taxonomy

## Relationship Types
[7 relationships with definitions, examples, usage rules]

## TELOS Category Matrix  
[12x12 table showing valid From→To category connections]

## Usage Guidelines
- Default relationship selection rules
- When to use each relationship type
- Common patterns and anti-patterns

## Examples
[Real-world examples for each relationship type]
```

#### Task 1.2: Create TypeScript Schema
**File**: `src/types/relationship-schema.ts`
**Requirements**:
- Define TypeScript enums for relationship types
- Define TELOS category enum
- Create validation interfaces
- Export relationship validation functions

**Key Exports**:
```typescript
export enum RelationshipType {
  SUPPORTS = 'supports',
  ENABLES = 'enables',
  CONSTRAINS = 'constrains',
  MENTORS = 'mentors',
  INFORMS = 'informs',
  REFLECTS_ON = 'reflects_on',
  THREATENS = 'threatens'
}

export enum TelosCategory {
  IDENTITY = 'Identity',
  MEMORY = 'Memory',
  // ... all 12 categories
}

export interface RelationshipRule {
  from: TelosCategory;
  to: TelosCategory;
  allowedTypes: RelationshipType[];
}

export function validateRelationship(from: TelosCategory, to: TelosCategory, type: RelationshipType): boolean;
export function getDefaultRelationship(from: TelosCategory, to: TelosCategory): RelationshipType;
export function getSuggestedRelationships(from: TelosCategory, to: TelosCategory): RelationshipType[];
```

### Phase 2: MCP Server Integration

#### Task 2.1: Update Entity Creation Logic
**File**: `index.ts` (or main server file)
**Requirements**:
- Import relationship schema
- Modify entity creation to assign TELOS categories
- Add category detection logic based on entity content

**Implementation Notes**:
- Use keyword matching to auto-detect TELOS categories
- Default to 'Context' if category unclear
- Allow manual category override

#### Task 2.2: Enhance Relationship Creation
**File**: `index.ts`
**Requirements**:
- Import validation functions
- Validate relationships before creation
- Suggest appropriate relationship types
- Provide helpful error messages for invalid combinations

**Key Changes**:
- Wrap existing `create_relations` function with validation
- Add relationship suggestion functionality
- Log validation results for debugging

#### Task 2.3: Add Relationship Query Capabilities
**File**: `index.ts`
**Requirements**:
- Add new MCP tools for relationship querying
- Support filtering by relationship type
- Support path traversal queries (e.g., find all Projects that support an Objective)

**New Tools**:
- `query_relationships_by_type`
- `find_relationship_paths`
- `get_relationship_suggestions`

### Phase 3: Installation & Setup Automation

#### Task 3.1: Create Setup Script
**File**: `scripts/setup-taxonomy.js`
**Requirements**:
- Initialize default TELOS entities
- Create sample relationships using new taxonomy
- Validate taxonomy installation

**Functionality**:
- Create default user entity
- Set up basic TELOS structure
- Test all relationship types
- Generate validation report

#### Task 3.2: Update Package.json Scripts
**File**: `package.json`
**Requirements**:
- Add taxonomy setup script
- Add taxonomy validation script
- Update installation documentation

**New Scripts**:
```json
{
  "scripts": {
    "setup:taxonomy": "node scripts/setup-taxonomy.js",
    "validate:taxonomy": "node scripts/validate-taxonomy.js"
  }
}
```

#### Task 3.3: Update README.md
**File**: `README.md`
**Requirements**:
- Document new relationship taxonomy
- Include setup instructions
- Provide usage examples
- Link to full taxonomy documentation

### Phase 4: Testing & Validation

#### Task 4.1: Create Test Suite
**File**: `tests/relationship-taxonomy.test.ts`
**Requirements**:
- Test all 7 relationship types
- Test validation functions
- Test category detection
- Test relationship suggestions

#### Task 4.2: Create Sample Data
**File**: `tests/fixtures/sample-telos-data.json`
**Requirements**:
- Create realistic TELOS entities for all 12 categories
- Include diverse relationship examples
- Cover edge cases and common patterns

#### Task 4.3: Integration Testing
**Requirements**:
- Test full MCP server with new taxonomy
- Verify Claude integration works correctly
- Test relationship creation through MCP protocol
- Validate performance impact

## Success Criteria

### Functional Requirements
- [ ] All 7 relationship types work correctly
- [ ] Validation prevents invalid relationships
- [ ] Auto-suggestion provides helpful relationship options
- [ ] Setup script initializes taxonomy correctly
- [ ] Claude can successfully use new relationship types

### Quality Requirements
- [ ] Comprehensive documentation exists
- [ ] All code has TypeScript types
- [ ] Test coverage >80% for new functionality
- [ ] Performance impact <10ms per relationship operation
- [ ] Installation process is automated

### Usability Requirements
- [ ] Clear error messages for invalid relationships
- [ ] Helpful suggestions when creating relationships
- [ ] Documentation includes practical examples
- [ ] Setup process requires minimal user input

## Technical Notes

### Key Design Decisions
1. **Default Relationship Selection**: Use `supports` as default for most connections
2. **Validation Strategy**: Validate at creation time, provide suggestions
3. **Category Detection**: Use keyword matching with manual override option
4. **Error Handling**: Provide helpful error messages, never fail silently

### Implementation Order
1. Start with schema and documentation (foundational)
2. Update MCP server logic (core functionality)
3. Add setup automation (user experience)
4. Complete with testing (quality assurance)

### Potential Issues
- **Performance**: Relationship validation on every creation
- **Complexity**: 12x12 category matrix might be overwhelming
- **Migration**: Existing relationships need taxonomy assignment

### Rollback Plan
- Keep existing relationship creation functions as fallback
- Add feature flag to disable taxonomy validation
- Maintain backward compatibility with existing data

## Files to Create/Modify

### New Files
- `docs/relationship-taxonomy.md`
- `src/types/relationship-schema.ts`
- `scripts/setup-taxonomy.js`
- `scripts/validate-taxonomy.js`
- `tests/relationship-taxonomy.test.ts`
- `tests/fixtures/sample-telos-data.json`

### Modified Files
- `index.ts` (main MCP server)
- `package.json` (new scripts)
- `README.md` (documentation updates)
- `tsconfig.json` (if new paths needed)

## Estimated Timeline
- **Phase 1**: 2-3 hours (documentation and schema)
- **Phase 2**: 3-4 hours (MCP server integration) 
- **Phase 3**: 2-3 hours (setup automation)
- **Phase 4**: 2-3 hours (testing and validation)
- **Total**: 9-13 hours for complete implementation

## Next Action
Begin with **Task 1.1**: Create `docs/relationship-taxonomy.md` with complete taxonomy documentation including the 12x7 relationship matrix.