# DocxLoader 优化总结

## 优化内容

### 1. 目录提取功能

- **自动识别标题结构**：通过解析 HTML 结构，自动识别 h1-h6 标题
- **生成完整目录**：提取所有章节标题及其层级信息
- **目录存储**：目录信息保存在第一页的 `metadata.tableOfContents` 中

### 2. 按页分割功能

- **智能分页**：基于逻辑段落和章节边界进行分页
- **分页参数**：
  - 每页最大行数：50 行
  - 每页最大字符数：2000 字符
- **章节优先**：在章节边界处优先分页，保持章节完整性

### 3. 增强元数据

- **章节信息**：
  - `sectionTitle`：当前页面所属章节标题
  - `sectionLevel`：章节层级（1-6）
- **位置信息**：
  - `lineNumberStart`：页面起始行号
  - `lineNumberEnd`：页面结束行号
  - `pageNumber`：逻辑页码
- **目录信息**：
  - `tableOfContents`：完整的目录结构（仅第一页）

## 技术实现

### 核心方法

1. **HTML 结构解析**
   - 使用 `mammoth.convertToHtml()` 将 DOCX 转换为 HTML
   - 解析 HTML 标签提取标题和内容结构

2. **章节识别**
   - 通过正则表达式匹配 h1-h6 标签
   - 构建章节树结构，包含层级关系和内容范围

3. **智能分页算法**
   - 按行遍历文档内容
   - 在章节边界和长度限制处进行分页
   - 确保章节内容不被分割

### 数据结构

```typescript
interface DocumentSection {
  title: string;
  level: number;
  content: string;
  startLine: number;
  endLine?: number;
  children: DocumentSection[];
}

interface LogicalPage {
  content: string;
  sectionTitle?: string;
  sectionLevel?: number;
  pageNumber: number;
  lineNumberStart: number;
  lineNumberEnd: number;
}
```

## 使用示例

```typescript
import { DocxLoader } from './src/loaders/docx';

const loader = new DocxLoader();
const pages = await loader.loadPages('/path/to/document.docx');

// 获取目录
const toc = pages[0].metadata.tableOfContents;
console.log('文档目录:', toc);

// 遍历页面
pages.forEach((page) => {
  console.log(`第 ${page.metadata.pageNumber} 页:`);
  console.log(`  章节: ${page.metadata.sectionTitle || '无'}`);
  console.log(`  行数: ${page.lineCount}`);
  console.log(`  字符数: ${page.charCount}`);
});
```

## 输出示例

```javascript
{
  charCount: 150,
  lineCount: 10,
  metadata: {
    pageNumber: 1,
    lineNumberStart: 1,
    lineNumberEnd: 10,
    sectionTitle: "第一章 引言",
    sectionLevel: 1,
    tableOfContents: [
      { title: "第一章 引言", level: 1 },
      { title: "1.1 背景", level: 2 },
      { title: "1.1.1 详细说明", level: 3 },
      { title: "第二章 方法", level: 1 }
    ]
  },
  pageContent: "第一章 引言\n这是引言的内容..."
}
```

## 优势

1. **结构化信息**：不仅仅是纯文本，还能提取文档的层次结构
2. **智能分页**：保持语义完整性，避免在重要位置断页
3. **丰富元数据**：为后续处理（如搜索、分析）提供更多上下文
4. **向后兼容**：保持原有 API 不变，现有代码无需修改
5. **错误处理**：完善的错误处理机制，确保稳定性

## 测试验证

- ✅ 所有现有测试通过
- ✅ 新增功能测试覆盖
- ✅ TypeScript 编译通过
- ✅ 错误处理测试通过

## 后续优化建议

1. **性能优化**：对于大型文档，可以考虑流式处理
2. **样式识别**：除了标题，还可以识别其他样式（如加粗、斜体）
3. **图片提取**：支持提取文档中的图片和表格
4. **多语言支持**：优化对多语言文档的处理
