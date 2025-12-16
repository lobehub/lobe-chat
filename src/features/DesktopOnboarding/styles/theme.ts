import { theme } from 'antd';

// 自定义主题配置
export const customTheme = {
  // 使用暗黑主题算法
  algorithm: theme.darkAlgorithm,

  // 组件级别的主题配置
  components: {
    Button: {
      colorTextLightSolid: '#000000',
      // 移除 Primary 按钮阴影
      defaultShadow: 'none',
      primaryShadow: 'none', // 移除 Default 按钮阴影

      // 如需更多自定义，可添加：
      // colorPrimaryHover: '#颜色值',  // 悬停时的颜色
      // defaultBorderColor: '#颜色值', // Default 按钮边框色
    },

    // 其他组件配置示例：
    // Input: {
    //   colorPrimary: '#FFDE04',
    // },
  },

  token: {
    // 基础样式
    borderRadius: 8,

    // 背景色
    colorBgBase: '#000000',

    // 暗黑模式背景
    colorBgElevated: 'rgba(0, 0, 0, 0.85)',

    // 绿色 - 用于成功状态
    colorBlue: '#4A77FF',

    // 导航条等浮层背景
    colorBorderSecondary: 'rgba(255, 255, 255, 0.08)',

    // 成功色
    colorError: '#ff4d4f',

    // 错误色
    // 渐变背景色
    colorGradientPrimary: '#732FAE',

    // 主渐变色
    colorGradientSecondary: '#3A31C1',

    // 黄色 - 用于突出显示
    colorGreen: '#67AF3F',

    colorHighlight: '#FFDE04',
    colorHighlightHover: '#FFE227',
    // 主色 - 黄色（影响 Primary 按钮等主要元素）
    colorPrimary: '#FFFFFF',

    // 蓝色 - 用于信息提示
    colorPurple: '#7A45D3',

    // 紫色 - 用于特殊功能
    colorSuccess: '#52c41a',

    colorTextBase: '#fff',

    colorTextSecondary: 'rgba(255,255,255,0.45)',

    // 品牌色彩系统
    colorYellow: '#FFCB47',

    // 次渐变色
    // 字体配置
    fontFamily:
      "'HarmonyOS Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif",

    fontSize: 14,
    fontSizeLG: 20, // 边框色
  },
};

// 导出主题相关的工具函数
export const getThemeToken = () => {
  // 这里可以根据需要返回动态的主题配置
  return customTheme.token;
};
