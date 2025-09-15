const SLIDER_README = `# Slider 滑动输入条组件

React Native 版本的滑动输入条组件，支持自定义范围、步长和流畅的手势交互。

## 功能特性

- ✅ 流畅的拖拽手势交互
- ✅ 自定义最小值、最大值和步长
- ✅ 刻度标记支持（marks）
- ✅ 仅刻度模式（step=null）
- ✅ 受控和非受控模式
- ✅ 完整的无障碍支持
- ✅ 自定义样式（轨道和滑块）
- ✅ 禁用状态支持
- ✅ TypeScript 支持
- ✅ 主题适配（深色/浅色模式）

## 基础使用

\`\`\`tsx
import Slider from '@/components/Slider';

// 基础用法
<Slider
  value={value}
  onChange={setValue}
  min={0}
  max={100}
  step={1}
/>

// 自定义范围和步长
<Slider
  value={price}
  onChange={setPrice}
  min={100}
  max={2000}
  step={50}
/>

// 非受控模式
<Slider
  defaultValue={30}
  onChange={(value) => console.log('value:', value)}
  min={0}
  max={100}
  step={5}
/>

// 禁用状态
<Slider
  value={value}
  onChange={setValue}
  disabled
  min={0}
  max={100}
/>

// 自定义样式
<Slider
  value={value}
  onChange={setValue}
  trackStyle={{ backgroundColor: '#ff6b35' }}
  thumbStyle={{ backgroundColor: '#4ecdc4' }}
/>

// 刻度标记
<Slider
  value={value}
  onChange={setValue}
  min={0}
  max={100}
  marks={{
    0: '0%',
    25: '25%', 
    50: '50%',
    75: '75%',
    100: '100%'
  }}
/>

// 仅刻度模式（只能选择标记的值）
<Slider
  value={level}
  onChange={setLevel}
  step={null}
  marks={{
    0: '低',
    1: '中',
    2: '高',
    3: '极高'
  }}
/>
\`\`\`

## API

### SliderProps

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| value | \`number\` | - | 当前值（受控模式） |
| defaultValue | \`number\` | \`min\` | 默认值（非受控模式） |
| min | \`number\` | \`0\` | 最小值 |
| max | \`number\` | \`100\` | 最大值 |
| step | \`number \\| null\` | \`1\` | 步长，设为 null 时使用仅刻度模式 |
| disabled | \`boolean\` | \`false\` | 是否禁用 |
| marks | \`Record<number, ReactNode \\| {label: ReactNode, style?: ViewStyle}>\` | - | 刻度标记 |
| onChange | \`(value: number) => void\` | - | 值改变时的回调 |
| onChangeComplete | \`(value: number) => void\` | - | 拖拽结束时的回调 |
| style | \`ViewStyle\` | - | 容器样式 |
| trackStyle | \`ViewStyle\` | - | 轨道样式 |
| thumbStyle | \`ViewStyle\` | - | 滑块样式 |
| accessibilityLabel | \`string\` | - | 无障碍标签 |
| accessibilityHint | \`string\` | - | 无障碍提示 |

## 使用场景

### 数值输入
- 音量控制
- 亮度调节
- 价格范围选择
- 温度设定

### 进度控制
- 播放进度
- 下载进度
- 任务完成度

### 参数调节
- 字体大小
- 缩放比例
- 透明度设置

## 无障碍支持

组件提供完整的无障碍功能支持：

- \`accessibilityRole="adjustable"\` 标识为可调节组件
- \`accessibilityValue\` 提供当前值和范围信息
- 支持屏幕阅读器
- 支持自定义无障碍标签和提示

## 手势交互

- 使用 react-native-gesture-handler 提供流畅的拖拽体验
- 支持精确的位置计算和边界限制
- 实时反馈和平滑动画
- 自动吸附到步长值

## 主题适配

组件使用项目的主题系统，自动适配：
- 深色/浅色模式
- 禁用状态颜色
- 品牌色彩方案
- 一致的设计规范
`;

export default SLIDER_README;
