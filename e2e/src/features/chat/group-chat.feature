@chat @group
Feature: Agent 团队聊天
  测试 Agent 团队的创建、管理和群组聊天功能

  Background:
    Given 应用正在运行

  # ============================================
  # 创建团队
  # ============================================

  @CHAT-GROUP-001 @P1
  Scenario: 创建空的 Agent 团队
    Given 我访问 "/chat"
    When 我点击新建 Agent 团队按钮
    And 我输入团队名称 "测试团队"
    And 我不选择任何成员
    And 我点击创建按钮
    Then 应该创建成功
    And 我应该看到空团队的欢迎界面
    And 应该提示添加成员

  @CHAT-GROUP-002 @P1
  Scenario: 使用模板创建 Agent 团队
    Given 我访问 "/chat"
    When 我点击新建 Agent 团队按钮
    And 我选择使用模板
    And 我选择一个模板
    Then 应该显示模板成员
    When 我点击创建按钮
    Then 团队应该创建成功
    And 应该包含模板中的所有成员

  @CHAT-GROUP-003 @P1
  Scenario: 选择现有助手创建团队
    Given 我访问 "/chat"
    And 我已经有多个助手
    When 我点击新建 Agent 团队按钮
    And 我从现有助手中选择 2 个成员
    And 我点击创建按钮
    Then 团队应该创建成功
    And 应该包含选中的 2 个成员

  # ============================================
  # 成员管理
  # ============================================

  @CHAT-GROUP-004 @P1
  Scenario: 添加团队成员
    Given 我访问一个 Agent 团队的聊天 "/chat"
    When 我点击添加成员按钮
    And 我选择一个助手
    And 我确认添加
    Then 该助手应该被添加到团队
    And 我应该在成员列表中看到该助手

  @CHAT-GROUP-005 @P1
  Scenario: 移除团队成员
    Given 我访问一个 Agent 团队的聊天 "/chat"
    And 团队中有多个成员
    When 我右键点击某个成员
    And 我选择移除成员选项
    And 我确认移除
    Then 该成员应该被移除
    And 成员列表中不应该再显示该成员

  @CHAT-GROUP-006 @P1
  Scenario: 查看成员设置
    Given 我访问一个 Agent 团队的聊天 "/chat"
    When 我点击某个成员
    Then 应该打开成员设置页面
    And 我应该看到成员的详细配置

  # ============================================
  # 主持人功能
  # ============================================

  @CHAT-GROUP-007 @P1
  Scenario: 启用团队主持人
    Given 我访问一个 Agent 团队的聊天 "/chat"
    And 主持人功能未启用
    When 我在团队设置中启用主持人
    Then 主持人应该被激活
    And 我应该看到主持人标识

  @CHAT-GROUP-008 @P1
  Scenario: 主持人开始群聊
    Given 我访问一个 Agent 团队的聊天 "/chat"
    And 主持人功能已启用
    When 我点击开始群聊按钮
    Then 主持人应该开始思考
    And 应该显示"主持人正在思考中..."
    And 主持人应该协调成员回复

  @CHAT-GROUP-009 @P1
  Scenario: 停止主持人思考
    Given 我访问一个 Agent 团队的聊天 "/chat"
    And 主持人正在思考
    When 我点击停止思考按钮
    Then 主持人应该停止思考
    And 思考状态应该消失

  @CHAT-GROUP-010 @P1
  Scenario: 禁用团队主持人
    Given 我访问一个 Agent 团队的聊天 "/chat"
    And 主持人功能已启用
    When 我在团队设置中禁用主持人
    Then 主持人应该被禁用
    And 应该显示手动提及模式提示

  # ============================================
  # 群组消息
  # ============================================

  @CHAT-GROUP-011 @P1
  Scenario: 在群组中发送消息
    Given 我访问一个 Agent 团队的聊天 "/chat"
    When 我发送消息 "大家好"
    Then 消息应该发送成功
    And 应该显示在聊天记录中

  @CHAT-GROUP-012 @P1
  Scenario: 提及特定成员
    Given 我访问一个 Agent 团队的聊天 "/chat"
    And 团队中有多个成员
    When 我在输入框中输入 "@" 并选择某个成员
    And 我输入消息内容
    And 我发送消息
    Then 被提及的成员应该回复
    And 消息应该显示提及标记

  @CHAT-GROUP-013 @P1
  Scenario: 查看所有成员
    Given 我访问一个 Agent 团队的聊天 "/chat"
    When 我点击成员标签
    Then 应该显示所有团队成员
    And 应该显示成员数量
    And 应该显示主持人标识

  # ============================================
  # 私信功能
  # ============================================

  @CHAT-GROUP-014 @P1
  Scenario: 发送私信给成员
    Given 我访问一个 Agent 团队的聊天 "/chat"
    And 团队中有多个成员
    When 我点击某个成员的私信按钮
    And 我输入私信内容
    And 我发送消息
    Then 私信应该发送成功
    And 应该显示"仅该成员可见"标记

  @CHAT-GROUP-015 @P1
  Scenario: 查看私信内容
    Given 我访问一个 Agent 团队的聊天 "/chat"
    And 存在私信消息
    And 显示私信内容已开启
    Then 我应该能看到私信内容
    And 应该显示私信标记

  @CHAT-GROUP-016 @P1
  Scenario: 隐藏私信内容
    Given 我访问一个 Agent 团队的聊天 "/chat"
    And 存在私信消息
    And 显示私信内容已关闭
    Then 私信内容应该被隐藏
    And 应该显示隐藏提示

  # ============================================
  # 团队配置
  # ============================================

  @CHAT-GROUP-017 @P1
  Scenario: 编辑团队描述
    Given 我访问一个 Agent 团队的聊天 "/chat"
    When 我打开团队设置
    And 我编辑团队描述
    And 我保存更改
    Then 团队描述应该更新成功

  @CHAT-GROUP-018 @P1
  Scenario: 查看团队设定
    Given 我访问一个 Agent 团队的聊天 "/chat"
    When 我点击设定标签
    Then 应该显示团队的系统提示词
    And 应该显示团队配置选项

  # ============================================
  # 删除团队
  # ============================================

  @CHAT-GROUP-019 @P1
  Scenario: 删除 Agent 团队
    Given 我访问 "/chat"
    And 存在一个 Agent 团队
    When 我右键点击该团队
    And 我选择删除选项
    And 我确认删除
    Then 团队应该被删除
    And 团队成员不应该受影响
    And 应该显示删除成功提示

  # ============================================
  # 群组欢迎信息
  # ============================================

  @CHAT-GROUP-020 @P1
  Scenario: 查看群组欢迎信息
    Given 我访问一个空的 Agent 团队的聊天 "/chat"
    Then 应该显示群组欢迎信息
    And 应该显示使用建议
    And 应该显示添加成员按钮
