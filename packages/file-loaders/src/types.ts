// Define supported file types - consider using an enum or const assertion
export type SupportedFileType = 'pdf' | 'doc' | 'docx' | 'txt' | 'excel' | 'pptx'; // | 'pptx' | 'latex' | 'epub' | 'code' | 'markdown';

/**
 * 代表一个完整的已加载文件，包含文件级信息和其所有页面/块。
 */
export interface FileDocument {
  /**
   * 文件内容
   */
  content: string;

  /**
   * 文件创建时间戳。
   */
  createdTime: Date;

  /**
   * 文件类型或扩展名。
   */
  fileType: string;

  /**
   * 原始文件名。
   */
  filename: string;

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
    /**
     * 文档标题 (如果可用)。
     */
    title?: string;
  };

  /**
   * 文件最后修改时间戳。
   */
  modifiedTime: Date;

  /**
   * 包含文档中所有逻辑页面/块的数组。
   * 顺序通常对应文件中的自然顺序。
   */
  pages?: DocumentPage[];

  /**
   * 原始文件的完整路径。
   */
  source: string;

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
}

/**
 * 代表文件中的一个逻辑单元/页面/块。
 */
export interface DocumentPage {
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
 * 可选的文件元数据，用于覆盖从文件系统读取的信息。
 */
export interface FileMetadata {
  /**
   * 文件创建时间戳。
   */
  createdTime?: Date;
  /**
   * 文件类型或扩展名。
   */
  fileType?: string;
  /**
   * 文件名。
   */
  filename?: string;
  /**
   * 文件最后修改时间戳。
   */
  modifiedTime?: Date;
  /**
   * 文件来源标识 (例如 S3 URL 或原始路径)。
   */
  source?: string;
}

/**
 * 定义所有文件加载器类必须实现的接口。
 */
export interface FileLoaderInterface {
  /**
   * 将从 loadPages 获取的页面内容聚合成单一的字符串。
   * @param pages DocumentPage 对象的数组。
   * @returns 返回聚合后的文本内容的 Promise。
   */
  aggregateContent(pages: DocumentPage[]): Promise<string>;

  attachDocumentMetadata?(filePath: string): Promise<Record<string, any>>;

  /**
   * 根据文件路径加载文件内容，并将其分割为逻辑页面/块。
   * @param filePath 文件的完整路径。
   * @returns 返回包含 DocumentPage 对象的数组的 Promise。
   */
  loadPages(filePath: string): Promise<DocumentPage[]>;
}
