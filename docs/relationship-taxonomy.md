# TELOS Relationship Taxonomy

## Overview
This document defines the comprehensive relationship taxonomy for the MCP Knowledge Graph, supporting all 12 TELOS categories with 7 distinct relationship types. This system enables rich semantic connections while maintaining usability.

## Relationship Types

### 1. `supports`
**Definition**: Forward progress toward goals (default for most connections)
**Usage**: Use when one entity directly contributes to achieving another entity
**Examples**:
- Habit supports Project: "Daily standup habit supports agile delivery project"
- Project supports Objective: "Website redesign project supports growth objective"

### 2. `enables`
**Definition**: Provides capability, resources, or tools
**Usage**: Use when one entity makes another entity possible or more effective
**Examples**:
- Resource enables Project: "API credentials enable integration project"
- Context enables Objective: "Remote work context enables global hiring objective"

### 3. `constrains`
**Definition**: Limitations, boundaries, or restrictions
**Usage**: Use when one entity imposes limitations on another entity
**Examples**:
- Context constrains Project: "Budget context constrains feature scope"
- Convention constrains Habit: "Code review convention constrains commit frequency"

### 4. `mentors`
**Definition**: Human relationships and guidance (people only)
**Usage**: Use exclusively for human-to-entity relationships
**Examples**:
- Person mentors Project: "Sarah mentors mobile app project"
- Person mentors Objective: "Tech lead mentors architecture improvement objective"

### 5. `informs`
**Definition**: Knowledge, context, or information sharing
**Usage**: Use when one entity provides knowledge that influences another
**Examples**:
- Memory informs Decision: "Previous failure memory informs architecture decision"
- Context informs Objective: "Market context informs product strategy objective"

### 6. `reflects_on`
**Definition**: Retrospective analysis and learning
**Usage**: Use when one entity analyzes or learns from another entity
**Examples**:
- Retro reflects_on Project: "Sprint retrospective reflects on delivery project"
- Decision reflects_on Habit: "Daily review decision reflects on communication habits"

### 7. `threatens`
**Definition**: Risk relationships and potential negative impacts
**Usage**: Use when one entity poses a risk or threat to another entity
**Examples**:
- Risk threatens Objective: "Security vulnerability threatens launch objective"
- Risk threatens Project: "Resource shortage risk threatens delivery project"

## Relationship-Category Matrix

The following 7x12 matrix shows which relationship types are valid for each TELOS category:

| TELOS Category | supports | enables | constrains | mentors | informs | reflects_on | threatens |
|----------------|----------|---------|------------|---------|---------|-------------|-----------|
| **Identity**   | ✓        | ✓       | ✓          | ✓       | ✓       | ✓           | ✗         |
| **Memory**     | ✓        | ✓       | ✓          | ✗       | ✓       | ✗           | ✗         |
| **Resources**  | ✓        | ✓       | ✓          | ✗       | ✓       | ✗           | ✗         |
| **Context**    | ✓        | ✓       | ✓          | ✗       | ✓       | ✗           | ✗         |
| **Conventions**| ✓        | ✓       | ✓          | ✗       | ✓       | ✗           | ✗         |
| **Objectives** | ✓        | ✓       | ✓          | ✓       | ✓       | ✓           | ✗         |
| **Projects**   | ✓        | ✓       | ✓          | ✓       | ✓       | ✓           | ✗         |
| **Habits**     | ✓        | ✓       | ✓          | ✓       | ✓       | ✓           | ✗         |
| **Risks**      | ✗        | ✗       | ✗          | ✓       | ✓       | ✓           | ✓         |
| **DecisionJournal** | ✓   | ✓       | ✓          | ✓       | ✓       | ✓           | ✗         |
| **Relationships** | ✓     | ✓       | ✓          | ✓       | ✓       | ✓           | ✗         |
| **Retros**     | ✓        | ✓       | ✓          | ✓       | ✓       | ✓           | ✗         |

### Matrix Legend
- ✓ = Valid relationship type for this category
- ✗ = Invalid relationship type for this category

### Special Cases
- **Risks**: Only entities can be created as threats to other entities. Risks primarily use `threatens`, `informs`, and accept `mentors` for risk management guidance.
- **People**: When creating relationships involving people, always use `mentors` regardless of the target category.

## Usage Guidelines

### Default Relationship Selection Rules
1. **First choice**: Use `supports` for most forward-progress relationships
2. **Resource relationships**: Use `enables` when providing capabilities or tools
3. **Limitation relationships**: Use `constrains` when imposing boundaries
4. **Human relationships**: Always use `mentors` for people
5. **Knowledge sharing**: Use `informs` for context or information transfer
6. **Learning relationships**: Use `reflects_on` for retrospective analysis
7. **Risk relationships**: Use `threatens` for risks only

### When to Use Each Relationship Type
- **supports**: When entity A directly helps entity B achieve its purpose
- **enables**: When entity A provides the capability for entity B to exist/function
- **constrains**: When entity A limits or restricts entity B's possibilities
- **mentors**: When a person provides guidance to any other entity
- **informs**: When entity A provides knowledge that influences entity B
- **reflects_on**: When entity A analyzes or learns from entity B's outcomes
- **threatens**: When entity A (typically a Risk) poses danger to entity B

### Common Patterns
1. **Goal Hierarchy**: Habit → supports → Project → supports → Objective
2. **Enablement Chain**: Resource → enables → Project, Context → enables → Objective
3. **Constraint Application**: Convention → constrains → Habit, Context → constrains → Project
4. **Learning Loop**: Retro → reflects_on → Project/Habit
5. **Risk Management**: Risk → threatens → Project/Objective
6. **Knowledge Flow**: Memory → informs → Decision → informs → Project

### Anti-Patterns (Avoid These)
- Using `supports` for everything (be more specific when appropriate)
- Using `mentors` for non-human entities
- Using `threatens` for non-risk entities
- Creating circular `reflects_on` relationships
- Over-constraining with too many `constrains` relationships

## Examples by Relationship Type

### supports
- "Daily code review habit supports code quality project"
- "Mobile app project supports customer engagement objective"
- "Team standup convention supports project delivery"

### enables
- "Development environment setup enables coding habits"
- "Budget allocation enables hiring project"
- "Remote work policy enables distributed team objective"

### constrains
- "Security requirements constrain feature implementation"
- "Time budget constrains project scope"
- "Compliance rules constrain data handling habits"

### mentors
- "Senior architect mentors API design project"
- "Product manager mentors user research objective"
- "Team lead mentors code review habits"

### informs
- "User feedback memory informs product decision"
- "Market analysis context informs pricing strategy"
- "Performance metrics inform optimization habits"

### reflects_on
- "Monthly retrospective reflects on development practices"
- "Project post-mortem reflects on delivery process"
- "Quarterly review reflects on goal achievement"

### threatens
- "Security vulnerability threatens product launch"
- "Resource shortage threatens delivery timeline"
- "Competitor action threatens market position"

## Implementation Notes

### Category Detection Keywords
- **Identity**: "values", "mission", "principles", "identity", "purpose"
- **Memory**: "learned", "experience", "remember", "past", "history"
- **Resources**: "tool", "budget", "asset", "infrastructure", "capability"
- **Context**: "environment", "situation", "current", "market", "team"
- **Conventions**: "standard", "rule", "process", "methodology", "practice"
- **Objectives**: "goal", "target", "achieve", "outcome", "result"
- **Projects**: "initiative", "effort", "implementation", "build", "create"
- **Habits**: "routine", "practice", "daily", "regular", "consistency"
- **Risks**: "threat", "danger", "vulnerability", "concern", "issue"
- **DecisionJournal**: "decided", "choice", "option", "alternative", "decision"
- **Relationships**: "person", "team", "stakeholder", "connection", "network"
- **Retros**: "retrospective", "review", "reflection", "lesson", "feedback"

### Validation Rules
- Validate relationship type against category matrix before creation
- Provide helpful suggestions when invalid combinations are attempted
- Default to `supports` when relationship type is ambiguous
- Always validate that `mentors` is only used with human entities
- Ensure `threatens` is only used by Risk entities

This taxonomy provides a robust foundation for semantic relationship modeling while maintaining simplicity and usability.