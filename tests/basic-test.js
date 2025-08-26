#!/usr/bin/env node

/**
 * Basic Test Suite for TELOS Relationship Taxonomy
 * 
 * Simple test runner that doesn't require additional dependencies.
 * Tests the core functionality of the relationship taxonomy system.
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
} from '../dist/src/types/relationship-schema.js';

let testsRun = 0;
let testsPassed = 0;
let testsFailed = 0;

function assert(condition, message) {
  testsRun++;
  if (condition) {
    testsPassed++;
    console.log(`PASS ${message}`);
  } else {
    testsFailed++;
    console.log(`❌ ${message}`);
  }
}

function assertEqual(actual, expected, message) {
  assert(actual === expected, `${message} (expected: ${expected}, got: ${actual})`);
}

function assertContains(array, item, message) {
  assert(array.includes(item), `${message} (array should contain: ${item})`);
}

function assertNotContains(array, item, message) {
  assert(!array.includes(item), `${message} (array should not contain: ${item})`);
}

function runTests() {
  console.log('🧪 Running TELOS Relationship Taxonomy Tests...\n');

  // Test 1: RelationshipType enum completeness
  console.log('📋 Testing RelationshipType enum...');
  const expectedTypes = ['supports', 'enables', 'constrains', 'mentors', 'informs', 'reflects_on', 'threatens'];
  const actualTypes = Object.values(RelationshipType);
  
  assertEqual(actualTypes.length, 7, 'Should have exactly 7 relationship types');
  expectedTypes.forEach(type => {
    assertContains(actualTypes, type, `Should contain relationship type: ${type}`);
  });

  // Test 2: TelosCategory enum completeness
  console.log('\n📂 Testing TelosCategory enum...');
  const expectedCategories = [
    'Identity', 'Memory', 'Resources', 'Context', 'Conventions', 
    'Objectives', 'Projects', 'Habits', 'Risks', 'DecisionJournal', 
    'Relationships', 'Retros'
  ];
  const actualCategories = Object.values(TelosCategory);
  
  assertEqual(actualCategories.length, 12, 'Should have exactly 12 TELOS categories');
  expectedCategories.forEach(category => {
    assertContains(actualCategories, category, `Should contain TELOS category: ${category}`);
  });

  // Test 3: Category Detection
  console.log('\n🔍 Testing category detection...');
  
  assertEqual(
    detectTelosCategory('daily_standup', ['routine meeting', 'daily practice']),
    TelosCategory.HABITS,
    'Should detect Habits category from keywords'
  );
  
  assertEqual(
    detectTelosCategory('product_launch_goal', ['target Q4 2024', 'achieve 10k users']),
    TelosCategory.OBJECTIVES,
    'Should detect Objectives category from keywords'
  );
  
  assertEqual(
    detectTelosCategory('budget_shortage', ['threat to project', 'risk of delays']),
    TelosCategory.RISKS,
    'Should detect Risks category from keywords'
  );

  assertEqual(
    detectTelosCategory('ambiguous_entity', ['unclear content']),
    TelosCategory.CONTEXT,
    'Should default to Context for unclear content'
  );

  // Test 4: Relationship Validation
  console.log('\n✅ Testing relationship validation...');
  
  const validResult = validateRelationship(
    TelosCategory.HABITS, 
    TelosCategory.PROJECTS, 
    RelationshipType.SUPPORTS
  );
  assert(validResult.isValid, 'Should validate correct Habits -> Projects supports relationship');

  const invalidResult = validateRelationship(
    TelosCategory.MEMORY, 
    TelosCategory.PROJECTS, 
    RelationshipType.THREATENS
  );
  assert(!invalidResult.isValid, 'Should reject threatens from Memory category');
  assert(invalidResult.errorMessage.includes('not valid'), 'Should provide helpful error message');

  // Test 5: Special relationship rules
  console.log('\n🔒 Testing special relationship rules...');
  
  const mentorsFromProject = validateRelationship(
    TelosCategory.PROJECTS, 
    TelosCategory.OBJECTIVES, 
    RelationshipType.MENTORS
  );
  assert(!mentorsFromProject.isValid, 'Should reject mentors from non-Relationships category');

  const threatenFromProject = validateRelationship(
    TelosCategory.PROJECTS, 
    TelosCategory.OBJECTIVES, 
    RelationshipType.THREATENS
  );
  assert(!threatenFromProject.isValid, 'Should reject threatens from non-Risks category');

  const validThreatens = validateRelationship(
    TelosCategory.RISKS, 
    TelosCategory.PROJECTS, 
    RelationshipType.THREATENS
  );
  assert(validThreatens.isValid, 'Should allow threatens from Risks category');

  const validMentors = validateRelationship(
    TelosCategory.RELATIONSHIPS, 
    TelosCategory.PROJECTS, 
    RelationshipType.MENTORS
  );
  assert(validMentors.isValid, 'Should allow mentors from Relationships category');

  // Test 6: Default Relationship Selection
  console.log('\n🎯 Testing default relationship selection...');
  
  assertEqual(
    getDefaultRelationship(TelosCategory.HABITS, TelosCategory.PROJECTS),
    RelationshipType.SUPPORTS,
    'Should suggest supports for Habits -> Projects'
  );

  assertEqual(
    getDefaultRelationship(TelosCategory.RESOURCES, TelosCategory.PROJECTS),
    RelationshipType.ENABLES,
    'Should suggest enables for Resources -> Projects'
  );

  assertEqual(
    getDefaultRelationship(TelosCategory.CONTEXT, TelosCategory.PROJECTS),
    RelationshipType.CONSTRAINS,
    'Should suggest constrains for Context -> Projects'
  );

  assertEqual(
    getDefaultRelationship(TelosCategory.RISKS, TelosCategory.PROJECTS),
    RelationshipType.THREATENS,
    'Should suggest threatens for Risks -> Projects'
  );

  // Test 7: Relationship Suggestions
  console.log('\nTesting relationship suggestions...');
  
  const suggestions = getSuggestedRelationships(TelosCategory.HABITS, TelosCategory.PROJECTS);
  assertEqual(suggestions[0], RelationshipType.SUPPORTS, 'Should put default relationship first');
  assert(suggestions.length > 1, 'Should provide multiple suggestions');

  const projectSuggestions = getSuggestedRelationships(TelosCategory.PROJECTS, TelosCategory.OBJECTIVES);
  assertContains(projectSuggestions, RelationshipType.SUPPORTS, 'Should include supports in suggestions');
  assertContains(projectSuggestions, RelationshipType.ENABLES, 'Should include enables in suggestions');

  const memorySuggestions = getSuggestedRelationships(TelosCategory.MEMORY, TelosCategory.PROJECTS);
  assertNotContains(memorySuggestions, RelationshipType.THREATENS, 'Should not suggest invalid types');
  assertNotContains(memorySuggestions, RelationshipType.MENTORS, 'Should not suggest mentors for Memory');

  // Test 8: Type Guards
  console.log('\n🛡️ Testing type guards...');
  
  assert(isValidRelationshipType('supports'), 'Should validate valid relationship type');
  assert(isValidRelationshipType('enables'), 'Should validate another valid relationship type');
  assert(!isValidRelationshipType('invalid'), 'Should reject invalid relationship type');
  assert(!isValidRelationshipType(''), 'Should reject empty relationship type');

  assert(isValidTelosCategory('Identity'), 'Should validate valid TELOS category');
  assert(isValidTelosCategory('Projects'), 'Should validate another valid TELOS category');
  assert(!isValidTelosCategory('Invalid'), 'Should reject invalid TELOS category');
  assert(!isValidTelosCategory(''), 'Should reject empty TELOS category');

  // Test 9: Relationship Descriptions
  console.log('\n📝 Testing relationship descriptions...');
  
  Object.values(RelationshipType).forEach(type => {
    const description = getRelationshipDescription(type);
    assert(description && description.length > 0, `Should provide description for ${type}`);
    assert(description !== 'Unknown relationship type', `Should have specific description for ${type}`);
  });

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('🧪 Test Results Summary');
  console.log('='.repeat(50));
  console.log(`📊 Total tests run: ${testsRun}`);
  console.log(`✅ Tests passed: ${testsPassed}`);
  console.log(`❌ Tests failed: ${testsFailed}`);
  console.log(`📈 Success rate: ${Math.round((testsPassed / testsRun) * 100)}%`);
  
  if (testsFailed === 0) {
    console.log('\nAll tests passed! TELOS taxonomy is working correctly.');
    return true;
  } else {
    console.log('\nSome tests failed. Please review the implementation.');
    return false;
  }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const success = runTests();
  process.exit(success ? 0 : 1);
}