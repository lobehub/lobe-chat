# 多图片上传组件实现计划 (V5 - URL-Only 架构)

本文档概述了一个极简、通用的多图片上传组件的最终架构。此版本采用 URL-only 设计，最大化组件的可重用性和简洁性。

## 1. 核心架构：URL-Only 设计

该组件采用最简化的外部接口，内部处理所有复杂性：

- **极简外部接口**: 组件只接受和返回字符串数组 (`string[]`)，代表图片 URL
- **最大化通用性**: 不绑定特定的数据结构，可在任何需要图片 URL 管理的场景中重用
- **后端解耦**: 后端可以从 URL 反向工程出存储路径，组件无需关心存储细节
- **内部状态管理**: 组件内部使用 `DisplayItem` 来处理上传状态，但对外完全透明

## 2. 数据模型与组件 API

### 组件属性 (最终简化版)

```typescript
export interface MultiImagesUploadProps {
  value?: string[]; // 图片 URL 数组
  onChange?: (urls: string[]) => void; // URL 变更回调
  className?: string;
  style?: React.CSSProperties;
}
```

### 内部数据模型 (仅供组件内部使用)

```typescript
// 仅在组件内部使用的临时数据结构，用于管理上传状态
interface DisplayItem {
  id: string; // 唯一标识符
  url: string; // 显示 URL (可能是 blob:URL 或远程 URL)
  file?: File; // 新选择的文件对象
  status?: FileUploadStatus; // 上传状态：'pending' | 'uploading' | 'processing' | 'success' | 'error'
  error?: string; // 错误信息
  progress?: number; // 上传进度 (0-100)
}
```

## 3. 架构优势

### 简洁性

- **单一职责**: 组件只负责 URL 的管理和展示
- **无状态**: 不维护复杂的文件元数据
- **类型安全**: 简单的字符串数组，TypeScript 友好

### 可重用性

- **场景无关**: 可用于任何需要图片 URL 管理的场景
- **存储无关**: 不绑定特定的存储服务 (S3, OSS, 本地等)
- **框架无关**: 核心逻辑可轻松移植到其他 React 项目

### 维护性

- **清晰边界**: 组件边界明确，职责单一
- **易于测试**: 简单的输入输出，便于单元测试
- **向后兼容**: 接口稳定，不易破坏性变更

## 4. 工作流程

### 空状态上传流程

1. **用户交互**: 用户点击空状态占位符
2. **文件选择**: 触发系统文件选择器
3. **即时预览**: 为选中文件创建 blob URL，立即显示预览
4. **进度显示**: 显示整体上传进度，包含已传文件数/总文件数和百分比
5. **后台上传**: 使用 `uploadWithProgress` 异步上传文件到服务器
6. **URL 替换**: 上传成功后，用服务器返回的 URL 替换 blob URL
7. **状态同步**: 调用 `onChange` 更新父组件状态
8. **自动清理**: 上传完成1秒后自动清理临时状态

### 已有图片展示流程

1. **缩略图水平布局**: 以水平一行的形式展示已上传的图片
2. **超量处理**: 超过4张时显示前3张 + 第4张带"+x" 覆盖层
3. **继续添加**: 点击任意区域可继续添加新图片

### 批量管理流程 (待实现)

1. **模态框打开**: 显示当前所有图片的缩略图
2. **批量操作**: 用户可以删除现有图片、添加新图片
3. **事务性更新**: 只有点击"完成"时才应用更改
4. **原子性提交**: 所有更改作为一个整体提交给父组件

## 5. 实际实现细节

### 进度显示设计

采用了类似占位符的简洁设计：

- **视觉一致性**: 与空状态占位符保持相同的尺寸和圆角
- **动态进度条**: 使用 CSS `::before` 伪元素创建渐变进度背景
- **信息层次**: 主要信息（文件数量）使用较大字体，次要信息（百分比）使用较小字体
- **图标变化**: 上传时使用 Upload 图标替代 Image 图标

### 集成 File Store

```typescript
// 使用 zustand file store 的 uploadWithProgress 方法
const uploadWithProgress = useFileStore((s) => s.uploadWithProgress);

// 上传配置
uploadWithProgress({
  file: item.file!,
  skipCheckFileType: true, // 跳过文件类型检查
  onStatusUpdate: (updateData) => {
    // 实时更新上传状态和进度
  },
});
```

## 6. 集成示例

### 基本使用

```typescript
const [imageUrls, setImageUrls] = useState<string[]>([]);

return (
  <MultiImagesUpload
    value={imageUrls}
    onChange={setImageUrls}
  />
);
```

### 与状态管理集成

```typescript
// 与 Zustand store 集成
const imageUrls = useGenerationConfigParam('imageUrls');
const updateImageUrls = useGenerationConfigActions().updateImageUrls;

return (
  <MultiImagesUpload
    value={imageUrls}
    onChange={updateImageUrls}
  />
);
```

### 后端集成

```typescript
// 后端可以从 URL 提取存储路径
function extractStoragePathFromUrl(url: string): string {
  // 从签名 URL 中提取 S3 key 或其他存储路径
  // 具体实现取决于 URL 格式和存储服务
}

// 保存时转换为存储路径
const storagePaths = imageUrls.map(extractStoragePathFromUrl);
```

## 7. 实现状态

### 已完成功能

- ✅ 基础组件结构
- ✅ 空状态占位符
- ✅ 文件选择逻辑
- ✅ URL-only 接口设计
- ✅ 整体上传进度显示
- ✅ 集成 file store 上传逻辑
- ✅ 内存管理和状态清理
- ✅ 图片缩略图水平布局展示

### 待实现功能

- ⏳ 批量管理模态框
- ⏳ 快速删除交互
- ⏳ 错误状态处理和重试机制

这个 URL-only 架构代表了组件设计的最终演进，在简洁性、可重用性和维护性之间达到了最佳平衡。实际实现中的进度显示和状态管理比最初设计更加精细和用户友好。
