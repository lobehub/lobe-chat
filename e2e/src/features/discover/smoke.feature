@discover @smoke
Feature: Discover Smoke Tests
  Critical path tests to ensure the discover module is functional

  @DISCOVER-SMOKE-001 @P0
  Scenario: Load Discover Home Page
    Given I navigate to "/discover"
    Then the page should load without errors
    And I should see the page body
    And I should see the featured assistants section
    And I should see the featured MCP tools section

  @DISCOVER-SMOKE-002 @P0
  Scenario: Load Assistant List Page
    Given I navigate to "/discover/assistant"
    Then the page should load without errors
    And I should see the page body
    And I should see the search bar
    And I should see the category menu
    And I should see assistant cards
    And I should see pagination controls

  @DISCOVER-SMOKE-003 @P0
  Scenario: Load Model List Page
    Given I navigate to "/discover/model"
    Then the page should load without errors
    And I should see the page body
    And I should see model cards
    And I should see the sort dropdown

  @DISCOVER-SMOKE-004 @P0
  Scenario: Load Provider List Page
    Given I navigate to "/discover/provider"
    Then the page should load without errors
    And I should see the page body
    And I should see provider cards

  @DISCOVER-SMOKE-005 @P0
  Scenario: Load MCP List Page
    Given I navigate to "/discover/mcp"
    Then the page should load without errors
    And I should see the page body
    And I should see MCP cards
    And I should see the category filter
