@chat @model
Feature: 模型设置
  测试聊天模型选择和相关参数配置功能

  Background:
    Given 应用正在运行

  # ============================================
  # 模型选择
  # ============================================

  @CHAT-MODEL-001 @P1
  Scenario: 切换模型
    Given 我访问 "/chat"
    When 我点击模型选择按钮
    Then 应该显示可用的模型列表
    When 我选择另一个模型
    Then 模型应该切换成功
    And 应该显示当前选中的模型名称

  @CHAT-MODEL-002 @P1
  Scenario: 查看模型详情
    Given 我访问 "/chat"
    When 我点击模型选择按钮
    And 我悬停在某个模型上
    Then 应该显示模型详细信息
    And 我应该看到模型参数
    And 我应该看到定价信息

  @CHAT-MODEL-003 @P1
  Scenario: 搜索模型
    Given 我访问 "/chat"
    And 模型选择面板已打开
    When 我在搜索框中输入模型名称
    Then 应该显示匹配的模型
    And 不匹配的模型应该被隐藏

  # ============================================
  # 模型扩展功能
  # ============================================

  @CHAT-MODEL-004 @P1
  Scenario: 开启上下文缓存
    Given 我访问 "/chat"
    And 当前模型支持上下文缓存
    When 我点击模型设置
    And 我开启上下文缓存开关
    Then 上下文缓存应该被启用
    And 应该显示功能说明
    And 历史消息数限制应该自动禁用

  @CHAT-MODEL-005 @P1
  Scenario: 关闭上下文缓存
    Given 我访问 "/chat"
    And 上下文缓存已开启
    When 我关闭上下文缓存开关
    Then 上下文缓存应该被禁用

  @CHAT-MODEL-006 @P1
  Scenario: 开启深度思考
    Given 我访问 "/chat"
    And 当前模型支持深度思考
    When 我点击模型设置
    And 我开启深度思考开关
    Then 深度思考应该被启用
    And 应该显示思考相关配置
    And 历史消息数限制应该自动禁用

  @CHAT-MODEL-007 @P1
  Scenario: 关闭深度思考
    Given 我访问 "/chat"
    And 深度思考已开启
    When 我关闭深度思考开关
    Then 深度思考应该被禁用

  # ============================================
  # 深度思考参数
  # ============================================

  @CHAT-MODEL-008 @P1
  Scenario: 调整推理强度
    Given 我访问 "/chat"
    And 深度思考已开启
    And 当前模型支持推理强度
    When 我调整推理强度滑块
    Then 推理强度值应该更新
    And 应该保存设置

  @CHAT-MODEL-009 @P1
  Scenario: 调整思考消耗 Token
    Given 我访问 "/chat"
    And 深度思考已开启
    And 当前模型支持思考 Token 设置
    When 我调整思考消耗 Token 滑块
    Then Token 值应该更新
    And 应该保存设置

  @CHAT-MODEL-010 @P1
  Scenario: 调整输出文本详细程度
    Given 我访问 "/chat"
    And 当前模型支持文本详细程度设置
    When 我调整文本详细程度滑块
    Then 详细程度值应该更新
    And 应该保存设置

  @CHAT-MODEL-011 @P1
  Scenario: 调整思考预算
    Given 我访问 "/chat"
    And 当前模型支持思考预算
    When 我调整思考预算滑块
    Then 预算值应该更新
    And 应该保存设置

  # ============================================
  # 历史消息设置
  # ============================================

  @CHAT-MODEL-012 @P1
  Scenario: 设置历史消息数限制
    Given 我访问 "/chat"
    When 我点击历史消息设置
    And 我设置限制为 10 条
    Then 设置应该保存成功
    And 应该显示"助手将只记住最后10条消息"

  @CHAT-MODEL-013 @P1
  Scenario: 移除历史消息数限制
    Given 我访问 "/chat"
    And 已经设置了历史消息数限制
    When 我清空历史消息数设置
    Then 限制应该被移除
    And 助手应该记住所有消息

  @CHAT-MODEL-014 @P1
  Scenario: 查看历史范围设置
    Given 我访问 "/chat"
    When 我点击历史范围按钮
    Then 应该显示当前的历史消息设置
    And 我应该看到历史消息数或"无限制"

  # ============================================
  # 网页链接提取
  # ============================================

  @CHAT-MODEL-015 @P1
  Scenario: 开启提取网页链接内容
    Given 我访问 "/chat"
    When 我点击模型设置
    And 我开启提取网页链接内容开关
    Then 功能应该被启用
    And 应该显示功能说明

  @CHAT-MODEL-016 @P1
  Scenario: 关闭提取网页链接内容
    Given 我访问 "/chat"
    And 提取网页链接内容已开启
    When 我关闭提取网页链接内容开关
    Then 功能应该被禁用

  # ============================================
  # 模型参数调整
  # ============================================

  @CHAT-MODEL-017 @P1
  Scenario: 打开模型参数面板
    Given 我访问 "/chat"
    When 我点击参数按钮
    Then 应该打开参数配置面板
    And 我应该看到温度、Top P 等参数

  @CHAT-MODEL-018 @P1
  Scenario: 调整温度参数
    Given 我访问 "/chat"
    And 参数面板已打开
    When 我调整温度滑块
    Then 温度值应该更新
    And 应该保存设置

  @CHAT-MODEL-019 @P1
  Scenario: 调整 Top P 参数
    Given 我访问 "/chat"
    And 参数面板已打开
    When 我调整 Top P 滑块
    Then Top P 值应该更新
    And 应该保存设置

  @CHAT-MODEL-020 @P1
  Scenario: 调整最大 Token 数
    Given 我访问 "/chat"
    And 参数面板已打开
    When 我设置最大 Token 数
    Then Token 数应该更新
    And 应该保存设置

  @CHAT-MODEL-021 @P1
  Scenario: 重置参数为默认值
    Given 我访问 "/chat"
    And 参数面板已打开
    And 我已经修改了参数
    When 我点击重置按钮
    Then 所有参数应该恢复默认值

  # ============================================
  # 模型定价信息
  # ============================================

  @CHAT-MODEL-022 @P2
  Scenario: 查看模型定价
    Given 我访问 "/chat"
    When 我查看模型卡片
    Then 我应该看到定价信息
    And 应该显示输入和输出 Token 价格
    And 应该显示缓存价格（如果支持）

  @CHAT-MODEL-023 @P2
  Scenario: 查看消息 Token 详情
    Given 我访问 "/chat"
    And 存在 AI 回复消息
    When 我点击消息的 Token 详情
    Then 应该显示详细的 Token 使用情况
    And 应该显示输入、输出、缓存 Token 数量
    And 应该显示总计消耗
    And 应该显示平均单价

  @CHAT-MODEL-024 @P2
  Scenario: 查看生成速度信息
    Given 我访问 "/chat"
    And 存在 AI 回复消息
    When 我查看消息详情
    Then 我应该看到 TPS（Tokens Per Second）
    And 我应该看到 TTFT（Time To First Token）
    And 应该显示速度提示信息
