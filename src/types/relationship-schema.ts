/**
 * TELOS Relationship Taxonomy Schema
 * 
 * This module defines the core types and validation logic for the TELOS
 * relationship taxonomy system, supporting 7 relationship types across
 * 12 TELOS categories.
 */

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
  RESOURCES = 'Resources',
  CONTEXT = 'Context',
  CONVENTIONS = 'Conventions',
  OBJECTIVES = 'Objectives',
  PROJECTS = 'Projects',
  HABITS = 'Habits',
  RISKS = 'Risks',
  DECISION_JOURNAL = 'DecisionJournal',
  RELATIONSHIPS = 'Relationships',
  RETROS = 'Retros'
}

export interface RelationshipRule {
  from: TelosCategory;
  to: TelosCategory;
  allowedTypes: RelationshipType[];
}

export interface ValidationResult {
  isValid: boolean;
  allowedTypes: RelationshipType[];
  suggestedType?: RelationshipType;
  errorMessage?: string;
}

/**
 * 7x12 Relationship-Category Matrix
 * Defines which relationship types are valid for each TELOS category
 */
const RELATIONSHIP_MATRIX: Record<TelosCategory, RelationshipType[]> = {
  [TelosCategory.IDENTITY]: [
    RelationshipType.SUPPORTS,
    RelationshipType.ENABLES,
    RelationshipType.CONSTRAINS,
    RelationshipType.MENTORS,
    RelationshipType.INFORMS,
    RelationshipType.REFLECTS_ON
  ],
  [TelosCategory.MEMORY]: [
    RelationshipType.SUPPORTS,
    RelationshipType.ENABLES,
    RelationshipType.CONSTRAINS,
    RelationshipType.INFORMS
  ],
  [TelosCategory.RESOURCES]: [
    RelationshipType.SUPPORTS,
    RelationshipType.ENABLES,
    RelationshipType.CONSTRAINS,
    RelationshipType.INFORMS
  ],
  [TelosCategory.CONTEXT]: [
    RelationshipType.SUPPORTS,
    RelationshipType.ENABLES,
    RelationshipType.CONSTRAINS,
    RelationshipType.INFORMS
  ],
  [TelosCategory.CONVENTIONS]: [
    RelationshipType.SUPPORTS,
    RelationshipType.ENABLES,
    RelationshipType.CONSTRAINS,
    RelationshipType.INFORMS
  ],
  [TelosCategory.OBJECTIVES]: [
    RelationshipType.SUPPORTS,
    RelationshipType.ENABLES,
    RelationshipType.CONSTRAINS,
    RelationshipType.MENTORS,
    RelationshipType.INFORMS,
    RelationshipType.REFLECTS_ON
  ],
  [TelosCategory.PROJECTS]: [
    RelationshipType.SUPPORTS,
    RelationshipType.ENABLES,
    RelationshipType.CONSTRAINS,
    RelationshipType.MENTORS,
    RelationshipType.INFORMS,
    RelationshipType.REFLECTS_ON
  ],
  [TelosCategory.HABITS]: [
    RelationshipType.SUPPORTS,
    RelationshipType.ENABLES,
    RelationshipType.CONSTRAINS,
    RelationshipType.MENTORS,
    RelationshipType.INFORMS,
    RelationshipType.REFLECTS_ON
  ],
  [TelosCategory.RISKS]: [
    RelationshipType.MENTORS,
    RelationshipType.INFORMS,
    RelationshipType.REFLECTS_ON,
    RelationshipType.THREATENS
  ],
  [TelosCategory.DECISION_JOURNAL]: [
    RelationshipType.SUPPORTS,
    RelationshipType.ENABLES,
    RelationshipType.CONSTRAINS,
    RelationshipType.MENTORS,
    RelationshipType.INFORMS,
    RelationshipType.REFLECTS_ON
  ],
  [TelosCategory.RELATIONSHIPS]: [
    RelationshipType.SUPPORTS,
    RelationshipType.ENABLES,
    RelationshipType.CONSTRAINS,
    RelationshipType.MENTORS,
    RelationshipType.INFORMS,
    RelationshipType.REFLECTS_ON
  ],
  [TelosCategory.RETROS]: [
    RelationshipType.SUPPORTS,
    RelationshipType.ENABLES,
    RelationshipType.CONSTRAINS,
    RelationshipType.MENTORS,
    RelationshipType.INFORMS,
    RelationshipType.REFLECTS_ON
  ]
};

/**
 * Keywords for automatic TELOS category detection
 */
const CATEGORY_KEYWORDS: Record<TelosCategory, string[]> = {
  [TelosCategory.IDENTITY]: ['values', 'mission', 'principles', 'identity', 'purpose', 'vision'],
  [TelosCategory.MEMORY]: ['learned', 'experience', 'remember', 'past', 'history', 'lesson'],
  [TelosCategory.RESOURCES]: ['tool', 'budget', 'asset', 'infrastructure', 'capability', 'equipment'],
  [TelosCategory.CONTEXT]: ['environment', 'situation', 'current', 'market', 'team', 'setting'],
  [TelosCategory.CONVENTIONS]: ['standard', 'rule', 'process', 'methodology', 'practice', 'protocol'],
  [TelosCategory.OBJECTIVES]: ['goal', 'target', 'achieve', 'outcome', 'result', 'objective'],
  [TelosCategory.PROJECTS]: ['initiative', 'effort', 'implementation', 'build', 'create', 'project'],
  [TelosCategory.HABITS]: ['routine', 'practice', 'daily', 'regular', 'consistency', 'habit'],
  [TelosCategory.RISKS]: ['threat', 'danger', 'vulnerability', 'concern', 'issue', 'risk'],
  [TelosCategory.DECISION_JOURNAL]: ['decided', 'choice', 'option', 'alternative', 'decision', 'choose'],
  [TelosCategory.RELATIONSHIPS]: ['person', 'team', 'stakeholder', 'connection', 'network', 'relationship'],
  [TelosCategory.RETROS]: ['retrospective', 'review', 'reflection', 'lesson', 'feedback', 'retro']
};

/**
 * Default relationship type preferences for each category combination
 */
const DEFAULT_RELATIONSHIPS: Record<string, RelationshipType> = {
  // Habits -> Projects/Objectives
  [`${TelosCategory.HABITS}-${TelosCategory.PROJECTS}`]: RelationshipType.SUPPORTS,
  [`${TelosCategory.HABITS}-${TelosCategory.OBJECTIVES}`]: RelationshipType.SUPPORTS,
  
  // Projects -> Objectives
  [`${TelosCategory.PROJECTS}-${TelosCategory.OBJECTIVES}`]: RelationshipType.SUPPORTS,
  
  // Resources -> Projects/Habits
  [`${TelosCategory.RESOURCES}-${TelosCategory.PROJECTS}`]: RelationshipType.ENABLES,
  [`${TelosCategory.RESOURCES}-${TelosCategory.HABITS}`]: RelationshipType.ENABLES,
  
  // Context -> Projects/Objectives (constraining)
  [`${TelosCategory.CONTEXT}-${TelosCategory.PROJECTS}`]: RelationshipType.CONSTRAINS,
  [`${TelosCategory.CONTEXT}-${TelosCategory.OBJECTIVES}`]: RelationshipType.CONSTRAINS,
  
  // Memory -> Decisions
  [`${TelosCategory.MEMORY}-${TelosCategory.DECISION_JOURNAL}`]: RelationshipType.INFORMS,
  
  // Retros -> Projects/Habits
  [`${TelosCategory.RETROS}-${TelosCategory.PROJECTS}`]: RelationshipType.REFLECTS_ON,
  [`${TelosCategory.RETROS}-${TelosCategory.HABITS}`]: RelationshipType.REFLECTS_ON,
  
  // Risks -> anything (threatens)
  [`${TelosCategory.RISKS}-${TelosCategory.PROJECTS}`]: RelationshipType.THREATENS,
  [`${TelosCategory.RISKS}-${TelosCategory.OBJECTIVES}`]: RelationshipType.THREATENS,
  
  // Conventions -> Habits/Projects
  [`${TelosCategory.CONVENTIONS}-${TelosCategory.HABITS}`]: RelationshipType.CONSTRAINS,
  [`${TelosCategory.CONVENTIONS}-${TelosCategory.PROJECTS}`]: RelationshipType.CONSTRAINS
};

/**
 * Validates if a relationship type is allowed for a given TELOS category
 */
export function validateRelationship(
  fromCategory: TelosCategory, 
  toCategory: TelosCategory, 
  relationshipType: RelationshipType
): ValidationResult {
  const allowedTypes = RELATIONSHIP_MATRIX[fromCategory];
  
  if (!allowedTypes.includes(relationshipType)) {
    const suggestedType = getDefaultRelationship(fromCategory, toCategory);
    return {
      isValid: false,
      allowedTypes,
      suggestedType,
      errorMessage: `Relationship type '${relationshipType}' is not valid for category '${fromCategory}'. Allowed types: ${allowedTypes.join(', ')}`
    };
  }
  
  // Special validation for mentors - should only be used by people
  if (relationshipType === RelationshipType.MENTORS && fromCategory !== TelosCategory.RELATIONSHIPS) {
    return {
      isValid: false,
      allowedTypes,
      errorMessage: `Relationship type 'mentors' should only be used by people (Relationships category), not '${fromCategory}'`
    };
  }
  
  // Special validation for threatens - should only be used by risks
  if (relationshipType === RelationshipType.THREATENS && fromCategory !== TelosCategory.RISKS) {
    return {
      isValid: false,
      allowedTypes,
      errorMessage: `Relationship type 'threatens' should only be used by risks, not '${fromCategory}'`
    };
  }
  
  return {
    isValid: true,
    allowedTypes,
    suggestedType: relationshipType
  };
}

/**
 * Gets the default/suggested relationship type for a category combination
 */
export function getDefaultRelationship(
  fromCategory: TelosCategory, 
  toCategory: TelosCategory
): RelationshipType {
  const key = `${fromCategory}-${toCategory}`;
  return DEFAULT_RELATIONSHIPS[key] || RelationshipType.SUPPORTS;
}

/**
 * Gets all suggested relationship types for a category combination
 */
export function getSuggestedRelationships(
  fromCategory: TelosCategory, 
  toCategory: TelosCategory
): RelationshipType[] {
  const allowedTypes = RELATIONSHIP_MATRIX[fromCategory];
  const defaultType = getDefaultRelationship(fromCategory, toCategory);
  
  // Put default first, then others
  return [defaultType, ...allowedTypes.filter(type => type !== defaultType)];
}

/**
 * Detects TELOS category based on entity name and observations
 */
export function detectTelosCategory(entityName: string, observations: string[] = []): TelosCategory {
  const searchText = `${entityName} ${observations.join(' ')}`.toLowerCase();
  
  let bestMatch: { category: TelosCategory; score: number } = {
    category: TelosCategory.CONTEXT, // Default fallback
    score: 0
  };
  
  // Score each category based on keyword matches
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    const score = keywords.reduce((count, keyword) => {
      return count + (searchText.includes(keyword.toLowerCase()) ? 1 : 0);
    }, 0);
    
    if (score > bestMatch.score) {
      bestMatch = {
        category: category as TelosCategory,
        score
      };
    }
  }
  
  return bestMatch.category;
}

/**
 * Gets all valid relationship types for a given TELOS category
 */
export function getValidRelationshipTypes(category: TelosCategory): RelationshipType[] {
  return RELATIONSHIP_MATRIX[category] || [];
}

/**
 * Checks if a relationship type is valid for a category
 */
export function isValidRelationshipForCategory(
  category: TelosCategory, 
  relationshipType: RelationshipType
): boolean {
  return RELATIONSHIP_MATRIX[category]?.includes(relationshipType) || false;
}

/**
 * Gets human-readable description for a relationship type
 */
export function getRelationshipDescription(relationshipType: RelationshipType): string {
  const descriptions: Record<RelationshipType, string> = {
    [RelationshipType.SUPPORTS]: 'Forward progress toward goals',
    [RelationshipType.ENABLES]: 'Provides capability, resources, or tools',
    [RelationshipType.CONSTRAINS]: 'Limitations, boundaries, or restrictions',
    [RelationshipType.MENTORS]: 'Human relationships and guidance',
    [RelationshipType.INFORMS]: 'Knowledge, context, or information sharing',
    [RelationshipType.REFLECTS_ON]: 'Retrospective analysis and learning',
    [RelationshipType.THREATENS]: 'Risk relationships and potential negative impacts'
  };
  
  return descriptions[relationshipType] || 'Unknown relationship type';
}

/**
 * Type guard to check if a string is a valid RelationshipType
 */
export function isValidRelationshipType(value: string): value is RelationshipType {
  return Object.values(RelationshipType).includes(value as RelationshipType);
}

/**
 * Type guard to check if a string is a valid TelosCategory
 */
export function isValidTelosCategory(value: string): value is TelosCategory {
  return Object.values(TelosCategory).includes(value as TelosCategory);
}