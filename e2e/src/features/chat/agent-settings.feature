@chat @agent-settings
Feature: 助手设置
  测试助手配置和设置相关功能

  Background:
    Given 应用正在运行

  # ============================================
  # 进入设置页面
  # ============================================

  @CHAT-AGENT-001 @P1
  Scenario: 从聊天页面进入助手设置
    Given 我访问 "/chat"
    When 我点击助手设置按钮
    Then 应该进入助手设置页面
    And URL 应该包含 "/chat/settings"
    And 我应该看到助手配置界面

  @CHAT-AGENT-002 @P1
  Scenario: 从会话列表进入助手设置
    Given 我访问 "/chat"
    When 我右键点击某个会话
    And 我选择设置选项
    Then 应该进入该助手的设置页面

  @CHAT-AGENT-003 @P1
  Scenario: 返回聊天页面
    Given 我在助手设置页面 "/chat/settings"
    When 我点击返回按钮
    Then 应该返回到聊天页面
    And 应该显示该助手的聊天界面

  # ============================================
  # 基础信息设置
  # ============================================

  @CHAT-AGENT-004 @P1
  Scenario: 修改助手名称
    Given 我在助手设置页面 "/chat/settings"
    When 我修改助手名称为 "测试助手"
    And 我保存设置
    Then 名称应该更新成功
    And 会话列表应该显示新名称

  @CHAT-AGENT-005 @P1
  Scenario: 修改助手描述
    Given 我在助手设置页面 "/chat/settings"
    When 我修改助手描述
    And 我保存设置
    Then 描述应该更新成功

  @CHAT-AGENT-006 @P1
  Scenario: 上传助手头像
    Given 我在助手设置页面 "/chat/settings"
    When 我点击头像上传按钮
    And 我选择一张图片
    Then 头像应该上传成功
    And 应该显示新头像

  @CHAT-AGENT-007 @P1
  Scenario: 修改助手颜色
    Given 我在助手设置页面 "/chat/settings"
    When 我选择一个新的颜色
    And 我保存设置
    Then 助手颜色应该更新
    And 会话列表应该显示新颜色

  # ============================================
  # 系统提示词
  # ============================================

  @CHAT-AGENT-008 @P1
  Scenario: 设置系统提示词
    Given 我在助手设置页面 "/chat/settings"
    When 我输入系统提示词
    And 我保存设置
    Then 系统提示词应该保存成功
    And 助手应该按照新提示词行为

  @CHAT-AGENT-009 @P1
  Scenario: 使用提示词模板
    Given 我在助手设置页面 "/chat/settings"
    When 我点击使用模板按钮
    And 我选择一个提示词模板
    Then 模板内容应该填充到系统提示词
    And 我可以继续编辑

  @CHAT-AGENT-010 @P1
  Scenario: 清空系统提示词
    Given 我在助手设置页面 "/chat/settings"
    And 已经设置了系统提示词
    When 我清空系统提示词
    And 我保存设置
    Then 系统提示词应该被清空
    And 助手应该使用默认行为

  # ============================================
  # 模型配置
  # ============================================

  @CHAT-AGENT-011 @P1
  Scenario: 为助手指定模型
    Given 我在助手设置页面 "/chat/settings"
    When 我选择一个特定模型
    And 我保存设置
    Then 该助手应该使用指定的模型
    And 模型设置应该保存

  @CHAT-AGENT-012 @P1
  Scenario: 配置模型参数
    Given 我在助手设置页面 "/chat/settings"
    When 我调整模型参数
    And 我保存设置
    Then 参数应该保存成功
    And 该助手应该使用新参数

  # ============================================
  # 工具配置
  # ============================================

  @CHAT-AGENT-013 @P1
  Scenario: 添加工具
    Given 我在助手设置页面 "/chat/settings"
    When 我点击添加工具按钮
    And 我选择一个工具
    And 我保存设置
    Then 工具应该被添加
    And 助手应该能使用该工具

  @CHAT-AGENT-014 @P1
  Scenario: 移除工具
    Given 我在助手设置页面 "/chat/settings"
    And 助手已经配置了工具
    When 我点击移除工具按钮
    And 我确认移除
    Then 工具应该被移除
    And 助手不应该再使用该工具

  @CHAT-AGENT-015 @P1
  Scenario: 配置工具参数
    Given 我在助手设置页面 "/chat/settings"
    And 助手已经配置了工具
    When 我点击工具设置
    And 我配置工具参数
    And 我保存设置
    Then 工具参数应该保存成功

  # ============================================
  # 插件配置
  # ============================================

  @CHAT-AGENT-016 @P1
  Scenario: 添加插件
    Given 我在助手设置页面 "/chat/settings"
    When 我点击添加插件按钮
    And 我选择一个插件
    And 我保存设置
    Then 插件应该被添加
    And 助手应该能使用该插件

  @CHAT-AGENT-017 @P1
  Scenario: 移除插件
    Given 我在助手设置页面 "/chat/settings"
    And 助手已经配置了插件
    When 我点击移除插件按钮
    And 我确认移除
    Then 插件应该被移除

  # ============================================
  # 知识库配置
  # ============================================

  @CHAT-AGENT-018 @P1
  Scenario: 关联知识库到助手
    Given 我在助手设置页面 "/chat/settings"
    When 我点击添加知识库按钮
    And 我选择一个知识库
    And 我保存设置
    Then 知识库应该被关联
    And 助手应该能访问该知识库

  @CHAT-AGENT-019 @P1
  Scenario: 移除助手的知识库关联
    Given 我在助手设置页面 "/chat/settings"
    And 助手已经关联了知识库
    When 我移除知识库关联
    And 我保存设置
    Then 知识库关联应该被移除

  # ============================================
  # 高级设置
  # ============================================

  @CHAT-AGENT-020 @P1
  Scenario: 配置助手标签
    Given 我在助手设置页面 "/chat/settings"
    When 我添加标签
    And 我保存设置
    Then 标签应该保存成功
    And 应该在助手信息中显示标签

  @CHAT-AGENT-021 @P2
  Scenario: 设置助手分类
    Given 我在助手设置页面 "/chat/settings"
    When 我选择助手分类
    And 我保存设置
    Then 分类应该保存成功

  # ============================================
  # 保存和提交
  # ============================================

  @CHAT-AGENT-022 @P1
  Scenario: 保存助手配置
    Given 我在助手设置页面 "/chat/settings"
    And 我已经修改了助手配置
    When 我点击保存按钮
    Then 配置应该保存成功
    And 应该显示保存成功提示

  @CHAT-AGENT-023 @P2
  Scenario: 提交助手到市场
    Given 我在助手设置页面 "/chat/settings"
    And 助手配置已完善
    When 我点击提交助手按钮
    Then 应该打开提交对话框
    And 我应该看到提交表单
    When 我填写提交信息并确认
    Then 应该提交成功
    And 应该显示提交成功提示

  # ============================================
  # 导入导出
  # ============================================

  @CHAT-AGENT-024 @P2
  Scenario: 导出助手配置
    Given 我在助手设置页面 "/chat/settings"
    When 我点击导出按钮
    Then 应该下载助手配置文件
    And 文件格式应该是 JSON

  @CHAT-AGENT-025 @P2
  Scenario: 导入助手配置
    Given 我访问 "/chat"
    When 我点击导入助手按钮
    And 我选择一个配置文件
    Then 应该导入成功
    And 应该创建新的助手
    And 助手配置应该与文件一致

  # ============================================
  # 团队设置
  # ============================================

  @CHAT-AGENT-026 @P1
  Scenario: 配置 Agent 团队主持人
    Given 我在一个 Agent 团队的设置页面 "/chat/settings"
    When 我配置主持人系统提示词
    And 我保存设置
    Then 主持人配置应该保存成功

  @CHAT-AGENT-027 @P1
  Scenario: 编辑团队成员角色
    Given 我在一个 Agent 团队的设置页面 "/chat/settings"
    When 我点击某个成员
    And 我编辑成员的角色描述
    And 我保存设置
    Then 成员角色应该更新成功

  # ============================================
  # 重置和删除
  # ============================================

  @CHAT-AGENT-028 @P2
  Scenario: 重置助手配置
    Given 我在助手设置页面 "/chat/settings"
    And 我已经修改了助手配置
    When 我点击重置按钮
    And 我确认重置
    Then 配置应该恢复到初始状态

  @CHAT-AGENT-029 @P1
  Scenario: 从设置页面删除助手
    Given 我在助手设置页面 "/chat/settings"
    When 我点击删除助手按钮
    And 我确认删除
    Then 助手应该被删除
    And 应该返回到聊天列表
    And 该助手不应该再显示在列表中
