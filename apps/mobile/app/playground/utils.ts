import { ComponentItem } from './type';

/**
 * 组件扫描器 - 用于自动发现和配置组件信息
 */

// 手动配置的组件列表，包含详细信息
export const COMPONENT_CONFIGS: ComponentItem[] = [
  {
    category: 'feedback',
    description: '功能完整的提示框组件，支持12种位置和多种触发方式',
    hasDemos: true,
    hasReadme: true,
    name: 'Tooltip',
    path: 'tooltip',
    tags: ['tooltip', 'popover', 'overlay'],
  },
  {
    category: 'feedback',
    description: '优雅的消息提示组件，支持多种类型和动画效果',
    hasDemos: true,
    hasReadme: true,
    name: 'Toast',
    path: 'toast',
    tags: ['toast', 'notification', 'message'],
  },
  {
    category: 'feedback',
    description: 'Ant Design 风格的提示组件，支持状态、图标、关闭与操作按钮',
    hasDemos: true,
    hasReadme: true,
    name: 'Alert',
    path: 'alert',
    tags: ['alert', 'message', 'feedback', 'notification'],
  },
  {
    category: 'display',
    description: '基于 Shiki 的高性能代码高亮组件，支持100+种编程语言',
    hasDemos: true,
    hasReadme: true,
    name: 'Highlighter',
    path: 'highlighter',
    tags: ['code', 'syntax', 'highlight', 'shiki'],
  },
  {
    category: 'display',
    description: '强大的Markdown渲染组件，支持数学公式、代码高亮等',
    hasDemos: true,
    hasReadme: true,
    name: 'Markdown',
    path: 'markdown',
    tags: ['markdown', 'text', 'render', 'mathjax', 'code'],
  },
  {
    category: 'layout',
    description: '功能丰富的列表项组件，支持头像、描述、路由导航',
    hasDemos: true,
    hasReadme: true,
    name: 'ListItem',
    path: 'listitem',
    tags: ['list', 'item', 'avatar', 'navigation', 'menu'],
  },
  {
    category: 'display',
    description: '可定制的头像组件，支持自定义尺寸、边框和错误处理',
    hasDemos: true,
    hasReadme: true,
    name: 'Avatar',
    path: 'avatar',
    tags: ['avatar', 'user', 'profile', 'image'],
  },
  {
    category: 'layout',
    description: '设置组件之间的间距，支持水平/垂直布局、不同对齐方式和分隔符',
    hasDemos: true,
    hasReadme: true,
    name: 'Space',
    path: 'space',
    tags: ['space', 'layout', 'gap', 'margin', 'separator'],
  },
  {
    category: 'display',
    description: '微软 Fluent 风格的 3D 表情符号组件，支持自定义大小和回退',
    hasDemos: true,
    hasReadme: false,
    name: 'FluentEmoji',
    path: 'fluentemoji',
    tags: ['emoji', 'fluent', '3d', 'icon'],
  },
  {
    category: 'display',
    description: '进行标记和分类的小标签组件，支持自定义样式',
    hasDemos: true,
    hasReadme: false,
    name: 'Tag',
    path: 'tag',
    tags: ['tag', 'label', 'badge', 'category'],
  },
  {
    category: 'navigation',
    description: '水平滚动的胶囊选项卡组件，支持多尺寸、自定义样式和选择状态',
    hasDemos: true,
    hasReadme: false,
    name: 'CapsuleTabs',
    path: 'capsuletabs',
    tags: ['tabs', 'capsule', 'navigation', 'scroll', 'horizontal'],
  },
  {
    category: 'basic',
    description: 'React Native版本的按钮组件，参考Ant Design设计，支持多种类型、尺寸和状态',
    hasDemos: true,
    hasReadme: false,
    name: 'Button',
    path: 'button',
    tags: ['button', 'action', 'click', 'primary', 'loading'],
  },
  {
    category: 'basic',
    description: '轻量的图标渲染封装，支持颜色、尺寸与旋转动画控制',
    hasDemos: true,
    hasReadme: true,
    name: 'Icon',
    path: 'icon',
    tags: ['icon', 'visual', 'color', 'spin'],
  },
  {
    category: 'basic',
    description: '轻量级的图标操作按钮，支持尺寸、变体、加载与禁用状态',
    hasDemos: true,
    hasReadme: true,
    name: 'ActionIcon',
    path: 'action-icon',
    tags: ['icon', 'button', 'action', 'loading'],
  },
  {
    category: 'feedback',
    description: '骨架屏组件，用于页面加载状态，支持头像、标题、段落和动画效果',
    hasDemos: true,
    hasReadme: false,
    name: 'Skeleton',
    path: 'skeleton',
    tags: ['skeleton', 'loading', 'placeholder', 'shimmer', 'animation'],
  },
  {
    category: 'form',
    description: '支持异步操作的即时开关组件，具有乐观更新和错误回滚机制',
    hasDemos: true,
    hasReadme: true,
    name: 'InstantSwitch',
    path: 'instant-switch',
    tags: ['switch', 'toggle', 'async', 'loading', 'form'],
  },
  {
    category: 'form',
    description: '基于 React Native Switch 的主题封装，固定配色并支持主题',
    hasDemos: true,
    hasReadme: true,
    name: 'Switch',
    path: 'switch',
    tags: ['switch', 'toggle', 'form'],
  },
  {
    category: 'form',
    description: '基于 LobeUI 重写的颜色选择器组件，支持圆形/方形样式、透明色处理',
    hasDemos: true,
    hasReadme: true,
    name: 'ColorSwatches',
    path: 'colorswatches',
    tags: ['color', 'picker', 'swatch', 'form', 'ui'],
  },
  {
    category: 'form',
    description: 'React Native 版本的滑动输入条组件，支持自定义范围、步长和手势交互',
    hasDemos: true,
    hasReadme: true,
    name: 'Slider',
    path: 'slider',
    tags: ['slider', 'range', 'input', 'gesture', 'form'],
  },
  {
    category: 'form',
    description: '增强的文本输入组件，支持前缀图标和统一样式设计',
    hasDemos: true,
    hasReadme: true,
    name: 'Input',
    path: 'input',
    tags: ['input', 'textinput', 'form', 'prefix', 'text'],
  },
  {
    category: 'form',
    description: 'Ant Design 风格的表单容器，支持字段校验、必填标记与受控实例',
    hasDemos: true,
    hasReadme: true,
    name: 'Form',
    path: 'form',
    tags: ['form', 'validation', 'fields', 'layout'],
  },
  {
    category: 'display',
    description: '基于 LobeUI 重写的色板展示组件，支持完整的颜色级别、透明色和复制功能',
    hasDemos: true,
    hasReadme: true,
    name: 'ColorScales',
    path: 'colorscales',
    tags: ['color', 'scale', 'palette', 'design', 'theme'],
  },
  {
    category: 'display',
    description: '主题 Token 展示页面，显示种子、映射和别名令牌，支持主题切换和搜索',
    hasDemos: false,
    hasReadme: false,
    name: 'Theme Token',
    path: 'theme-token',
    tags: ['theme', 'tokens', 'design', 'colors', 'typography'],
  },
  {
    category: 'display',
    description: '主题展示页面，如何使用 ThemeProvider',
    hasDemos: false,
    hasReadme: false,
    name: 'ThemeProvider',
    path: 'theme-provider',
    tags: ['theme', 'token'],
  },
  {
    category: 'layout',
    description: '基于 Flexbox 的弹性布局容器，提供简洁的 API 来控制子元素排列',
    hasDemos: true,
    hasReadme: true,
    name: 'Flexbox',
    path: 'flexbox',
    tags: ['flexbox', 'layout', 'container', 'alignment'],
  },
  {
    category: 'layout',
    description: '居中组件，支持水平、垂直或完全居中显示子元素',
    hasDemos: true,
    hasReadme: true,
    name: 'Center',
    path: 'center',
    tags: ['center', 'layout', 'align', 'middle'],
  },
  {
    category: 'layout',
    description: '基于 Flexbox 的灵活容器组件，支持多种样式变体、阴影和玻璃效果，使用 CVA 管理样式',
    hasDemos: true,
    hasReadme: true,
    name: 'Block',
    path: 'block',
    tags: ['block', 'container', 'cva', 'variant', 'layout'],
  },
  {
    category: 'layout',
    description: '信息卡片容器，内置标题、描述、页眉与页脚插槽，支持封面与多种视觉变体',
    hasDemos: true,
    hasReadme: true,
    name: 'Card',
    path: 'card',
    tags: ['card', 'container', 'layout', 'block'],
  },
];

/**
 * 根据分类获取组件列表
 */
export const getComponentsByCategory = (category?: string): ComponentItem[] => {
  if (!category) {
    return COMPONENT_CONFIGS;
  }
  return COMPONENT_CONFIGS.filter((component) => component.category === category);
};

/**
 * 根据标签搜索组件
 */
export const searchComponentsByTag = (tag: string): ComponentItem[] => {
  return COMPONENT_CONFIGS.filter((component) =>
    component.tags.some((t: string) => t.toLowerCase().includes(tag.toLowerCase())),
  );
};

/**
 * 根据名称搜索组件
 */
export const searchComponentsByName = (name: string): ComponentItem[] => {
  return COMPONENT_CONFIGS.filter(
    (component) =>
      component.name.toLowerCase().includes(name.toLowerCase()) ||
      component.description.toLowerCase().includes(name.toLowerCase()),
  );
};

/**
 * 获取所有分类
 */
export const getAllCategories = (): string[] => {
  const categories = new Set(COMPONENT_CONFIGS.map((component) => component.category));
  return Array.from(categories);
};

/**
 * 获取所有标签
 */
export const getAllTags = (): string[] => {
  const tags = new Set(COMPONENT_CONFIGS.flatMap((component) => component.tags));
  return Array.from(tags);
};

/**
 * 获取组件统计信息
 */
export const getComponentStats = () => {
  const total = COMPONENT_CONFIGS.length;
  const withReadme = COMPONENT_CONFIGS.filter((c) => c.hasReadme).length;
  const withDemos = COMPONENT_CONFIGS.filter((c) => c.hasDemos).length;

  return {
    categories: getAllCategories().length,
    tags: getAllTags().length,
    total,
    withDemos,
    withReadme,
  };
};
