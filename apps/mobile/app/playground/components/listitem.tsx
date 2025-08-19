import React from 'react';

import { AdvancedDemo, AvatarsDemo, BasicDemo, NavigationDemo } from '@/components/ListItem/demos';
import ComponentPlayground, { DemoItem } from '../Playground';

// 读取README内容
const readmeContent = `# ListItem组件

一个功能丰富的React Native列表项组件，支持头像、描述、额外内容显示和路由导航。

## 特性

- ✅ **灵活头像** - 支持图片URL、emoji、自定义React组件
- ✅ **内容丰富** - 支持标题、描述、额外内容显示
- ✅ **路由集成** - 与Expo Router深度集成，支持导航跳转
- ✅ **交互响应** - 支持点击事件和触摸反馈
- ✅ **响应式布局** - 自适应内容长度和屏幕尺寸
- ✅ **暗色主题** - 现代化的暗色设计风格
- ✅ **TypeScript** - 完整的TypeScript类型支持
- ✅ **高性能** - 优化的渲染性能和内存使用
- ✅ **自定义样式** - 灵活的样式配置选项
- ✅ **文本截断** - 自动处理长文本的显示

查看完整文档请切换到 README 选项卡。`;

const demos: DemoItem[] = [
  { component: <BasicDemo />, key: 'basic', title: '基础用法' },
  { component: <AvatarsDemo />, key: 'avatars', title: '头像类型' },
  { component: <NavigationDemo />, key: 'navigation', title: '导航交互' },
  { component: <AdvancedDemo />, key: 'advanced', title: '高级功能' },
];

export default function ListItemPlayground() {
  return (
    <ComponentPlayground
      demos={demos}
      readmeContent={readmeContent}
      subtitle="功能丰富的列表项组件"
      title="ListItem 组件"
    />
  );
}
