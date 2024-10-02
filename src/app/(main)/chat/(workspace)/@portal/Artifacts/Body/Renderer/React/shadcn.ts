// 定义所有 Shadcn 组件的列表
const shadcnComponents = [
  'card',
  // 'accordion',
  // 'alert',
  // 'alert-dialog',
  // 'aspect-ratio',
  // 'avatar',
  // 'badge',
  // 'button',
  // 'calendar',
  // 'checkbox',
  // 'collapsible',
  // 'command',
  // 'context-menu',
  // 'dialog',
  // 'dropdown-menu',
  // 'form',
  // 'hover-card',
  // 'input',
  // 'label',
  // 'menubar',
  // 'navigation-menu',
  // 'popover',
  // 'progress',
  // 'radio-group',
  // 'scroll-area',
  // 'select',
  // 'separator',
  // 'sheet',
  // 'skeleton',
  // 'slider',
  // 'switch',
  // 'table',
  // 'tabs',
  // 'textarea',
  // 'toast',
  // 'toggle',
  // 'tooltip',
];

// 为每个组件创建一个文件，直接映射到 Shadcn UI 的官方仓库
export const shadcnComponentFiles = shadcnComponents.reduce(
  (acc: Record<string, { code: string }>, component) => {
    acc[`src/components/ui/${component}.tsx`] = {
      code: `export * from '@lshay/ui/components/default/${component}';`,
    };
    return acc;
  },
  {},
);
