const BLOCK_README = `# Block 块容器组件

基于 FlexBox 的灵活容器组件，支持多种样式变体、阴影效果和玻璃效果，使用 class-variance-authority 进行样式管理。

## 功能特性

- ✅ 基于 FlexBox 的灵活布局
- ✅ 多种样式变体（filled、outlined、borderless）
- ✅ 支持阴影和玻璃效果
- ✅ 可点击状态支持
- ✅ 使用 class-variance-authority 进行样式变体管理
- ✅ 完全兼容 React Native
- ✅ TypeScript 支持
- ✅ 主题适配

## 基础使用

\`\`\`tsx
import Block from '@/components/Block';

// 基础用法
<Block>
  <Text>基础 Block</Text>
</Block>

// 不同变体
<Block variant="filled">
  <Text>Filled Block</Text>
</Block>

<Block variant="outlined">
  <Text>Outlined Block</Text>
</Block>

<Block variant="borderless">
  <Text>Borderless Block</Text>
</Block>

// 带效果
<Block shadow>
  <Text>带阴影的 Block</Text>
</Block>

<Block glass>
  <Text>玻璃效果 Block</Text>
</Block>

// 可点击
<Block clickable onPress={() => console.log('clicked')}>
  <Text>可点击的 Block</Text>
</Block>

// 组合效果
<Block 
  variant="filled" 
  shadow 
  glass 
  clickable 
  onPress={() => console.log('clicked')}
>
  <Text>组合效果 Block</Text>
</Block>
\`\`\`

## API

### BlockProps

| 属性      | 类型                               | 默认值      | 说明                           |
| --------- | ---------------------------------- | ----------- | ------------------------------ |
| variant   | \`'filled' \\| 'outlined' \\| 'borderless'\` | \`'filled'\` | 样式变体                       |
| shadow    | \`boolean\`                          | \`false\`     | 是否显示阴影效果               |
| glass     | \`boolean\`                          | \`false\`     | 是否添加玻璃效果               |
| clickable | \`boolean\`                          | \`false\`     | 是否可点击（添加交互状态）     |
| children  | \`ReactNode\`                        | -           | 子元素                         |
| style     | \`StyleProp<ViewStyle>\`             | -           | 自定义样式                     |
| onPress   | \`() => void\`                       | -           | 点击回调（仅在 clickable 时） |

> Block 组件继承了 [FlexBox](./flexbox) 的所有属性，支持完整的 Flexbox 布局功能。

## 样式变体

### Filled（填充）
默认变体，带有背景色填充。

\`\`\`tsx
<Block variant="filled">
  <Text>Filled Block</Text>
</Block>
\`\`\`

### Outlined（轮廓）
透明背景，带有边框。

\`\`\`tsx
<Block variant="outlined">
  <Text>Outlined Block</Text>
</Block>
\`\`\`

### Borderless（无边框）
完全透明，无边框。

\`\`\`tsx
<Block variant="borderless">
  <Text>Borderless Block</Text>
</Block>
\`\`\`

## 效果组合

### 阴影效果
为 Block 添加阴影，增强层次感。

\`\`\`tsx
<Block shadow>
  <Text>带阴影的 Block</Text>
</Block>
\`\`\`

### 玻璃效果
添加半透明背景，营造玻璃质感。

\`\`\`tsx
<Block glass>
  <Text>玻璃效果 Block</Text>
</Block>
\`\`\`

### 可点击状态
启用点击交互，自动调整悬停状态样式。

\`\`\`tsx
<Block clickable onPress={() => console.log('clicked')}>
  <Text>可点击 Block</Text>
</Block>
\`\`\`

## CVA 样式管理

Block 组件使用自定义的 React Native CVA 来管理样式变体，CVA 配置位于 \`style.ts\` 文件中：

\`\`\`tsx
// style.ts 文件中的 CVA 配置
export const useBlockVariants = (styles) =>
  cva(styles.root, {
    variants: {
      variant: {
        filled: styles.filled,
        outlined: styles.outlined, 
        borderless: styles.borderless,
      },
      clickable: {
        false: null,
        true: styles.clickableRoot,
      },
    },
    compoundVariants: [
      {
        clickable: true,
        variant: 'filled',
        style: styles.clickableFilled,
      },
    ],
    defaultVariants: {
      variant: 'filled',
      clickable: false,
    },
  });

// 在组件中使用
const { styles } = useStyles();
const blockVariants = useBlockVariants(styles);
const variantStyles = blockVariants({ variant, clickable });
\`\`\`

### Style 文件模式优势

1. **集中管理**: 样式和变体逻辑都在 style 文件中
2. **主题集成**: 直接访问主题 token
3. **类型安全**: 完整的 TypeScript 支持
4. **易于维护**: 清晰的文件结构

## 布局应用

### 卡片容器
\`\`\`tsx
<Block variant="filled" shadow style={{ padding: 16 }}>
  <Text style={{ fontWeight: 'bold' }}>卡片标题</Text>
  <Text>卡片内容</Text>
</Block>
\`\`\`

### 交互按钮
\`\`\`tsx
<Block 
  clickable 
  variant="outlined" 
  onPress={() => handleAction()}
  style={{ padding: 12 }}
>
  <Text>操作按钮</Text>
</Block>
\`\`\`

### 分组容器
\`\`\`tsx
<Block variant="borderless" direction="column">
  <Block variant="filled" style={{ marginBottom: 8 }}>
    <Text>项目 1</Text>
  </Block>
  <Block variant="filled">
    <Text>项目 2</Text>
  </Block>
</Block>
\`\`\`
`;

export default BLOCK_README;
