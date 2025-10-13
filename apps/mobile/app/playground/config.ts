import { ComponentConfigTree } from './type';

/**
 * 组件配置树
 * 按分类组织的组件列表（每个分类下的组件按字母顺序排列）
 * 路径将通过 kebabCase(name) 自动生成
 */
export const COMPONENT_CONFIG_TREE: ComponentConfigTree = {
  animation: [],

  basic: ['ActionIcon', 'Button', 'Icon', 'Text'],

  display: [
    'Avatar',
    'ColorScales',
    'FluentEmoji',
    'Highlighter',
    'Markdown',
    'Tag',
    'ThemeToken',
    'ThemeProvider',
  ],

  feedback: ['Alert', 'Skeleton', 'Toast', 'Tooltip'],

  form: ['ColorSwatches', 'Form', 'Input', 'InstantSwitch', 'Slider', 'Switch'],

  layout: ['Block', 'Card', 'Center', 'Flexbox', 'ListItem', 'Space'],

  navigation: ['CapsuleTabs'],
} as const;
