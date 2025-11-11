@chat @smoke
Feature: 聊天页面冒烟测试
  确保聊天模块的关键路径功能正常

  @CHAT-SMOKE-001 @P0
  Scenario: 加载聊天主页
    Given 我访问 "/chat"
    Then 页面应该正常加载
    And 我应该看到页面主体
    And 我应该看到会话列表面板
    And 我应该看到聊天输入框

  @CHAT-SMOKE-002 @P0
  Scenario: 加载默认会话
    Given 我访问 "/chat"
    When 页面完全加载
    Then 我应该看到默认会话
    And 我应该看到欢迎消息

  @CHAT-SMOKE-003 @P0
  Scenario: 会话列表显示
    Given 我访问 "/chat"
    Then 我应该看到会话列表
    And 我应该看到新建会话按钮
    And 我应该看到收件箱入口

  @CHAT-SMOKE-004 @P0
  Scenario: 输入框功能可用
    Given 我访问 "/chat"
    When 页面完全加载
    Then 输入框应该可以点击
    And 我应该看到发送按钮
    And 我应该看到输入框操作栏
