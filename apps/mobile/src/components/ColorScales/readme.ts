import { colorScales } from '@/theme';

const COLORSCALES_README = `# ColorScales 色板组件

React Native版本的色板展示组件，基于 LobeUI 的 ColorScales 组件重写。

## 功能特性

- ✅ 展示完整的颜色级别
- ✅ 支持 light/lightA/dark/darkA 四种模式
- ✅ 高亮中间色级
- ✅ 点击复制颜色值
- ✅ 透明色支持
- ✅ 垂直滚动支持（移动端优化）
- ✅ TypeScript 支持
- ✅ **新增：颜色级别 Token 自动生成**

## 基础使用

\`\`\`tsx
import { ColorScales } from '@/theme/color';
import { colorScales } from '@/theme/color';

export default () => (
  <ColorScales 
    name="primary" 
    scale={colorScales.primary} 
    midHighLight={9} 
  />
);
\`\`\`

## 颜色级别 Token 使用

现在你可以直接在组件中使用颜色级别 token：

\`\`\`tsx
import { useThemeToken } from '@/theme';

const MyComponent = () => {
  const token = useThemeToken();
  
  return (
    <View style={{
      backgroundColor: token.primary1,     // 主色级别1
      borderColor: token.red5,            // 红色级别5
      shadowColor: token.blue3A,          // 蓝色级别3透明
    }}>
      <Text style={{ color: token.gray9 }}>
        使用颜色级别 token
      </Text>
    </View>
  );
};
\`\`\`

## 可用的 Token 格式

- **基础色**: \`token.{colorName}{level}\` (例如: \`token.primary5\`)
- **透明色**: \`token.{colorName}{level}A\` (例如: \`token.red3A\`)
- **深色模式**: \`token.{colorName}{level}Dark\` (例如: \`token.blue7Dark\`)
- **深色透明**: \`token.{colorName}{level}DarkA\` (例如: \`token.green9DarkA\`)

其中：
- \`colorName\`: primary, red, blue, green, cyan, geekblue, gold, gray, lime, magenta, orange, purple, volcano, yellow
- \`level\`: 1-11

## API

### ColorScales

| 属性 | 类型 | 默认值 | 描述 |
| --- | --- | --- | --- |
| name | \`string\` | - | 色板名称 |
| scale | \`ColorScaleItem\` | - | 色板数据对象 |
| midHighLight | \`number\` | - | 高亮的中间色级索引 |

### ColorScaleItem

\`\`\`tsx
interface ColorScaleItem {
  light: string[];   // 浅色模式颜色数组
  lightA: string[];  // 浅色模式透明颜色数组
  dark: string[];    // 深色模式颜色数组
  darkA: string[];   // 深色模式透明颜色数组
}
\`\`\`

## 色板类型

组件支持四种色板模式：

- **light**: 浅色模式实色
- **lightA**: 浅色模式透明色
- **dark**: 深色模式实色  
- **darkA**: 深色模式透明色

## 交互功能

- 点击任意色块可复制对应的 token 值
- 复制格式：\`token.colorName + index + (A?) /* #hex */\`
- 支持垂直滚动查看完整色板

## 可用色板

当前支持的色板包括：
${Object.keys(colorScales)
  .map((name) => `- ${name}`)
  .join('\n')}
`;

export default COLORSCALES_README;
