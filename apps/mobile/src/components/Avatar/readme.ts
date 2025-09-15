const README = `# Avatar 头像组件

可定制的头像组件，支持自定义尺寸、边框和错误处理。

## 功能特性

- ✅ 支持网络图片和本地图片
- ✅ 自定义尺寸
- ✅ 边框样式定制
- ✅ 图片加载错误处理
- ✅ TypeScript 支持
- ✅ 主题适配

## 基础使用

\`\`\`tsx
import Avatar from '@/components/Avatar';

// 基础用法
<Avatar 
  avatar="https://github.com/lobehub.png" 
  alt="LobeHub" 
/>

// 自定义尺寸
<Avatar 
  avatar="https://github.com/lobehub.png" 
  alt="LobeHub" 
  size={48}
/>

// 添加边框
<Avatar 
  avatar="https://github.com/lobehub.png" 
  alt="LobeHub" 
  size={48}
  borderColor="#1677ff"
  borderWidth={2}
/>
\`\`\`

## API

### AvatarProps

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| avatar | \`string\` | - | 头像图片URL |
| alt | \`string\` | - | 图片描述文本 |
| size | \`number\` | \`40\` | 头像尺寸 |
| borderColor | \`string\` | - | 边框颜色 |
| borderWidth | \`number\` | - | 边框宽度 |
| style | \`ViewStyle\` | - | 容器样式 |
`;

export default README;
