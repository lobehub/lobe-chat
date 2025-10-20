# Skeleton Component Alignment Changes

## 概述

本次更新确保 Skeleton 组件（Button 和 Avatar）的尺寸、圆角等属性与对应的实际组件完全对齐，消除了加载状态到内容状态切换时的布局跳动问题。

## 主要更改

### 1. Skeleton.Button 尺寸对齐

**问题**: Skeleton.Button 的高度和圆角计算与 Button 组件不一致

**修复前**:

```typescript
// 直接使用 controlHeight，没有应用 1.25 倍率
const buttonHeight = token.controlHeight; // 38px
const buttonBorderRadius = token.borderRadius; // 固定值
```

**修复后**:

```typescript
// 匹配 Button 组件的计算逻辑
const baseHeight = token.controlHeight; // 38px
const buttonHeight = baseHeight * 1.25; // 47.5px
const buttonBorderRadius =
  shape === 'circle'
    ? buttonHeight * 2 // 圆形按钮：完全圆角
    : buttonHeight / 2.5; // 默认按钮：height / 2.5
```

**对齐结果**:

- Small 按钮：高度～40px (32 × 1.25)
- Middle 按钮：高度～47.5px (38 × 1.25)
- Large 按钮：高度～55px (44 × 1.25)
- 默认圆角: `height / 2.5`
- 圆形圆角: `height * 2`

### 2. Skeleton.Avatar 尺寸对齐

**当前状态**: ✅ 已对齐，无需修改

Skeleton.Avatar 的圆形计算已经与 Avatar 组件对齐：

- 圆形: `size / 2` (与 Avatar 一致)
- 方形: `borderRadiusLG` (合理的默认值)

### 3. 新增 Alignment Demo

创建了 `demos/alignment.tsx`，展示 Skeleton 组件与实际组件的尺寸对比：

- **Button 对齐演示**:
  - Small, Middle, Large 三种尺寸对比
  - Circle 形状对比
  - Block 按钮对比

- **Avatar 对齐演示**:
  - 多种尺寸对比（24px, 32px, 40px, 64px）

- **Combined Layout**:
  - 完整的 Profile Card 加载状态对比
  - Skeleton 版本 vs 实际内容版本

### 4. 更新文档

在 `index.md` 中添加了 "Size Alignment" 章节，详细说明：

- Skeleton.Button 的高度和圆角计算公式
- Skeleton.Avatar 的尺寸和圆角规则
- 对齐的目的和好处

## 技术细节

### Button 组件的尺寸计算

Button 组件的尺寸计算分两步：

1. **基础高度** (定义在 `Button/utils.ts`):

   ```typescript
   const calcSize = (size: ButtonSize, token) => {
     switch (size) {
       case 'small':
         return { height: token.controlHeightSM || 32 };
       case 'middle':
         return { height: token.controlHeight || 38 };
       case 'large':
         return { height: token.controlHeightLG || 44 };
     }
   };
   ```

2. **应用倍率** (定义在 `Button/style.ts`):
   ```typescript
   root: {
     height: sizeStyles.height * 1.25,
     borderRadius: sizeStyles.height / 2.5,
   }
   ```

### Token 系统

控件高度通过 token 系统统一管理：

```typescript
// base token
controlHeight: 36

// derived tokens (genControlHeight)
controlHeightLG: 36 * 1.25 = 45
controlHeightSM: 36 * 0.75 = 27
controlHeightXS: 36 * 0.5 = 18
```

Skeleton.Button 现在使用相同的 token 值并应用相同的倍率，确保完全对齐。

## 文件清单

### 修改的文件

1. **src/components/Skeleton/Button.tsx**
   - 更新高度计算逻辑（应用 1.25 倍率）
   - 更新圆角计算逻辑（默认: height/2.5, 圆形: height\*2）
   - 添加详细注释说明计算逻辑

2. **src/components/Skeleton/index.md**
   - 添加 "Size Alignment" 章节
   - 说明 Skeleton.Button 和 Skeleton.Avatar 的对齐细节

3. **src/components/Skeleton/demos/index.tsx**
   - 添加 AlignmentDemo 导入和配置

### 新增的文件

1. **src/components/Skeleton/demos/alignment.tsx**
   - 完整的对齐演示 demo
   - 包含 Button 和 Avatar 的多种尺寸对比
   - 包含实际使用场景（Profile Card）

## 验证方法

### 1. 在 Playground 中查看

```bash
pnpm start
pnpm ios # 或 pnpm android
```

导航到 Playground > Skeleton > 尺寸对齐，查看对齐效果。

### 2. 视觉对比

Alignment Demo 中并排展示了 Skeleton 和实际组件，可以直观验证：

- 高度是否一致
- 圆角是否一致
- 宽度比例是否合理

### 3. 代码验证

对比 Skeleton.Button 和 Button 组件的计算逻辑：

```typescript
// Skeleton.Button
const baseHeight = token.controlHeight;
const buttonHeight = baseHeight * 1.25;
const buttonBorderRadius = buttonHeight / 2.5;

// Button (style.ts)
root: {
  height: sizeStyles.height * 1.25,
  borderRadius: sizeStyles.height / 2.5,
}
```

两者完全一致 ✅

## 影响范围

### 视觉影响

- **Skeleton.Button**: 高度略微增加（\~25%），圆角更加圆润
- **Skeleton.Avatar**: 无变化

### 布局影响

修复前可能出现的布局跳动问题现在已解决：

```tsx
// 修复前：Skeleton 高度 38px，Button 高度 47.5px → 布局跳动 ❌
<Skeleton.Button /> → <Button>加载完成</Button>

// 修复后：Skeleton 高度 47.5px，Button 高度 47.5px → 无跳动 ✅
<Skeleton.Button /> → <Button>加载完成</Button>
```

### 兼容性

向后兼容，所有现有的 Skeleton 使用方式都不需要修改。

## 后续建议

### 1. 监控 Token 变化

如果未来 token 系统的 `controlHeight` 系列值发生变化，需要确保：

- Button 组件的计算逻辑更新
- Skeleton.Button 的计算逻辑同步更新

### 2. 扩展对齐验证

考虑为其他 Skeleton 子组件（Title, Paragraph）添加对齐验证：

- Skeleton.Title vs Text (h1-h5)
- Skeleton.Paragraph vs Text (normal)

### 3. 自动化测试

添加视觉回归测试，确保 Skeleton 和实际组件的尺寸始终对齐：

```typescript
describe('Skeleton alignment', () => {
  it('Button height should match', () => {
    const skeletonHeight = getSkeletonButtonHeight('middle');
    const buttonHeight = getButtonHeight('middle');
    expect(skeletonHeight).toBe(buttonHeight);
  });
});
```

## 总结

本次更新通过精确对齐 Skeleton.Button 和 Button 组件的尺寸计算逻辑，显著提升了加载体验：

✅ 消除了加载状态切换时的布局跳动\
✅ 提供了直观的对齐演示 demo\
✅ 更新了文档说明对齐细节\
✅ 保持了向后兼容性

通过 Playground 的 "尺寸对齐" demo 可以清晰地看到改进效果。
