# 移动端 ModelSwitch 组件重构设计文档

## 📋 文档摘要

本文档描述了移动端 ModelSwitch 组件的重构方案，目标是完全对齐 Web 端 `src/features/ModelSwitchPanel/index.tsx` 的实现逻辑，仅在 UI 层面适配移动端的 Modal 交互模式。

### 🎯 重构目标

- **数据逻辑 100% 对齐**：复用 Web 端的 useAgentStore + useEnabledChatModels + getModelItems 逻辑
- **UI 组件统一命名**：ModelItemRender、ProviderItemRender、ModelInfoTags 保持与 Web 端一致
- **交互适配移动端**：ActionDropdown → Modal，Touch 友好的按钮尺寸

### 🔧 核心改动

- **文件结构重构**：从通用组件位置移至业务组件位置，遵循 RN 业务组件组织规范
- **ModelSwitchButton**：简化为只显示 ModelIcon
- **ModelSelectModal**：使用分组显示，完全对齐 Web 端菜单构建逻辑
- **新增组件**：ModelItemRender、ProviderItemRender、ModelInfoTags (使用移动端 Tag)
- **引用方式调整**：ChatInput 改为相对路径引用，移除通用组件导出

---

## 1. 项目概述

### 1.1 目标

完全参考 Web 端实现逻辑，将移动端的模型选择组件与 Web 端保持一致，仅在 UI 层面适配移动端的 Modal 交互模式。

### 1.2 核心原则

- **数据逻辑 100% 对齐**：复用 Web 端的所有业务逻辑
- **UI 适配移动端**：保持 Modal 交互，但显示内容与 Web 端一致
- **代码复用最大化**：尽可能复用 Web 端的工具函数和组件逻辑

## 2. 现状分析

### 2.1 Web 端实现（参考标准）

```tsx
// Web端核心组件：src/features/ModelSwitchPanel/index.tsx
- ModelSwitchPanel: 使用 ActionDropdown + Menu 的实现
- 数据源: useAgentStore + useEnabledChatModels
- 菜单构建: useMemo 构建分组菜单项
- 模型项: ModelItemRender 组件渲染
- 分组头: ProviderItemRender 组件渲染
- 选中状态: activeKey = menuKey(provider, model)
- 空状态: emptyProvider/emptyModel 引导跳转设置
```

### 2.2 移动端现状（待重构）

```tsx
// 移动端当前问题
- 🚨 文件位置错误：放在通用组件位置 src/components/ModelSwitch/
- 🚨 引用方式错误：ChatInput通过 @/components 引用，应该用相对路径
- 🚨 文件组织不规范：未遵循RN业务组件的 index.tsx + styles.ts 模式
- 🚨 冗余文件：包含UIFixDemo.tsx、KeyDebugDemo.tsx等调试文件
- 硬编码模型名称转换逻辑
- 未使用模型图标
- 显示信息不统一
- Linter错误
```

## 3. 文件结构重构

### 3.1 当前文件结构问题

```
❌ 当前错误结构：
apps/mobile/src/components/ModelSwitch/    # 通用组件位置，但ModelSwitch是业务组件
├── ModelSwitchButton.tsx
├── ModelSelectModal.tsx
├── ModelSwitch.tsx
├── UIFixDemo.tsx                          # 调试文件，应删除
├── KeyDebugDemo.tsx                       # 调试文件，应删除
└── index.ts

引用方式：
// ChatInput/index.tsx
import { ModelSwitch } from '@/components';  # 错误：当作通用组件引用
```

### 3.2 RN 业务组件组织规范

```
参考现有业务组件：apps/mobile/app/(main)/chat/(components)/ChatInput/(components)/

IconBtn/                    # 业务组件示例
├── index.tsx              # 主入口，使用memo + displayName
└── styles.ts              # 样式文件，使用createStyles + useStyles

引用方式：
// ChatInput/index.tsx
import IconBtn from './(components)/IconBtn';  # 正确：相对路径引用
```

### 3.3 正确的文件结构设计

```
✅ 重构后正确结构：
apps/mobile/app/(main)/chat/(components)/ChatInput/(components)/ModelSwitch/
├── index.tsx                              # 导出ModelSwitch主组件
├── styles.ts                              # ModelSwitch样式
├── ModelSwitchButton/
│   ├── index.tsx                          # ModelSwitchButton组件
│   └── styles.ts                          # 按钮样式
├── ModelSelectModal/
│   ├── index.tsx                          # 模态框组件
│   └── styles.ts                          # 模态框样式
└── components/                            # 内部组件
    ├── ModelItemRender/
    │   ├── index.tsx
    │   └── styles.ts
    ├── ProviderItemRender/
    │   ├── index.tsx
    │   └── styles.ts
    └── ModelInfoTags/
        ├── index.tsx
        └── styles.ts

引用方式：
// ChatInput/index.tsx
import ModelSwitch from './(components)/ModelSwitch';  # 正确：相对路径引用

移除通用组件导出：
// src/components/index.ts
// 删除：export { ModelSwitch, ModelSwitchButton, ModelSelectModal } from './ModelSwitch';
```

### 3.4 文件组织规范要求

```tsx
// 每个组件都遵循统一模式：

// 1. index.tsx 主文件模式
import React, { memo } from 'react';
import { useStyles } from './styles';

interface ComponentProps {
  // props定义
}

const Component = memo<ComponentProps>((props) => {
  const { styles } = useStyles();
  // 组件实现
});

Component.displayName = 'Component';
export default Component;

// 2. styles.ts 样式文件模式
import { createStyles } from '@/theme';

export const useStyles = createStyles((token) => ({
  // 样式定义
}));
```

## 4. 架构设计

### 4.1 组件层次结构

```
ModelSwitch (容器组件)
├── ModelSwitchButton (触发器)
│   └── ModelIcon (来自 @lobehub/icons-rn)
└── ModelSelectModal (选择器)
    ├── Header (标题 + 关闭按钮)
    ├── ScrollView
    │   └── ProviderGroup[] (按提供商分组)
    │       ├── ProviderHeader (ProviderIcon + name)
    │       └── ModelItem[] (ModelIcon + displayName + tags + 选中状态)
    └── Footer (可选)
```

### 4.2 数据流设计（完全对齐 Web 端 ModelSwitchPanel）

```tsx
// 数据获取层
const [model, provider, updateAgentConfig] = useAgentStore((s) => [
  agentSelectors.currentAgentModel(s),
  agentSelectors.currentAgentModelProvider(s),
  s.updateAgentConfig,
]);
const enabledList = useEnabledChatModels();

// 菜单构建逻辑（与Web端一致）
const items = useMemo(() => {
  // 1. 无提供商 → emptyProvider状态
  if (enabledList.length === 0) return EmptyProviderState;

  // 2. 有提供商 → 按provider分组
  return enabledList.map((provider) => ({
    provider,
    models: getModelItems(provider), // 每个模型使用ModelItemRender
  }));
}, [enabledList]);

// 模型选择逻辑
const handleModelSelect = async (modelId: string, providerId: string) => {
  await updateAgentConfig({ model: modelId, provider: providerId });
};

// 当前选中状态
const currentKey = menuKey(provider, model); // provider-model格式
```

## 5. 组件重构规范

### 5.1 ModelSwitchButton 重构要求

#### 5.1.1 显示元素（与 Web 端对齐）

```tsx
// 简化布局结构 - 只显示模型图标
<TouchableOpacity>
  <ModelIcon model={currentModel} size={20} />
</TouchableOpacity>
```

#### 5.1.2 数据获取逻辑

```tsx
// 移除硬编码，使用统一数据源
const { currentModel, currentProvider } = useCurrentAgent();

// 直接使用currentModel传递给ModelIcon
<ModelIcon model={currentModel} size={20} />;
```

### 5.2 ModelSelectModal 重构要求

#### 5.2.1 完全对齐 Web 端 ModelSwitchPanel 逻辑

```tsx
// 数据获取（与Web端完全一致）
const [model, provider, updateAgentConfig] = useAgentStore((s) => [
  agentSelectors.currentAgentModel(s),
  agentSelectors.currentAgentModelProvider(s),
  s.updateAgentConfig,
]);
const enabledList = useEnabledChatModels();

// 菜单构建逻辑（复制Web端的getModelItems函数）
const getModelItems = (provider: EnabledProviderWithModels) => {
  const items = provider.children.map((model) => ({
    key: menuKey(provider.id, model.id),
    model,
    onPress: async () => {
      await updateAgentConfig({ model: model.id, provider: provider.id });
      onClose(); // 移动端特有：选择后关闭Modal
    },
  }));

  // 空模型状态处理
  if (items.length === 0) {
    return [
      {
        key: `${provider.id}-empty`,
        isEmpty: true,
        onPress: () => router.push(`/settings/provider/${provider.id}`),
      },
    ];
  }

  return items;
};

// 分组逻辑（与Web端一致）
const items = useMemo(() => {
  // 1. 无提供商状态
  if (enabledList.length === 0) {
    return [
      {
        key: 'no-provider',
        isEmpty: true,
        onPress: () => router.push('/settings/provider'),
      },
    ];
  }

  // 2. 按提供商分组（即使只有一个也分组显示）
  return enabledList.map((provider) => ({
    key: provider.id,
    provider,
    models: getModelItems(provider),
  }));
}, [enabledList]);
```

#### 5.2.2 模型项渲染（完全对齐 Web 端 ModelItemRender）

```tsx
// ModelItemRender - 完全对齐 src/components/ModelSelect/ModelItemRender
interface ModelItemRenderProps extends ChatModelCard {
  showInfoTag?: boolean;
  isSelected?: boolean;
  onPress?: () => void;
}

const ModelItemRender = memo<ModelItemRenderProps>(
  ({ showInfoTag = true, isSelected, onPress, ...model }) => {
    return (
      <TouchableOpacity onPress={onPress} style={styles.modelItem}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 16,
            paddingVertical: 12,
          }}
        >
          {/* 左侧：图标 + 名称（与Web端完全一致） */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              flex: 1,
              minWidth: 0, // 确保文字截断
            }}
          >
            <ModelIcon model={model.id} size={20} />
            <Text style={{ flex: 1 }} numberOfLines={1}>
              {model.displayName || model.id}
            </Text>
          </View>

          {/* 右侧：能力标签 + 选中状态 */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            {showInfoTag && <ModelInfoTags {...model} />}
            {isSelected && <Check size={16} color="primary" />}
          </View>
        </View>
      </TouchableOpacity>
    );
  },
);

// 提供商头部渲染（对齐Web端ProviderItemRender）
interface ProviderItemRenderProps {
  provider: EnabledProviderWithModels;
  showSettings?: boolean;
  onSettingsPress?: () => void;
}

const ProviderItemRender = memo<ProviderItemRenderProps>(
  ({ provider, showSettings = false, onSettingsPress }) => {
    return (
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingVertical: 8,
          backgroundColor: token.colorFillTertiary,
        }}
      >
        {/* 左侧：提供商信息（与Web端ProviderItemRender一致） */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          {provider.source === 'custom' && provider.logo ? (
            <Image source={{ uri: provider.logo }} style={{ width: 20, height: 20 }} />
          ) : (
            <ProviderIcon provider={provider.id} size={20} type="mono" />
          )}
          <Text style={{ fontWeight: '500' }}>{provider.name}</Text>
        </View>

        {/* 右侧：设置按钮（对齐Web端） */}
        {showSettings && (
          <TouchableOpacity onPress={onSettingsPress}>
            <Settings size={16} />
          </TouchableOpacity>
        )}
      </View>
    );
  },
);
```

### 5.3 新增组件规范

#### 5.3.1 ModelInfoTags（使用移动端 Tag 组件）

```tsx
// 使用移动端Tag组件实现能力标签，对齐Web端ModelInfoTags功能
import { Tag } from '@/components/Tag';

interface ModelInfoTagsProps extends ModelAbilities {
  contextWindowTokens?: number | null;
}

const ModelInfoTags = memo<ModelInfoTagsProps>(
  ({ files, vision, functionCall, reasoning, search, imageOutput, contextWindowTokens }) => {
    const { t } = useTranslation('components');

    return (
      <View style={{ flexDirection: 'row', gap: 4, flexWrap: 'wrap' }}>
        {files && <Tag textStyle={{ fontSize: 10 }}>📎</Tag>}
        {imageOutput && <Tag textStyle={{ fontSize: 10 }}>🖼️</Tag>}
        {vision && <Tag textStyle={{ fontSize: 10 }}>👁</Tag>}
        {functionCall && <Tag textStyle={{ fontSize: 10 }}>🧩</Tag>}
        {reasoning && <Tag textStyle={{ fontSize: 10 }}>⚛️</Tag>}
        {search && <Tag textStyle={{ fontSize: 10 }}>🌐</Tag>}
        {typeof contextWindowTokens === 'number' && (
          <Tag textStyle={{ fontSize: 10 }}>
            {contextWindowTokens === 0 ? '∞' : formatTokenNumber(contextWindowTokens)}
          </Tag>
        )}
      </View>
    );
  },
);

// 可选：更简洁的版本，只显示图标
const ModelInfoTagsSimple = memo<ModelInfoTagsProps>(
  ({ files, vision, functionCall, reasoning }) => {
    const icons = [];

    if (files) icons.push('📎');
    if (vision) icons.push('👁');
    if (functionCall) icons.push('🧩');
    if (reasoning) icons.push('⚛️');

    return icons.length > 0 ? (
      <Text style={{ fontSize: 11, color: token.colorTextSecondary }}>{icons.join(' ')}</Text>
    ) : null;
  },
);
```

## 6. 技术实现细节

### 6.1 依赖库确认

- ✅ `@lobehub/icons-rn`: 已安装，使用方法与 Web 端一致
- ✅ `lucide-react-native`: 用于 Check、ArrowRight、Settings 等图标
- ✅ 现有 hooks: `useCurrentAgent`, `useEnabledChatModels`
- ✅ 移动端组件: `Tag` (位于 `@/components/Tag`)
- ✅ 主题系统: `useThemeToken` 保持主题一致性

### 6.2 样式系统

```tsx
// 使用 useThemeToken 保持主题一致性
const token = useThemeToken();

const styles = {
  button: {
    backgroundColor: token.colorBgContainer,
    borderColor: token.colorBorder,
    borderRadius: token.borderRadius,
    // ...
  },
  // ...
};
```

### 6.3 空状态处理（完全对齐 Web 端）

```tsx
// 无提供商状态（对齐Web端emptyProvider逻辑）
const EmptyProviderState = () => (
  <TouchableOpacity
    style={{ padding: 24, alignItems: 'center' }}
    onPress={() => router.push('/settings/provider')}
  >
    <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
      <Text style={{ color: token.colorTextTertiary }}>{t('ModelSwitchPanel.emptyProvider')}</Text>
      <ArrowRight size={16} color={token.colorTextTertiary} />
    </View>
  </TouchableOpacity>
);

// 提供商无模型状态（对齐Web端emptyModel逻辑）
const EmptyModelState = ({ providerId }: { providerId: string }) => (
  <TouchableOpacity
    style={{ padding: 16, alignItems: 'center' }}
    onPress={() => router.push(`/settings/provider/${providerId}`)}
  >
    <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
      <Text style={{ color: token.colorTextTertiary }}>{t('ModelSwitchPanel.emptyModel')}</Text>
      <ArrowRight size={16} color={token.colorTextTertiary} />
    </View>
  </TouchableOpacity>
);
```

## 7. 分阶段实施计划

### 7.1 Phase 0: 文件结构重构（1 天）

- [ ] 🚨 **移动文件位置**：从 `src/components/ModelSwitch/` → `app/(main)/chat/(components)/ChatInput/(components)/ModelSwitch/`
- [ ] 🚨 **调整引用方式**：ChatInput 改为相对路径引用 `import ModelSwitch from './(components)/ModelSwitch';`
- [ ] 🚨 **移除通用组件导出**：从 `src/components/index.ts` 删除 ModelSwitch 相关导出
- [ ] 🚨 **重组文件结构**：按照 RN 业务组件规范创建 `index.tsx + styles.ts` 结构
- [ ] 🚨 **清理冗余文件**：删除 UIFixDemo.tsx、KeyDebugDemo.tsx 等调试文件

### 7.2 Phase 1: 基础重构（1-2 天）

- [ ] 修复 ModelSwitchButton 的 Linter 错误
- [ ] 移除硬编码的名称转换逻辑
- [ ] 简化为只显示 ModelIcon
- [ ] 移除未使用的参数和函数
- [ ] 应用 RN 业务组件规范（memo + displayName + useStyles）

### 7.3 Phase 2: 深度对齐（2-3 天）

- [ ] 创建 ModelItemRender 组件（移动端版本，完全对齐 Web 端）
- [ ] 创建 ProviderItemRender 组件（移动端版本，完全对齐 Web 端）
- [ ] 重构 ModelSelectModal 使用分组显示
- [ ] 实现选中状态显示
- [ ] 使用 menuKey (provider, model) 标识选中项

### 7.4 Phase 3: 完善优化（1-2 天）

- [ ] 实现 ModelInfoTags 组件（使用移动端 Tag）
- [ ] 实现空状态处理（emptyProvider/emptyModel）
- [ ] 优化交互动画和 Touch 友好的按钮尺寸
- [ ] 添加单元测试

### 7.5 Phase 4: 质量保证（1 天）

- [ ] 与 Web 端功能对比测试
- [ ] 性能优化
- [ ] 代码 review
- [ ] 文档更新

## 8. 风险评估与解决方案

### 8.1 潜在风险

| 风险                    | 影响 | 解决方案                               |
| ----------------------- | ---- | -------------------------------------- |
| 🚨 文件移动破坏现有引用 | 高   | Phase 0 优先处理，确保所有引用路径正确 |
| 🚨 RN 组件规范不熟悉    | 中   | 参考 IconBtn 等现有组件，严格遵循规范  |
| 图标库兼容性            | 中   | 已确认 @lobehub/icons-rn 可用          |
| 性能问题                | 低   | 使用 memo 优化，分页加载               |
| 主题适配                | 低   | 统一使用 useThemeToken                 |
| 数据结构差异            | 中   | 严格对齐 Web 端数据结构                |

### 8.2 备选方案

- 如果图标显示有问题，可以暂时使用文字缩写
- 如果性能有问题，可以实现虚拟滚动
- 如果分组显示复杂，可以先实现扁平列表

## 9. 验收标准

### 9.1 功能对齐

- [ ] 🚨 **文件结构正确**：组件位于 `app/(main)/chat/(components)/ChatInput/(components)/ModelSwitch/`
- [ ] 🚨 **引用方式正确**：ChatInput 使用相对路径 `import ModelSwitch from './(components)/ModelSwitch';`
- [ ] 🚨 **文件组织规范**：每个组件都有 `index.tsx + styles.ts` 结构
- [ ] 🚨 **移除通用组件导出**：`src/components/index.ts` 不再导出 ModelSwitch
- [ ] ModelSwitchButton 只显示 ModelIcon，与 Web 端 ModelSwitchPanel 的 children 一致
- [ ] 数据获取逻辑与 Web 端 ModelSwitchPanel 100% 一致（useAgentStore + useEnabledChatModels）
- [ ] 菜单构建逻辑与 Web 端 getModelItems 函数完全一致
- [ ] ModelItemRender 显示与 Web 端完全一致（displayName || id + ModelIcon + ModelInfoTags）
- [ ] ProviderItemRender 显示与 Web 端完全一致（ProviderIcon + name）
- [ ] ModelInfoTags 使用移动端 Tag 组件实现，功能对齐 Web 端
- [ ] 分组逻辑与 Web 端一致（按 provider 分组，即使只有一个也分组）
- [ ] 选中状态使用 menuKey (provider, model) 标识
- [ ] 选择行为调用 updateAgentConfig ({model, provider})
- [ ] 空状态处理与 Web 端一致（emptyProvider/emptyModel + 跳转设置）

### 9.2 代码质量

- [ ] 无 Linter 错误
- [ ] 组件可复用性强
- [ ] 类型定义完整
- [ ] 测试覆盖率 >80%

### 9.3 用户体验

- [ ] 交互流畅，无卡顿
- [ ] 视觉效果与设计稿一致
- [ ] 错误处理友好
- [ ] 加载状态合理

## 10. 更新记录

- **2024-01-XX**: 初版文档创建（错误参考了 ModelSelect）
- **2024-01-XX**: 重新对齐 Web 端 ModelSwitchPanel 实现
  - 修正数据获取逻辑（useAgentStore + useEnabledChatModels）
  - 修正菜单构建逻辑（getModelItems 函数）
  - 修正分组显示逻辑（按 provider 分组）
  - 修正空状态处理（emptyProvider/emptyModel）
- **2024-01-XX**: 简化 ModelSwitchButton 显示元素，只保留 ModelIcon
- **2024-01-XX**: 统一组件命名，去除 RN 前缀
  - ModelItemRender、ProviderItemRender 与 Web 端保持一致命名
  - ModelInfoTags 使用移动端 Tag 组件实现
  - 添加文档摘要和完整的技术细节
  - 完善验收标准和实施计划
- **2024-01-XX**: 🚨 **文件结构重构** - 修正组件位置和组织规范
  - 识别文件位置错误：ModelSwitch 应为业务组件，不是通用组件
  - 规划正确位置：`app/(main)/chat/(components)/ChatInput/(components)/ModelSwitch/`
  - 遵循 RN 业务组件规范：`index.tsx + styles.ts` 文件结构
  - 调整引用方式：ChatInput 改为相对路径引用
  - 新增 Phase 0 专门处理文件结构重构

## 11. 核心差异总结

| 方面 | Web 端 (ModelSwitchPanel) | 移动端 (重构后) |
| --- | --- | --- |
| 文件位置 | `src/features/ModelSwitchPanel/` | `app/(main)/chat/(components)/ChatInput/(components)/ModelSwitch/` |
| 组件类型 | Feature 组件 | 业务组件 |
| 文件结构 | 单文件 `index.tsx` | `index.tsx + styles.ts` 规范 |
| 引用方式 | 模块导入 | 相对路径引用 |
| 容器 | ActionDropdown + Menu | Modal + ScrollView |
| 触发器 | children (任意内容) | ModelIcon |
| 数据获取 | useAgentStore + useEnabledChatModels | ✅ 完全一致 |
| 菜单构建 | getModelItems + useMemo | ✅ 完全一致 |
| 模型项 | ModelItemRender | ModelItemRender (对齐) |
| 分组头 | ProviderItemRender | ProviderItemRender (对齐) |
| 能力标签 | ModelInfoTags (antd Tag) | ModelInfoTags (移动端 Tag) |
| 选中标识 | activeKey: menuKey(provider, model) | ✅ 完全一致 |
| 选择行为 | updateAgentConfig({ model, provider }) | ✅ 完全一致 |
| 空状态 | emptyProvider/emptyModel + 跳转 | ✅ 完全一致 |
| 交互方式 | Hover + Click | Touch 友好的按钮尺寸 |

---

**注：此文档已完全对齐 Web 端实现，等待确认后开始开发。**
