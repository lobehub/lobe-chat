@home @regression @mobile-category-actions
Feature: Mobile category action discoverability and touch boundaries
  As a touchscreen user, I want to open category actions directly, expand categories, and select agents independently.

  Scenario Outline: Category actions remain available on initial load and after losing focus
    Given the touch home page is <width> pixels wide with a category and an agent
    Then category actions are visible by default with a sufficient touch target
    When I tap the category action at its center and four inner edges
    Then the category expansion state and current page remain unchanged
    When I close the category menu and move focus to the search field
    Then category actions are visible by default with a sufficient touch target
    When I tap the category title and then select its agent
    Then only the agent in that category is opened

    Examples:
      | width |
      | 390   |
      | 320   |
