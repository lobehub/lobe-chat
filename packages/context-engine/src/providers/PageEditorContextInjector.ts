import debug from 'debug';

import { BaseLastUserContentProvider } from '../base/BaseLastUserContentProvider';
import type { PipelineContext, ProcessorOptions } from '../types';

const log = debug('context-engine:provider:PageEditorContextInjector');

/**
 * Escape XML special characters
 */
const escapeXml = (str: string): string => {
  return str
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
};

/**
 * Generate path-based node ID
 */
const generateNodeId = (path: number[]): string => {
  return `node_${path.join('_')}`;
};

/**
 * Convert Lexical JSON format to XML format with node IDs
 * @param node - The Lexical node to convert
 * @param depth - Current depth in the tree (for indentation)
 * @param path - Path to this node (array of indices from root)
 */
const convertLexicalToXml = (node: any, depth = 0, path: number[] = []): string => {
  if (!node) return '';

  const indent = '  '.repeat(depth);

  // Handle text nodes
  if (node.type === 'text') {
    const nodeId = generateNodeId(path);
    const text = escapeXml(node.text || '');
    return `${indent}<span id="${nodeId}">${text}</span>`;
  }

  // Handle root node
  if (node.type === 'root') {
    const children =
      node.children
        ?.map((child: any, index: number) => convertLexicalToXml(child, depth, [index]))
        .join('\n') || '';
    return `<root>\n${children}\n</root>`;
  }

  // Handle heading nodes
  if (node.type === 'heading') {
    const nodeId = generateNodeId(path);
    const tag = node.tag || 'h1';
    const children =
      node.children
        ?.map((child: any, index: number) =>
          convertLexicalToXml(child, depth + 1, [...path, index]),
        )
        .join('\n') || '';
    return `${indent}<${tag} id="${nodeId}">\n${children}\n${indent}</${tag}>`;
  }

  // Handle paragraph nodes
  if (node.type === 'paragraph') {
    const nodeId = generateNodeId(path);
    const children =
      node.children
        ?.map((child: any, index: number) =>
          convertLexicalToXml(child, depth + 1, [...path, index]),
        )
        .join('\n') || '';
    return `${indent}<p id="${nodeId}">\n${children}\n${indent}</p>`;
  }

  // Handle list nodes
  if (node.type === 'list') {
    const nodeId = generateNodeId(path);
    const tag = node.listType === 'bullet' || node.tag === 'ul' ? 'ul' : 'ol';
    const children =
      node.children
        ?.map((child: any, index: number) =>
          convertLexicalToXml(child, depth + 1, [...path, index]),
        )
        .join('\n') || '';
    return `${indent}<${tag} id="${nodeId}">\n${children}\n${indent}</${tag}>`;
  }

  // Handle list item nodes
  if (node.type === 'listitem') {
    const nodeId = generateNodeId(path);
    const children =
      node.children
        ?.map((child: any, index: number) =>
          convertLexicalToXml(child, depth + 1, [...path, index]),
        )
        .join('\n') || '';
    return `${indent}<li id="${nodeId}">\n${children}\n${indent}</li>`;
  }

  // Handle blockquote nodes
  if (node.type === 'quote') {
    const nodeId = generateNodeId(path);
    const children =
      node.children
        ?.map((child: any, index: number) =>
          convertLexicalToXml(child, depth + 1, [...path, index]),
        )
        .join('\n') || '';
    return `${indent}<blockquote id="${nodeId}">\n${children}\n${indent}</blockquote>`;
  }

  // Handle code block nodes
  if (node.type === 'code') {
    const nodeId = generateNodeId(path);
    const text = escapeXml(node.children?.map((c: any) => c.text || '').join('') || '');
    return `${indent}<pre id="${nodeId}"><code>${text}</code></pre>`;
  }

  // Handle link nodes
  if (node.type === 'link') {
    const nodeId = generateNodeId(path);
    const href = escapeXml(node.url || '');
    const children =
      node.children
        ?.map((child: any, index: number) => convertLexicalToXml(child, depth, [...path, index]))
        .join('') || '';
    return `<a id="${nodeId}" href="${href}">${children}</a>`;
  }

  // Handle image nodes
  if (node.type === 'image') {
    const nodeId = generateNodeId(path);
    const src = escapeXml(node.src || '');
    const alt = escapeXml(node.altText || '');
    return `${indent}<img id="${nodeId}" src="${src}" alt="${alt}" />`;
  }

  // Handle table nodes
  if (node.type === 'table') {
    const nodeId = generateNodeId(path);
    const children =
      node.children
        ?.map((child: any, index: number) =>
          convertLexicalToXml(child, depth + 1, [...path, index]),
        )
        .join('\n') || '';
    return `${indent}<table id="${nodeId}">\n${children}\n${indent}</table>`;
  }

  // Handle table row nodes
  if (node.type === 'tablerow') {
    const nodeId = generateNodeId(path);
    const children =
      node.children
        ?.map((child: any, index: number) =>
          convertLexicalToXml(child, depth + 1, [...path, index]),
        )
        .join('\n') || '';
    return `${indent}<tr id="${nodeId}">\n${children}\n${indent}</tr>`;
  }

  // Handle table cell nodes
  if (node.type === 'tablecell') {
    const nodeId = generateNodeId(path);
    const children =
      node.children
        ?.map((child: any, index: number) =>
          convertLexicalToXml(child, depth + 1, [...path, index]),
        )
        .join('\n') || '';
    return `${indent}<td id="${nodeId}">\n${children}\n${indent}</td>`;
  }

  // Fallback for unknown nodes - just process children
  if (node.children) {
    return node.children
      .map((child: any, index: number) => convertLexicalToXml(child, depth, [...path, index]))
      .join('\n');
  }

  return '';
};

/**
 * Page context for Page Editor
 */
export interface PageEditorContext {
  /** Plain text content (for reference) */
  content?: string;
  /** Document/Page metadata */
  document?: {
    /** File type */
    fileType?: string;
    /** Document unique identifier */
    id: string;
    /** URL slug */
    slug?: string;
    /** Document title */
    title?: string;
    /** Total character count */
    totalCharCount?: number;
    /** Total line count */
    totalLineCount?: number;
  };
  /** Editor data - the XML document structure */
  editorData?: Record<string, any>;
}

export interface PageEditorContextInjectorConfig {
  /** Whether Page Editor/Agent is enabled */
  enabled?: boolean;
  /** Function to format page context */
  formatPageContext?: (context: PageEditorContext) => string;
  /** Page context to inject */
  pageContext?: PageEditorContext;
}

/**
 * Format page context as XML for injection
 */
const defaultFormatPageContext = (context: PageEditorContext): string => {
  const parts: string[] = [];

  // Add document metadata section
  if (context.document) {
    const metaFields: string[] = [];
    if (context.document.id) metaFields.push(`  <id>${escapeXml(context.document.id)}</id>`);
    if (context.document.title)
      metaFields.push(`  <title>${escapeXml(context.document.title)}</title>`);
    if (context.document.slug)
      metaFields.push(`  <slug>${escapeXml(context.document.slug)}</slug>`);
    if (context.document.fileType)
      metaFields.push(`  <fileType>${escapeXml(context.document.fileType)}</fileType>`);
    if (context.document.totalCharCount !== undefined)
      metaFields.push(`  <totalCharCount>${context.document.totalCharCount}</totalCharCount>`);
    if (context.document.totalLineCount !== undefined)
      metaFields.push(`  <totalLineCount>${context.document.totalLineCount}</totalLineCount>`);

    if (metaFields.length > 0) {
      parts.push(`<document_metadata>\n${metaFields.join('\n')}\n</document_metadata>`);
    }
  }

  // Add editor data section (the XML document structure)
  if (context.editorData) {
    try {
      // Convert Lexical JSON to XML format with node IDs
      const xmlStructure = convertLexicalToXml(context.editorData.root);

      // Log the conversion for debugging
      const nodeCount = context.editorData.root?.children?.length || 0;
      console.log(
        '[PageEditorContextInjector] Converted Lexical to XML, root children count:',
        nodeCount,
      );
      console.log('[PageEditorContextInjector] XML preview:', xmlStructure.slice(0, 500));

      // Don't escape the XML since it's already properly formatted XML
      // Just include it directly (not escaped) so the model can parse the structure
      parts.push(`<document_structure>\n${xmlStructure}\n</document_structure>`);
    } catch (error) {
      log('Error converting editorData to XML:', error);
      console.error('[PageEditorContextInjector] Error converting editorData:', error);
    }
  }

  // Add content preview section (if available)
  if (context.content) {
    // Show preview (first 1000 chars) to avoid too long context
    const preview =
      context.content.length > 1000 ? context.content.slice(0, 1000) + '...' : context.content;
    parts.push(
      `<content_preview length="${context.content.length}">${escapeXml(preview)}</content_preview>`,
    );
  }

  if (parts.length === 0) {
    return '';
  }

  return `<instruction>This is the current page/document context. The document uses an XML-based structure with unique node IDs. Use the Document tools (initPage, editTitle, etc.) to read and modify the page content when the user asks.</instruction>
${parts.join('\n')}`;
};

/**
 * Page Editor Context Injector
 * Responsible for injecting current page context at the end of the last user message
 * This ensures the model receives the most up-to-date page/document state
 */
export class PageEditorContextInjector extends BaseLastUserContentProvider {
  readonly name = 'PageEditorContextInjector';

  constructor(
    private config: PageEditorContextInjectorConfig,
    options: ProcessorOptions = {},
  ) {
    super(options);
  }

  protected async doProcess(context: PipelineContext): Promise<PipelineContext> {
    log('doProcess called');
    log('config.enabled:', this.config.enabled);

    const clonedContext = this.cloneContext(context);

    // Skip if Page Editor is not enabled
    if (!this.config.enabled) {
      log('Page Editor not enabled, skipping injection');
      return this.markAsExecuted(clonedContext);
    }

    // Skip if no page context
    if (!this.config.pageContext) {
      log('No page context provided, skipping injection');
      return this.markAsExecuted(clonedContext);
    }

    // Format page context
    const formatFn = this.config.formatPageContext || defaultFormatPageContext;
    const formattedContent = formatFn(this.config.pageContext);

    log('Formatted content length:', formattedContent.length);

    // Skip if no content to inject
    if (!formattedContent) {
      log('No content to inject after formatting');
      return this.markAsExecuted(clonedContext);
    }

    // Find the last user message index
    const lastUserIndex = this.findLastUserMessageIndex(clonedContext.messages);

    log('Last user message index:', lastUserIndex);

    if (lastUserIndex === -1) {
      log('No user messages found, skipping injection');
      return this.markAsExecuted(clonedContext);
    }

    // Check if system context wrapper already exists
    // If yes, only insert context block; if no, use full wrapper
    const hasExistingWrapper = this.hasExistingSystemContext(clonedContext);
    const contentToAppend = hasExistingWrapper
      ? this.createContextBlock(formattedContent, 'current_page_context')
      : this.wrapWithSystemContext(formattedContent, 'current_page_context');

    this.appendToLastUserMessage(clonedContext, contentToAppend);

    // Update metadata
    clonedContext.metadata.pageEditorContextInjected = true;

    log('Page Editor context appended to last user message');

    return this.markAsExecuted(clonedContext);
  }
}
