/**
 * 主题系统使用示例
 * 展示如何使用新的主题系统
 */
import {
  compactAlgorithm,
  compactDarkAlgorithm,
  darkAlgorithm,
  defaultAlgorithm,
  defaultSeedToken,
  generateDesignToken,
} from './index';

// 1. 基础使用 - 生成默认主题
export const lightTheme = generateDesignToken();
export const darkTheme = generateDesignToken({}, true);

// 2. 自定义品牌色主题
export const customPrimaryTheme = generateDesignToken({
  token: {
    colorError: '#FF4D4F',
    colorInfo: '#1677FF',

    colorPrimary: 'rgba(0, 0, 0, 0)',
    // 透明色主色
    colorSuccess: '#00B96B',
    colorWarning: '#FAAD14',
  },
});

// 3. 自定义字体和尺寸
export const customSizeTheme = generateDesignToken({
  token: {
    ...defaultSeedToken,
    borderRadius: 8,
    controlHeight: 36,
    fontSize: 16,
    sizeStep: 6,
  },
});

// 4. 紧凑模式主题
export const compactLightTheme = generateDesignToken({
  algorithm: compactAlgorithm,
  token: {
    colorPrimary: 'rgba(0, 0, 0, 0)',
  },
});

export const compactDarkTheme = generateDesignToken({
  algorithm: compactDarkAlgorithm,
  token: {
    colorPrimary: 'rgba(0, 0, 0, 0)',
  },
});

// 5. 组合算法 - 同时应用多个算法
export const multiAlgorithmTheme = generateDesignToken({
  algorithm: [defaultAlgorithm, compactAlgorithm],
  token: {
    colorPrimary: 'rgba(0, 0, 0, 0)',
    fontSize: 13,
  },
});

// 6. 自定义中性色主题
export const customNeutralTheme = generateDesignToken({
  token: {
    colorBgBase: '#f8f9fa',
    colorPrimary: 'rgba(0, 0, 0, 0)',
    colorTextBase: '#343a40',
  },
});

// 7. 高对比度主题
export const highContrastTheme = generateDesignToken({
  token: {
    borderRadius: 2,
    colorBgBase: '#ffffff',
    colorPrimary: 'rgba(0, 0, 0, 0)',
    colorTextBase: '#000000', // 更尖锐的圆角
    lineWidth: 2, // 更粗的边框
  },
});

// 8. 暗色高对比度主题
export const darkHighContrastTheme = generateDesignToken({
  algorithm: darkAlgorithm,
  token: {
    borderRadius: 2,
    colorBgBase: '#000000',
    colorPrimary: 'rgba(0, 0, 0, 0)',
    colorTextBase: '#ffffff',
    lineWidth: 2,
  },
});

// 使用示例说明
export const USAGE_EXAMPLES = {
  // 在组件中使用主题
  componentUsage: `
import { useThemeToken } from '@/theme';

const MyComponent = () => {
  const token = useThemeToken();
  
  return (
    <View style={{
      backgroundColor: token.colorBgContainer,
      padding: token.padding,
      borderRadius: token.borderRadius,
      borderWidth: token.lineWidth,
      borderColor: token.colorBorder,
    }}>
      <Text style={{
        color: token.colorText,
        fontSize: token.fontSize,
        lineHeight: token.lineHeight * token.fontSize,
      }}>
        Hello World
      </Text>
    </View>
  );
};
  `,

  // 自定义主题配置
  customThemeConfig: `
import { generateDesignToken, darkAlgorithm } from '@/theme';

const myTheme = generateDesignToken({
  algorithm: darkAlgorithm,
  token: {
    colorPrimary: 'rgba(0, 0, 0, 0)',
    fontSize: 16,
    borderRadius: 8,
    sizeStep: 6,
  }
});
  `,

  // 动态切换主题
  dynamicTheme: `
import { ThemeProvider, useTheme } from '@/theme';

const App = () => {
  return (
    <ThemeProvider>
      <MyApp />
    </ThemeProvider>
  );
};

const ThemeToggle = () => {
  const { theme, toggleTheme, setThemeMode } = useTheme();
  
  return (
    <TouchableOpacity onPress={toggleTheme}>
      <Text>Current: {theme.mode}</Text>
    </TouchableOpacity>
  );
};
  `,
};
