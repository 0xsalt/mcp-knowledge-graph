Keep **Markdown as source of truth**. Use Obsidian transclusions to avoid duplication. Split level-3 areas into their own files, with a single **Bootstrap.md** as the front door.

## File tree

```
/TELOS/
  Bootstrap.md
  Identity.md
  Memory.md
  Resources.md
  Context.md
  Conventions.md
  Objectives.md
  Projects.md
  Habits.md
  Risks.md
  DecisionJournal.md
  Relationships.md
  Retros.md
```

### Stable-ID conventions

* Put `^ids` only on relationship-bearing lines (Objectives, Projects, Habits, People).
* Kebab-case, immutable: `^obj-sustainable-income`, `^prj-telos-kg`, `^hab-dj-daily`, `^person-alex-mentor`.

---

# Bootstraps + canon pages (paste-ready skeletons)

## Bootstrap.md

```md
# Digital Assistant — Bootstrap

### Memory Index
- Location, implementation, and usage
![[Memory#Memory Mechanics]]
![[Memory#Memory Types]]

### Resource Index
- Pointers to tools and information
![[Resources#Tools / Integrations]]
![[Resources#Project Management]]
![[Resources#Documentation]]
![[Resources#Agents]]

### Context Index
- Summary of my context, designed for jump-starting work with the DA
![[Context#Personal Context]]
![[Context#Team Context]]
![[Context#Context Management]]
![[Context#Org Context]]

### Convention Index
- Rules, agreements, style, etc.
![[Conventions#Style]]
![[Conventions#Agreements]]
![[Conventions#Rules]]

### TELOS Jump List
![[Identity]]
![[Objectives]]
![[Projects]]
![[Habits]]
![[DecisionJournal]]
![[Relationships]]
![[Retros]]
```

## Identity.md

```md
# Identity & Values  ^identity-[descriptive-name]
- Two-sentence identity snapshot: [Your professional/personal identity in 2 sentences]
- Nonnegotiables (3–5): [Your core values and non-negotiable principles]
- Guiding Signal: [Your primary guiding principle or mission]  ^gs-signal-of-use
```

## Objectives.md

```md
# Objectives (12–18 mo)
## Objective: [Your main 12-18 month goal]  ^obj-[descriptive-name]
- Metric: [Specific measurable outcome] by [YYYY-MM-DD]
- Priority: [1-5]
```

## Projects.md

```md
# Projects (active)
### Project: [Project name and description]  ^prj-[descriptive-name]
- Owner: [Person responsible]
- Next step: [Immediate next action]
- Due: [YYYY-MM-DD]
- Supports: ^obj-[related-objective-id]
```

## Habits.md

```md
# Habits (micro)
#### Habit: [Habit name and brief description]  ^hab-[descriptive-name]
- Cue: [trigger]; Behavior: [specific action]; Cadence: [frequency]
- Supports: ^prj-[related-project-id]
```

## Relationships.md

```md
# Relationships (core)
## People I'm actively cultivating (6–12)
- [Name] — [relationship type and interaction cadence]  ^person-[name]-[role]

## Rituals
- Weekly reach-outs: [number] messages ([types of outreach])
- Office hours / Coffee slots ([frequency]) — [calendar link or scheduling method]
```

## DecisionJournal.md

```md
# Decision Journal (rolling)
## Decision: [Decision title]  ^dj-[descriptive-name]
- [YYYY-MM-DD] — Decision: [what you decided]; Why: [reasoning]; Alts: [alternatives considered]; Expected: [expected outcome]; Review: [review date]
```

## Retros.md

```md
# Weekly Retro
## Retro: [Week of YYYY-MM-DD]  ^retro-[descriptive-name]
- Wins:
- Misses:
- Changes:
```

## Memory.md

```md
# Memory Mechanics  ^memory-[descriptive-name]

### Memory Types
- [Type]: [Description and usage]

### Memory Implementation
- Location: [Where memory is stored]
- Usage: [How to access and update]
```

## Resources.md

```md
# Resources  ^resources-[descriptive-name]

### Tools / Integrations  ^tools-[descriptive-name]
- [Tool name]: [Purpose and usage]

### Project Management  ^project-[descriptive-name]
- [System]: [Usage and access]

### Documentation  ^docs-[descriptive-name]
- [Doc type]: [Location and purpose]

### Agents  ^agents-[descriptive-name]
- [Agent name]: [Capabilities and usage]
```

## Context.md

```md
# Context Management  ^context-[descriptive-name]

### Personal Context  ^personal-[descriptive-name]
- [Context area]: [Current state and relevance]

### Team Context  ^team-[descriptive-name]
- [Team/Role]: [Current dynamics and priorities]

### Org Context  ^org-[descriptive-name]
- [Organization]: [Structure, priorities, and changes]
```

## Conventions.md

```md
# Conventions  ^conventions-[descriptive-name]

### Style  ^style-[descriptive-name]
- [Style area]: [Rules and examples]

### Agreements  ^agreements-[descriptive-name]
- [Agreement type]: [Details and scope]

### Rules  ^rules-[descriptive-name]
- [Rule area]: [Specific rules and exceptions]
```

---

# Motivation & Relationships woven into the flow

* **Motivation (need to cultivate):** bake **tiny wins** into Projects/Habits: every Project gets a 15-min “next step” and one micro-habit. Track Energy/Friction inside Retros (one line each).
* **Relationships (must cultivate):** make it *structural*, not aspirational:

  * A living list of **6–12 people** in Relationships.md (with `^person-*` IDs).
  * A **weekly ritual**: [number] reach-outs + [number] co-work invites + [number] gratitude notes. Log them briefly in DecisionJournal or Relationships.md.
  * Link people to Projects when relevant: "[Name] mentors ^prj-[project-id]" (even as a note). It keeps collaboration emotionally charged and visible.

---

# How this maps to the Living Model (present → future)

* **Present state:** Use **nesting + Supports lines** to imply edges (Habit → Project → Objective). Weekly, ask your LLM to generate a Mermaid graph from the Markdown—no infra.
* **Future state:** If/when you need queries and dashboards, export nodes/edges from the Markdown (IDs + nesting). The graph remains **derivative**; the writing stays central.

---

# QUICK START ACTIONS:
## Initial setup session (45–60 min)

1. Create the files above and paste the skeletons.
2. Write Identity (2 sentences) + 3-5 nonnegotiables.
3. Add **one** Objective, **one** Project, **one** Habit with `^ids`, as shown.
4. Add **two** relationship entries (names + why they matter).
5. Log **one** Decision.
6. Stop. You've got a working foundation.

Next, you can expand Projects/Habits and run your first weekly Retro. That's the approach: Markdown as heartbeat; structure as scaffolding; relationships as daily practice.

