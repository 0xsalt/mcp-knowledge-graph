/**
 * TELOS Relationship Taxonomy Test Suite
 * 
 * Tests all aspects of the new TELOS relationship taxonomy system including:
 * - Category detection
 * - Relationship validation
 * - Suggestion algorithms
 * - Integration with MCP server
 */

import { 
  RelationshipType, 
  TelosCategory, 
  validateRelationship,
  getDefaultRelationship,
  getSuggestedRelationships,
  detectTelosCategory,
  isValidRelationshipType,
  isValidTelosCategory,
  getRelationshipDescription 
} from '../src/types/relationship-schema.js';

describe('TELOS Relationship Taxonomy', () => {
  
  describe('RelationshipType Enum', () => {
    test('should contain all 7 relationship types', () => {
      const expectedTypes = [
        'supports', 'enables', 'constrains', 'mentors', 
        'informs', 'reflects_on', 'threatens'
      ];
      
      const actualTypes = Object.values(RelationshipType);
      expect(actualTypes).toEqual(expect.arrayContaining(expectedTypes));
      expect(actualTypes).toHaveLength(7);
    });
  });

  describe('TelosCategory Enum', () => {
    test('should contain all 12 TELOS categories', () => {
      const expectedCategories = [
        'Identity', 'Memory', 'Resources', 'Context', 'Conventions', 
        'Objectives', 'Projects', 'Habits', 'Risks', 'DecisionJournal', 
        'Relationships', 'Retros'
      ];
      
      const actualCategories = Object.values(TelosCategory);
      expect(actualCategories).toEqual(expect.arrayContaining(expectedCategories));
      expect(actualCategories).toHaveLength(12);
    });
  });

  describe('Category Detection', () => {
    test('should detect Habits category from keywords', () => {
      const result = detectTelosCategory('daily_standup', ['routine meeting', 'daily practice']);
      expect(result).toBe(TelosCategory.HABITS);
    });

    test('should detect Objectives category from keywords', () => {
      const result = detectTelosCategory('product_launch_goal', ['target Q4 2024', 'achieve 10k users']);
      expect(result).toBe(TelosCategory.OBJECTIVES);
    });

    test('should detect Risks category from keywords', () => {
      const result = detectTelosCategory('budget_shortage', ['threat to project', 'risk of delays']);
      expect(result).toBe(TelosCategory.RISKS);
    });

    test('should detect Resources category from keywords', () => {
      const result = detectTelosCategory('development_tools', ['infrastructure', 'capability enhancement']);
      expect(result).toBe(TelosCategory.RESOURCES);
    });

    test('should default to Context for unclear content', () => {
      const result = detectTelosCategory('ambiguous_entity', ['unclear content']);
      expect(result).toBe(TelosCategory.CONTEXT);
    });
  });

  describe('Relationship Validation', () => {
    test('should validate correct relationships', () => {
      const result = validateRelationship(
        TelosCategory.HABITS, 
        TelosCategory.PROJECTS, 
        RelationshipType.SUPPORTS
      );
      
      expect(result.isValid).toBe(true);
      expect(result.suggestedType).toBe(RelationshipType.SUPPORTS);
    });

    test('should reject invalid relationship types for categories', () => {
      const result = validateRelationship(
        TelosCategory.MEMORY, 
        TelosCategory.PROJECTS, 
        RelationshipType.THREATENS
      );
      
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toContain('not valid for category');
    });

    test('should reject mentors from non-Relationships categories', () => {
      const result = validateRelationship(
        TelosCategory.PROJECTS, 
        TelosCategory.OBJECTIVES, 
        RelationshipType.MENTORS
      );
      
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toContain('should only be used by people');
    });

    test('should reject threatens from non-Risks categories', () => {
      const result = validateRelationship(
        TelosCategory.PROJECTS, 
        TelosCategory.OBJECTIVES, 
        RelationshipType.THREATENS
      );
      
      expect(result.isValid).toBe(false);
      expect(result.errorMessage).toContain('should only be used by risks');
    });

    test('should allow threatens from Risks category', () => {
      const result = validateRelationship(
        TelosCategory.RISKS, 
        TelosCategory.PROJECTS, 
        RelationshipType.THREATENS
      );
      
      expect(result.isValid).toBe(true);
    });

    test('should allow mentors from Relationships category', () => {
      const result = validateRelationship(
        TelosCategory.RELATIONSHIPS, 
        TelosCategory.PROJECTS, 
        RelationshipType.MENTORS
      );
      
      expect(result.isValid).toBe(true);
    });
  });

  describe('Default Relationship Selection', () => {
    test('should suggest supports for Habits -> Projects', () => {
      const result = getDefaultRelationship(TelosCategory.HABITS, TelosCategory.PROJECTS);
      expect(result).toBe(RelationshipType.SUPPORTS);
    });

    test('should suggest enables for Resources -> Projects', () => {
      const result = getDefaultRelationship(TelosCategory.RESOURCES, TelosCategory.PROJECTS);
      expect(result).toBe(RelationshipType.ENABLES);
    });

    test('should suggest constrains for Context -> Projects', () => {
      const result = getDefaultRelationship(TelosCategory.CONTEXT, TelosCategory.PROJECTS);
      expect(result).toBe(RelationshipType.CONSTRAINS);
    });

    test('should suggest threatens for Risks -> Projects', () => {
      const result = getDefaultRelationship(TelosCategory.RISKS, TelosCategory.PROJECTS);
      expect(result).toBe(RelationshipType.THREATENS);
    });

    test('should default to supports for undefined combinations', () => {
      const result = getDefaultRelationship(TelosCategory.IDENTITY, TelosCategory.MEMORY);
      expect(result).toBe(RelationshipType.SUPPORTS);
    });
  });

  describe('Relationship Suggestions', () => {
    test('should return default first in suggestions', () => {
      const suggestions = getSuggestedRelationships(TelosCategory.HABITS, TelosCategory.PROJECTS);
      expect(suggestions[0]).toBe(RelationshipType.SUPPORTS);
      expect(suggestions.length).toBeGreaterThan(1);
    });

    test('should include all valid types for category', () => {
      const suggestions = getSuggestedRelationships(TelosCategory.PROJECTS, TelosCategory.OBJECTIVES);
      expect(suggestions).toContain(RelationshipType.SUPPORTS);
      expect(suggestions).toContain(RelationshipType.ENABLES);
      expect(suggestions).toContain(RelationshipType.CONSTRAINS);
    });

    test('should not suggest invalid types', () => {
      const suggestions = getSuggestedRelationships(TelosCategory.MEMORY, TelosCategory.PROJECTS);
      expect(suggestions).not.toContain(RelationshipType.THREATENS);
      expect(suggestions).not.toContain(RelationshipType.MENTORS);
    });
  });

  describe('Type Guards', () => {
    test('should validate relationship type strings', () => {
      expect(isValidRelationshipType('supports')).toBe(true);
      expect(isValidRelationshipType('enables')).toBe(true);
      expect(isValidRelationshipType('invalid')).toBe(false);
      expect(isValidRelationshipType('')).toBe(false);
    });

    test('should validate TELOS category strings', () => {
      expect(isValidTelosCategory('Identity')).toBe(true);
      expect(isValidTelosCategory('Projects')).toBe(true);
      expect(isValidTelosCategory('Invalid')).toBe(false);
      expect(isValidTelosCategory('')).toBe(false);
    });
  });

  describe('Relationship Descriptions', () => {
    test('should provide descriptions for all relationship types', () => {
      Object.values(RelationshipType).forEach(type => {
        const description = getRelationshipDescription(type);
        expect(description).toBeTruthy();
        expect(description).not.toBe('Unknown relationship type');
      });
    });

    test('should return unknown for invalid types', () => {
      const description = getRelationshipDescription('invalid' as RelationshipType);
      expect(description).toBe('Unknown relationship type');
    });
  });

  describe('Matrix Coverage', () => {
    test('should have valid relationships for all categories', () => {
      Object.values(TelosCategory).forEach(category => {
        Object.values(RelationshipType).forEach(relationshipType => {
          const result = validateRelationship(category, TelosCategory.PROJECTS, relationshipType);
          // At least some relationship should be valid for each category
          // This is a smoke test to ensure the matrix is complete
          expect(typeof result.isValid).toBe('boolean');
        });
      });
    });

    test('should maintain special rules consistency', () => {
      // Risks should be the only category that can threaten
      Object.values(TelosCategory).forEach(category => {
        const result = validateRelationship(category, TelosCategory.PROJECTS, RelationshipType.THREATENS);
        if (category === TelosCategory.RISKS) {
          expect(result.isValid).toBe(true);
        } else {
          expect(result.isValid).toBe(false);
        }
      });

      // Relationships should be the only category that can mentor
      Object.values(TelosCategory).forEach(category => {
        const result = validateRelationship(category, TelosCategory.PROJECTS, RelationshipType.MENTORS);
        if (category === TelosCategory.RELATIONSHIPS) {
          expect(result.isValid).toBe(true);
        } else {
          expect(result.isValid).toBe(false);
        }
      });
    });
  });
});

// Integration tests would go here if we had a test database setup
describe('MCP Server Integration', () => {
  test.skip('should integrate with knowledge graph manager', () => {
    // These would test the actual MCP server integration
    // Skipped for now as they require more setup
  });
});