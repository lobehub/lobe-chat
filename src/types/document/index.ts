/**
 * 在 LobeChat 中的文档对象
 */
export interface LobeDocument {
  /**
   * 文件内容
   */
  content: string | null;
  /**
   * 文件创建时间戳。
   */
  createdAt: Date;

  /**
   * 文件类型或扩展名
   */
  fileType: string;

  /**
   * 原始文件名。
   */
  filename: string;

  id: string;

  /**
   * 文件级别的元数据。
   * 例如从文件属性中提取的标题、作者，或整个文件加载失败时的错误。
   */
  metadata: {
    /**
     * 允许添加其他文件级别的元数据。
     */
    [key: string]: any;
    /**
     * 文档作者 (如果可用)。
     */
    author?: string;
    /**
     * 如果整个文件加载失败，记录错误信息。
     */
    error?: string;
  };

  /**
   * 包含文档中所有逻辑页面/块的数组。
   * 顺序通常对应文件中的自然顺序。
   */
  pages?: LobeDocumentPage[];

  /**
   * 原始文件的完整路径。
   */
  source: string;

  /**
   * 文档标题 (如果可用)。
   */
  title?: string;

  /**
   * 整个文档的总字符数 (所有 Page 的 charCount 之和)。
   * 需要在所有 Page 加载和计算后得出。
   */
  totalCharCount: number;

  /**
   * 整个文档的总行数 (所有 Page 的 lineCount 之和)。
   * 需要在所有 Page 加载和计算后得出。
   */
  totalLineCount: number;

  /**
   * 文件最后修改时间戳。
   */
  updatedAt: Date;
}

/**
 * 代表文件中的一个逻辑单元/页面/块。
 */
export interface LobeDocumentPage {
  /**
   * 此页/块内容的字符数。
   */
  charCount: number;

  /**
   * 此页/块内容的行数。
   */
  lineCount: number;

  /**
   * 与此页/块相关的元数据。
   */
  metadata: {
    /**
     * 允许添加其他特定于页/块的元数据。
     */
    [key: string]: any;

    /**
     * 如果原始文件单元被进一步分割成块，这是当前块的索引。
     */
    chunkIndex?: number;

    /**
     * 处理此页/块时发生的错误。
     */
    error?: string;

    /**
     * 此页/块在原始文件中的结束行号。
     */
    lineNumberEnd?: number;

    /**
     * 此页/块在原始文件中的起始行号。
     */
    lineNumberStart?: number;

    /**
     * 页码 (适用于 PDF, DOCX)。
     */
    pageNumber?: number;

    /**
     * 与此页/块相关的章节标题。
     */
    sectionTitle?: string;

    /**
     * 工作表名称 (适用于 XLSX)。
     */
    sheetName?: string;

    /**
     * 幻灯片编号 (适用于 PPTX)。
     */
    slideNumber?: number;

    /**
     * 如果原始文件单元被进一步分割成块，这是该单元的总块数。
     */
    totalChunks?: number;
  };

  /**
   * 此页/块的核心文本内容。
   */
  pageContent: string;
}

/**
 * 文档来源类型
 */
export enum DocumentSourceType {
  /**
   * 来自 API 的内容
   */
  API = 'api',

  /**
   * 本地或上传的文件
   */
  FILE = 'file',

  /**
   * 网页内容
   */
  WEB = 'web',
}
