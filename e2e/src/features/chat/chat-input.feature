@chat @input
Feature: 聊天输入功能
  测试聊天输入框的各种功能和操作

  Background:
    Given 应用正在运行

  # ============================================
  # 基础输入
  # ============================================

  @CHAT-INPUT-001 @P1
  Scenario: 文本输入
    Given 我访问 "/chat"
    When 我点击输入框
    And 我输入 "测试文本"
    Then 输入框应该显示我输入的文本

  @CHAT-INPUT-002 @P1
  Scenario: 多行文本输入
    Given 我访问 "/chat"
    When 我在输入框中输入多行文本
    Then 输入框应该自动扩展高度
    And 所有文本应该可见

  @CHAT-INPUT-003 @P1
  Scenario: 清空输入框
    Given 我访问 "/chat"
    And 输入框中有文本
    When 我点击清空按钮
    Then 输入框应该被清空
    And 发送按钮应该禁用

  # ============================================
  # 文件上传
  # ============================================

  @CHAT-INPUT-004 @P1
  Scenario: 上传图片文件
    Given 我访问 "/chat"
    When 我点击上传按钮
    And 我选择一张图片文件
    Then 图片应该显示在预览区
    And 我应该看到图片缩略图
    And 发送按钮应该可用

  @CHAT-INPUT-005 @P1
  Scenario: 上传普通文件
    Given 我访问 "/chat"
    When 我点击上传按钮
    And 我选择一个 PDF 文件
    Then 文件应该显示在预览区
    And 我应该看到文件信息
    And 发送按钮应该可用

  @CHAT-INPUT-006 @P1
  Scenario: 移除上传的文件
    Given 我访问 "/chat"
    And 我已经上传了一个文件
    When 我点击文件预览上的删除按钮
    Then 文件应该从预览区移除

  @CHAT-INPUT-007 @P1
  Scenario: 拖拽上传文件
    Given 我访问 "/chat"
    When 我拖拽一个文件到输入框区域
    Then 文件应该被上传
    And 应该显示在预览区

  @CHAT-INPUT-008 @P1
  Scenario: 查看上传文件详情
    Given 我访问 "/chat"
    And 我已经上传了一个文件
    When 我点击文件预览
    Then 应该显示文件详细信息
    And 我应该看到上传进度或状态

  # ============================================
  # 提及功能 (@)
  # ============================================

  @CHAT-INPUT-009 @P1
  Scenario: 提及助手
    Given 我访问一个 Agent 团队的聊天 "/chat"
    When 我在输入框中输入 "@"
    Then 应该显示可提及的助手列表
    And 我应该看到团队成员

  @CHAT-INPUT-010 @P1
  Scenario: 选择要提及的助手
    Given 我访问一个 Agent 团队的聊天 "/chat"
    And 我已经触发了提及列表
    When 我点击某个助手
    Then 助手名称应该插入到输入框
    And 应该显示提及标记

  @CHAT-INPUT-011 @P1
  Scenario: 移除提及标记
    Given 我访问一个 Agent 团队的聊天 "/chat"
    And 输入框中有提及标记
    When 我点击提及标记的删除按钮
    Then 提及标记应该被移除

  # ============================================
  # Slash 命令
  # ============================================

  @CHAT-INPUT-012 @P2
  Scenario: 触发 Slash 命令菜单
    Given 我访问 "/chat"
    When 我在输入框中输入 "/"
    Then 应该显示可用的命令列表
    And 我应该看到命令提示

  @CHAT-INPUT-013 @P2
  Scenario: 选择 Slash 命令
    Given 我访问 "/chat"
    And 我已经触发了命令列表
    When 我选择一个命令
    Then 命令应该被插入到输入框或被执行

  # ============================================
  # 语音输入
  # ============================================

  @CHAT-INPUT-014 @P2
  Scenario: 开启语音输入
    Given 我访问 "/chat"
    When 我点击语音输入按钮
    Then 应该请求麦克风权限
    And 应该开始语音识别

  @CHAT-INPUT-015 @P2
  Scenario: 语音转文字
    Given 我访问 "/chat"
    And 语音输入已开启
    When 我说话
    Then 识别的文字应该显示在输入框
    And 应该实时更新文字内容

  @CHAT-INPUT-016 @P2
  Scenario: 停止语音输入
    Given 我访问 "/chat"
    And 语音输入已开启
    When 我点击停止按钮
    Then 语音识别应该停止
    And 最终文字应该保留在输入框

  # ============================================
  # 输入框工具栏
  # ============================================

  @CHAT-INPUT-017 @P1
  Scenario: 查看输入框工具栏
    Given 我访问 "/chat"
    Then 我应该看到模型选择按钮
    And 我应该看到工具按钮
    And 我应该看到上传按钮
    And 我应该看到更多选项按钮

  @CHAT-INPUT-018 @P1
  Scenario: 切换模型
    Given 我访问 "/chat"
    When 我点击模型选择按钮
    Then 应该显示可用的模型列表
    When 我选择另一个模型
    Then 模型应该切换成功
    And 应该显示当前选中的模型

  @CHAT-INPUT-019 @P1
  Scenario: 查看 Token 使用情况
    Given 我访问 "/chat"
    And 输入框中有文本
    Then 我应该看到 Token 计数
    And 应该显示当前使用量

  @CHAT-INPUT-020 @P1
  Scenario: 开启工具
    Given 我访问 "/chat"
    When 我点击工具按钮
    Then 应该显示可用的工具列表
    When 我启用某个工具
    Then 工具应该被激活
    And 应该显示工具已启用的状态

  # ============================================
  # 历史消息限制
  # ============================================

  @CHAT-INPUT-021 @P1
  Scenario: 设置历史消息数限制
    Given 我访问 "/chat"
    When 我点击历史消息设置按钮
    And 我设置消息数限制为 10
    Then 设置应该保存成功
    And 应该显示"助手将只记住最后10条消息"

  # ============================================
  # 搜索功能
  # ============================================

  @CHAT-INPUT-022 @P1
  Scenario: 开启搜索功能
    Given 我访问 "/chat"
    When 我点击搜索按钮
    Then 搜索功能应该被启用
    And 应该显示搜索配置选项

  # ============================================
  # 保存话题
  # ============================================

  @CHAT-INPUT-023 @P2
  Scenario: 保存为话题
    Given 我访问 "/chat"
    And 当前会话有消息记录
    When 我点击保存话题按钮
    Then 应该提示输入话题名称
    When 我输入话题名称并确认
    Then 话题应该保存成功
    And 应该在话题列表中显示
