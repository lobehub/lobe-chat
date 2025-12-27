---
name: createStaticStyles Migration Plan
overview: Optimize all useStyles, useTheme, and related patterns across the codebase by migrating from createStyles to createStaticStyles, replacing useTheme with useThemeMode/cssVar where appropriate, and handling all scenarios mentioned in the migration guide.
todos:
  - id: setup-lobeStaticStylish
    content: 确认 lobeStaticStylish 的导入方式（从 @lobehub/ui 导入，已在 node_modules 中确认存在）
    status: completed
  - id: batch1-pure-static
    content: '批次 1: 优化纯静态样式文件（~100 个文件）- createStyles → createStaticStyles, token → cssVar'
    status: in_progress
    dependencies:
      - setup-lobeStaticStylish
  - id: batch2-responsive-stylish
    content: '批次 2: 优化 responsive 和 stylish（~22 个文件）- responsive.mobile → responsive.sm, stylish → lobeStaticStylish'
    status: pending
    dependencies:
      - batch1-pure-static
  - id: batch3-usetheme
    content: '批次 3: 优化 useTheme（~212 个文件）- 分析并转换为 useThemeMode/cssVar 或保留'
    status: pending
    dependencies:
      - batch2-responsive-stylish
  - id: batch4-isdarkmode
    content: '批次 4: 优化 isDarkMode 条件样式（~50 个文件）- 静态样式拆分或使用 cva'
    status: pending
    dependencies:
      - batch3-usetheme
  - id: batch5-dynamic-props
    content: '批次 5: 优化动态 props 和布尔值 props（~100 个文件）- CSS 变量或静态样式拆分'
    status: pending
    dependencies:
      - batch4-isdarkmode
  - id: batch6-other-scenarios
    content: '批次 6: 其他场景（~50 个文件）- prefixCls, keyframes, rgba, readableColor 等'
    status: pending
    dependencies:
      - batch5-dynamic-props
  - id: final-type-check
    content: 最终类型检查 - 运行 pnpm run type-check 确保所有文件类型正确
    status: pending
    dependencies:
      - batch6-other-scenarios
---

# createStaticStyles 迁移优化计划

## 项目规模概览

- **463 个文件**使用 `createStyles`/`useStyles`
- **212 个文件**使用 `useTheme`
- **17 个文件**使用 `responsive.mobile`
- **5 个文件**使用 `stylish.`
- **20 个文件**使用 `rgba()`/`readableColor()`/`chroma()`/`mix()`

## 优化策略

### 阶段 1: 准备工作

1. **创建 lobeStaticStylish 导出**（如果需要）

- 检查 `src/styles/index.ts` 是否需要导出 `lobeStaticStylish`
- 如果 `@lobehub/ui` 已有导出，则直接使用 `import { lobeStaticStylish } from '@lobehub/ui'`
- 否则在 `src/styles/index.ts` 中创建并导出

2. **建立类型检查流程**

- 每个批次优化后运行 `pnpm run type-check`
- 确保类型安全

### 阶段 2: 高优先级优化（简单场景）

#### 2.1 纯静态样式（无动态 props）

- **目标文件**: 所有只使用 `token` 且无动态 props 的文件
- **转换规则**:
- `createStyles` → `createStaticStyles`
- `token.xxx` → `cssVar.xxx`
- 移除 `px` 后缀（`cssVar` 已包含单位）
- `useStyles()` → `import { styles } from './style'`
- `import { cx } from 'antd-style'`（如果需要）

#### 2.2 responsive.mobile → responsive.sm

- **目标文件**: 17 个使用 `responsive.mobile` 的文件
- **转换规则**:
- 导入 `import { responsive } from 'antd-style'`
- `responsive.mobile` → `responsive.sm`
- 从 `createStyles` 参数中移除 `responsive`

#### 2.3 stylish → lobeStaticStylish

- **目标文件**: 5 个使用 `stylish.` 的文件
- **转换规则**:
- 导入 `import { lobeStaticStylish } from '@lobehub/ui'`
- `stylish.xxx` → `lobeStaticStylish.xxx`

#### 2.4 readableColor () → token 替换

- **目标文件**: 使用 `readableColor()` 的文件
- **转换规则**:
- `readableColor(token.colorPrimary)` → `cssVar.colorTextLightSolid`
- `readableColor(token.colorTextQuaternary)` → `cssVar.colorText`

#### 2.5 rgba() → color-mix()

- **目标文件**: 使用 `rgba()` 的文件
- **转换规则**:
- `rgba(token.xxx, 0.4)` → `color-mix(in srgb, ${cssVar.xxx} 40%, transparent)`

### 阶段 3: 中优先级优化（需要转换）

#### 3.1 useTheme() → useThemeMode() / cssVar

- **目标文件**: 212 个使用 `useTheme` 的文件
- **转换规则**:
- 如果只使用 `theme.isDarkMode` → `const { isDarkMode } = useThemeMode()`
- 如果使用其他 token（颜色、尺寸等）→ `cssVar.xxx`
- 如果 token 需要用于数值计算或传给第三方库 → 保留 `useTheme()`

#### 3.2 isDarkMode → 静态样式拆分

- **目标文件**: 使用 `isDarkMode` 条件样式的文件
- **转换方式 A**（简单场景）:
- 创建 `rootDark` 和 `rootLight` 两个静态样式
- 运行时根据 `isDarkMode` 选择
- **转换方式 B**（复杂场景，推荐）:
- 使用 `cva` 将 `isDarkMode` 作为 variant prop
- 通过 `compoundVariants` 组合样式

#### 3.3 简单的动态 props → CSS 变量

- **目标文件**: 有 1-2 个数值 / 字符串类型 props 的文件
- **转换规则**:
- 样式文件中使用 CSS 变量（带默认值）
- 组件中通过 `style` prop 设置 CSS 变量
- 使用 `useMemo` 优化 CSS 变量对象

#### 3.4 布尔值 props → 静态样式拆分

- **目标文件**: 有 2-3 个布尔值 props 的文件
- **转换规则**:
- 创建所有可能的组合样式
- 运行时使用 `cx` 组合

### 阶段 4: 低优先级优化（复杂场景）

#### 4.1 prefixCls → 硬编码

- **目标文件**: 使用动态 `prefixCls` 参数的文件
- **转换规则**:
- 文件顶部硬编码 `const prefixCls = 'ant'`
- 从 `createStyles` 参数中移除 `prefixCls`

#### 4.2 keyframes → 外部定义

- **目标文件**: 使用 `keyframes` 的文件
- **转换规则**:
- 在 `createStaticStyles` 外部定义 `keyframes`
- 从 `antd-style` 导入 `keyframes`

#### 4.3 多个动态 props → CSS 变量

- **目标文件**: 有 3+ 个动态 props 的文件
- **转换规则**: 同 3.3，但需要更仔细的处理

### 阶段 5: 无法优化的场景（保留原样）

以下场景**无法优化**，需要保留 `createStyles` 或 `useTheme`:

1. **JS 计算函数**: `chroma()`, `mix()`, `calc()` 中使用 token 数值
2. **复杂的动态 props**: 需要运行时计算的复杂逻辑
3. **需要完整 theme 对象**: 传给第三方库的场景
4. **数值计算**: token 需要用于数学运算的场景

## 实施步骤

### 批次 1: 纯静态样式（\~100 个文件）

1. 扫描并识别所有纯静态样式文件
2. 批量转换：`createStyles` → `createStaticStyles`
3. 批量转换：`token.xxx` → `cssVar.xxx`
4. 批量转换：组件中的 `useStyles()` → `import { styles }`
5. 运行 `pnpm run type-check`

### 批次 2: responsive 和 stylish（\~22 个文件）

1. 转换所有 `responsive.mobile` → `responsive.sm`
2. 转换所有 `stylish.xxx` → `lobeStaticStylish.xxx`
3. 运行 `pnpm run type-check`

### 批次 3: useTheme 优化（\~212 个文件）

1. 分析每个文件的使用场景
2. 分类处理：

- 只使用 `isDarkMode` → `useThemeMode()`
- 使用 token → `cssVar`
- 需要完整 theme → 保留

3. 运行 `pnpm run type-check`

### 批次 4: isDarkMode 拆分（\~50 个文件，估算）

1. 识别使用 `isDarkMode` 的文件
2. 根据复杂度选择方式 A 或方式 B
3. 运行 `pnpm run type-check`

### 批次 5: 动态 props 和布尔值 props（\~100 个文件，估算）

1. 识别有动态 props 的文件
2. 转换为 CSS 变量或静态样式拆分
3. 运行 `pnpm run type-check`

### 批次 6: 其他场景（\~50 个文件，估算）

1. `prefixCls` 硬编码
2. `keyframes` 外部定义
3. `rgba()` → `color-mix()`
4. `readableColor()` → token 替换
5. 运行 `pnpm run type-check`

## 关键文件示例

### 简单转换示例

- [src/components/Statistic/index.tsx](src/components/Statistic/index.tsx) - `useTheme` → `cssVar`
- [src/app/\[variants\]/(main)/home/\_layout/CreateGroupModal/index.tsx](<src/app/[variants]/(main)/home/_layout/CreateGroupModal/index.tsx>) - `createStyles` → `createStaticStyles`

### 复杂转换示例

- [src/layout/AuthProvider/Clerk/useAppearance.ts](src/layout/AuthProvider/Clerk/useAppearance.ts) - `isDarkMode` + `prefixCls`
- [src/features/ShareModal/style.ts](src/features/ShareModal/style.ts) - `stylish` + `responsive` + 动态 props
- [src/layout/GlobalProvider/AppTheme.tsx](src/layout/GlobalProvider/AppTheme.tsx) - `useTheme` 用于完整 theme

## 验证检查清单

每个文件转换后检查：

- [ ] `createStyles` → `createStaticStyles`
- [ ] `token.xxx` → `cssVar.xxx`
- [ ] 移除 `px` 后缀
- [ ] `responsive.mobile` → `responsive.sm`
- [ ] `stylish.xxx` → `lobeStaticStylish.xxx`
- [ ] `rgba()` → `color-mix()`
- [ ] `readableColor()` → token 替换
- [ ] `prefixCls` → 硬编码
- [ ] `isDarkMode` → 静态样式拆分
- [ ] 动态 props → CSS 变量
- [ ] `useStyles()` → `import { styles }`
- [ ] `useTheme()` → `useThemeMode()` / `cssVar`
- [ ] 类型检查通过

## 注意事项

1. **类型安全**: 每个批次后必须运行 `pnpm run type-check`
2. **性能**: 确保转换后的代码性能不降级
3. **兼容性**: 确保视觉效果一致
4. **测试**: 关键组件需要手动验证
5. **渐进式**: 可以分批次提交，不需要一次性完成所有文件

## 预计工作量

- **批次 1**: \~100 个文件，简单转换
- **批次 2**: \~22 个文件，中等复杂度
- **批次 3**: \~212 个文件，需要仔细分析
- **批次 4**: \~50 个文件，中等复杂度
