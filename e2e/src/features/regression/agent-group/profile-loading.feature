@regression @agent-group @P0
Feature: 群组档案的独立加载
  群组档案的可选功能加载失败时，仍然能够查看和编辑群组资料。

  Scenario: 群组档案不会因可选组件加载而整页失败
    Given a group profile exists for the loading regression
    When I open the group profile
    Then the group profile content remains available

  Scenario: 离开群组档案不会清空刚选中的话题
    Given a group profile exists for the loading regression
    And a topic exists for the group profile navigation regression
    When I open the group profile
    Then I can return to the selected group topic
