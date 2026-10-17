@home @regression @mobile-category-actions
Feature: 移动端分类操作的可发现性与触控边界
  作为触屏用户，我希望直接打开分类操作，并独立展开分类与选择助理。

  Scenario Outline: 分类菜单在首次加载和失焦后保持可用
    Given 触屏首页宽度为 <width> 且有分类和助理
    Then 分类操作默认可见且有足够的触控区域
    When 直接触摸分类操作的中心和四侧内边界
    Then 分类折叠状态和当前页面没有改变
    When 关闭分类菜单并将焦点移到搜索框
    Then 分类操作默认可见且有足够的触控区域
    When 触摸分类标题后选择助理
    Then 只进入该分类的助理

    Examples:
      | width |
      | 390   |
      | 320   |
