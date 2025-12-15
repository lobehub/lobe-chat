/* eslint-disable @typescript-eslint/no-unused-vars */
import { BuiltinServerRuntimeOutput } from '@lobechat/types';
import {
  IEditor,
  LITEXML_APPLY_COMMAND,
  LITEXML_INSERT_COMMAND,
  LITEXML_REMOVE_COMMAND,
} from '@lobehub/editor';

import type {
  BatchUpdateArgs,
  CompareSnapshotsArgs,
  CompareSnapshotsState,
  ConvertToListArgs,
  ConvertToListState,
  CreateNodeArgs,
  CreateNodeState,
  CropImageArgs,
  CropImageState,
  DeleteNodeArgs,
  DeleteNodeState,
  DeleteSnapshotArgs,
  DeleteSnapshotState,
  DeleteTableColumnArgs,
  DeleteTableColumnState,
  DeleteTableRowArgs,
  DeleteTableRowState,
  DuplicateNodeArgs,
  DuplicateNodeState,
  EditTitleArgs,
  EditTitleState,
  GetPageContentArgs,
  GetPageContentState,
  IndentListItemArgs,
  IndentListItemState,
  InitDocumentArgs,
  InitDocumentState,
  InsertTableColumnArgs,
  InsertTableColumnState,
  InsertTableRowArgs,
  InsertTableRowState,
  ListSnapshotsArgs,
  ListSnapshotsState,
  MergeNodesArgs,
  MergeNodesState,
  MoveNodeArgs,
  MoveNodeState,
  OutdentListItemArgs,
  OutdentListItemState,
  ReplaceTextArgs,
  ReplaceTextState,
  ResizeImageArgs,
  ResizeImageState,
  RestoreSnapshotArgs,
  RestoreSnapshotState,
  RotateImageArgs,
  RotateImageState,
  SaveSnapshotArgs,
  SaveSnapshotState,
  SetImageAltArgs,
  SetImageAltState,
  SplitNodeArgs,
  SplitNodeState,
  ToggleListTypeArgs,
  ToggleListTypeState,
  UnwrapNodeArgs,
  UnwrapNodeState,
  UpdateNodeArgs,
  UpdateNodeState,
  WrapNodesArgs,
  WrapNodesState,
} from '../type';

/**
 * Page Agent Execution Runtime
 * Handles the execution logic for all Page Agent (Document) APIs
 *
 * See `packages/builtin-agents/src/agents/page-agent/README.md` for more detailsd
 */
export class PageAgentExecutionRuntime {
  private editor: IEditor | null = null;
  private titleSetter: ((title: string) => void) | null = null;
  private titleGetter: (() => string) | null = null;
  private currentDocId: string | undefined = undefined;

  /**
   * Set the current editor instance
   */
  setEditor(editor: IEditor | null) {
    this.editor = editor;
  }

  /**
   * Set the current document ID
   */
  setCurrentDocId(docId: string | undefined) {
    console.log('[PageAgentRuntime] Setting current doc ID:', docId);
    this.currentDocId = docId;
  }

  /**
   * Get the current document ID
   */
  getCurrentDocId(): string | undefined {
    return this.currentDocId;
  }

  /**
   * Set the title setter and getter functions
   */
  setTitleHandlers(setter: ((title: string) => void) | null, getter: (() => string) | null) {
    this.titleSetter = setter;
    this.titleGetter = getter;
  }

  /**
   * Get the current editor instance
   */
  private getEditor(): IEditor {
    if (!this.editor) {
      throw new Error('Editor not initialized. Please set the editor instance first.');
    }
    return this.editor;
  }

  /**
   * Get the title handlers
   */
  private getTitleHandlers(): { getter: () => string; setter: (title: string) => void } {
    if (!this.titleSetter || !this.titleGetter) {
      throw new Error('Title handlers not initialized. Please set the title handlers first.');
    }
    return { getter: this.titleGetter, setter: this.titleSetter };
  }

  // ==================== Initialize ====================

  /**
   * Replace the content from Markdown
   */
  async initPage(args: InitDocumentArgs): Promise<BuiltinServerRuntimeOutput> {
    try {
      const editor = this.getEditor();

      // Set markdown content directly - the editor will convert it internally
      editor.setDocument('markdown', args.markdown);

      // Get the resulting document to count nodes
      const jsonState = editor.getDocument('json') as any;
      const nodeCount = jsonState?.children?.length || 0;

      return {
        content: `Successfully initialized document with ${nodeCount} top-level nodes from ${args.markdown.length} characters of markdown content.`,
        state: {
          nodeCount,
          rootId: 'root',
        } as InitDocumentState,
        success: true,
      };
    } catch (error) {
      const err = error as Error;
      return {
        content: `Failed to initialize document: ${err.message}`,
        error,
        success: false,
      };
    }
  }

  // ==================== Metadata ====================

  /**
   * Edit the page title
   */
  async editTitle(args: EditTitleArgs): Promise<BuiltinServerRuntimeOutput> {
    try {
      const { setter, getter } = this.getTitleHandlers();
      const previousTitle = getter();

      // Update the title
      setter(args.title);

      return {
        content: `Successfully updated document title from "${previousTitle}" to "${args.title}".`,
        state: {
          newTitle: args.title,
          previousTitle,
        } as EditTitleState,
        success: true,
      };
    } catch (error) {
      const err = error as Error;
      return {
        content: `Failed to update document title: ${err.message}`,
        error,
        success: false,
      };
    }
  }

  // ==================== Query & Read ====================

  /**
   * Get the current page content and metadata
   */
  async getPageContent(args: GetPageContentArgs): Promise<BuiltinServerRuntimeOutput> {
    try {
      const editor = this.getEditor();
      if (!editor) {
        throw new Error('Editor instance not found');
      }

      const { getter: getTitleFn } = this.getTitleHandlers();
      if (!getTitleFn) {
        throw new Error('Title getter not found');
      }

      const format = args.format || 'both';
      const title = getTitleFn() || 'Untitled';

      // Get document in JSON format
      const docJson = editor.getDocument('json') as any;
      const pageXML = editor.getDocument('litexml') as any;
      console.log('[getPageContent] docJson:', JSON.stringify(docJson, null, 2));

      // Prepare state object
      const state: GetPageContentState = {
        documentId: 'current',
        metadata: {
          title,
        },
      };

      // Get markdown format if requested
      if (format === 'markdown' || format === 'both') {
        const markdownRaw = editor.getDocument('markdown');
        console.log('[getPageContent] markdownRaw:', markdownRaw);
        const markdown = String(markdownRaw || '');
        state.markdown = markdown;
      }

      // Convert to XML if requested
      if (format === 'xml' || format === 'both') {
        if (pageXML) {
          state.xml = pageXML;
        } else {
          state.xml = '';
        }
      }

      // Build content message
      let contentMsg = `Successfully retrieved page content.\n\n**Title**: ${title}\n`;

      if (state.markdown) {
        const charCount = state.markdown.length;
        const lineCount = state.markdown.split('\n').length;
        contentMsg += `**Markdown**: ${charCount} characters, ${lineCount} lines\n`;
        state.metadata.totalCharCount = charCount;
        state.metadata.totalLineCount = lineCount;
      }

      if (state.xml) {
        contentMsg += `**XML Structure**: ${state.xml}\n`;
      }

      return {
        content: contentMsg,
        state,
        success: true,
      };
    } catch (error) {
      const err = error as Error;
      return {
        content: `Failed to get page content: ${err.message}`,
        error,
        success: false,
      };
    }
  }

  // ==================== Helper Methods ====================

  /**
   * Find a node in the Lexical JSON structure by its Lexical key
   * @param root - The root node to search from
   * @param key - The Lexical key (e.g., "9p5r")
   * @returns The found node or null
   */
  private findNodeByKey(node: any, key: string): any {
    if (!node) return null;

    // Check if this node has the key we're looking for
    if (node.key === key) {
      return node;
    }

    // Recursively search children
    if (node.children && Array.isArray(node.children)) {
      for (const child of node.children) {
        const found = this.findNodeByKey(child, key);
        if (found) return found;
      }
    }

    return null;
  }

  /**
   * Find a node in XML string by its id attribute
   * @param xml - The XML string to search
   * @param nodeId - The id attribute value to find
   * @returns Object with tag name and content, or null if not found
   */
  private findNodeInXML(xml: string, nodeId: string): { content: string; tagName: string } | null {
    if (!xml || !nodeId) return null;

    // Match the element with the given id
    // Pattern: <tagName id="nodeId" ...>content</tagName> or self-closing <tagName id="nodeId" ... />
    const escapedId = nodeId.replaceAll(/[$()*+.?[\\\]^{|}]/g, '\\$&');

    // First try to match a full element with opening and closing tags
    const fullElementRegex = new RegExp(
      `<(\\w+)\\s+[^>]*id="${escapedId}"[^>]*>([\\s\\S]*?)<\\/\\1>`,
      'i',
    );
    const fullMatch = fullElementRegex.exec(xml);

    if (fullMatch) {
      return {
        content: fullMatch[2],
        tagName: fullMatch[1],
      };
    }

    // Try self-closing tag
    const selfClosingRegex = new RegExp(`<(\\w+)\\s+[^>]*id="${escapedId}"[^>]*/\\s*>`, 'i');
    const selfClosingMatch = selfClosingRegex.exec(xml);

    if (selfClosingMatch) {
      return {
        content: '',
        tagName: selfClosingMatch[1],
      };
    }

    return null;
  }

  /**
   * Find parent node and index of a child node by its key
   * Returns { parent, index } or null if not found
   */
  private findParentAndIndex(
    node: any,
    targetKey: string,
    parent: any = null,
    index: number = -1,
  ): { index: number; parent: any } | null {
    if (!node) return null;

    // Check if this node has the key we're looking for
    if (node.key === targetKey) {
      return { index, parent };
    }

    // Recursively search children
    if (node.children && Array.isArray(node.children)) {
      for (let i = 0; i < node.children.length; i++) {
        const found = this.findParentAndIndex(node.children[i], targetKey, node, i);
        if (found) return found;
      }
    }

    return null;
  }

  /**
   * Parse simple XML to Lexical nodes (for table structures)
   */
  private parseSimpleXmlToLexical(xml: string): any[] {
    const result: any[] = [];

    // Simple regex-based XML parsing for table structures
    // Match tags like <tr>, <td>, <th>, etc.
    const tagRegex = /<(\w+)[^>]*>([\S\s]*?)<\/\1>|<(\w+)[^>]*\/>/g;
    let match;

    while ((match = tagRegex.exec(xml)) !== null) {
      const tagName = match[1] || match[3];
      const innerContent = match[2] || '';

      // Skip thead and tbody wrappers - Lexical tables don't use these
      if (tagName === 'thead' || tagName === 'tbody') {
        // Just parse their children directly
        const children = this.parseSimpleXmlToLexical(innerContent);
        result.push(...children);
        continue;
      }

      const node: any = {
        type: this.mapNodeTypeToLexical(tagName),
      };

      // Recursively parse inner content if it contains more tags
      if (innerContent && /<\w+/.test(innerContent)) {
        node.children = this.parseSimpleXmlToLexical(innerContent);
      } else if (innerContent.trim()) {
        // Plain text content
        node.children = [{ text: innerContent.trim(), type: 'text' }];
      } else {
        // Empty node
        node.children = [];
      }

      result.push(node);
    }

    return result;
  }

  /**
   * Create a Lexical node structure from parameters
   */
  private createLexicalNode(args: CreateNodeArgs): any {
    const lexicalType = this.mapNodeTypeToLexical(args.type);

    // Handle text nodes specially
    if (lexicalType === 'text' || args.type === 'span') {
      return {
        text: args.content || '',
        type: 'text',
        ...args.attributes,
      };
    }

    const node: any = {
      type: lexicalType,
    };

    // Add type-specific properties
    if (/^h[1-6]$/.test(args.type)) {
      node.tag = args.type;
    }

    // Add content
    if (args.content) {
      node.children = [
        {
          text: args.content,
          type: 'text',
        },
      ];
    }

    // Parse and add children if provided
    if (args.children) {
      // For tables and complex structures, parse XML
      if (lexicalType === 'table' || /<(tr|td|th|thead|tbody)/.test(args.children)) {
        const parsedChildren = this.parseSimpleXmlToLexical(args.children);
        if (parsedChildren.length > 0) {
          node.children = parsedChildren;
        }
      } else {
        // For simple cases, store as text
        node.children = [
          {
            text: args.children,
            type: 'text',
          },
        ];
      }
    }

    // Add attributes (stored in Lexical-specific fields)
    if (args.attributes) {
      Object.assign(node, args.attributes);
    }

    return node;
  }

  /**
   * Map XML node types to Lexical node types
   */
  private mapNodeTypeToLexical(type: string): string {
    const mapping: Record<string, string> = {
      a: 'link',
      blockquote: 'quote',
      code: 'code',
      h1: 'heading',
      h2: 'heading',
      h3: 'heading',
      h4: 'heading',
      h5: 'heading',
      h6: 'heading',
      img: 'image',
      li: 'listitem',
      ol: 'list',
      p: 'paragraph',
      pre: 'code',
      span: 'text',
      table: 'table',
      tbody: 'tablebody',
      td: 'tablecell',
      th: 'tablecell',
      thead: 'tablehead',
      tr: 'tablerow',
      ul: 'list',
    };

    return mapping[type] || type;
  }

  // ==================== Basic CRUD ====================

  async createNode(args: CreateNodeArgs): Promise<BuiltinServerRuntimeOutput> {
    try {
      const editor = this.getEditor();

      console.log('[createNode] Creating node:', args);

      // Build LiteXML for the new node
      const nodeType = args.type;
      let content = '';

      if (args.content) {
        // For text content, wrap in span
        content = `<span>${args.content}</span>`;
      } else if (args.children) {
        content = args.children;
      }

      // Build attributes string
      let attributesStr = '';
      if (args.attributes) {
        for (const [key, value] of Object.entries(args.attributes)) {
          if (value !== null && value !== undefined) {
            attributesStr += ` ${key}="${value}"`;
          }
        }
      }

      const litexml = `<${nodeType}${attributesStr}>${content}</${nodeType}>`;

      console.log('[createNode] Generated LiteXML:', litexml);

      // Use LITEXML_INSERT_COMMAND to insert the node
      // The command expects either { beforeId, litexml } or { afterId, litexml }
      const position = args.position || 'after';
      const commandPayload =
        position === 'before'
          ? { beforeId: args.referenceNodeId || 'root', litexml }
          : { afterId: args.referenceNodeId || 'root', litexml };

      const success = editor.dispatchCommand(LITEXML_INSERT_COMMAND, commandPayload);

      console.log('[createNode] Command dispatched, success:', success);

      return {
        content: `Successfully created ${args.type} node${args.referenceNodeId ? ` ${args.position || 'after'} node ${args.referenceNodeId}` : ' at document root'}.`,
        state: {
          createdNodeId: 'pending', // Node ID will be assigned by the editor
        } as CreateNodeState,
        success: true,
      };
    } catch (error) {
      const err = error as Error;
      console.error('[createNode] Error:', err.message, err.stack);
      return {
        content: `Failed to create node: ${err.message}`,
        error,
        success: false,
      };
    }
  }

  // TODO: Shoould support muttiple nodes modification
  async updateNode(args: UpdateNodeArgs): Promise<BuiltinServerRuntimeOutput> {
    try {
      const editor = this.getEditor();

      console.log('[updateNode] Attempting to update node:', args.nodeId);
      console.log('[updateNode] Update args:', {
        content: args.content,
        hasAttributes: !!args.attributes,
        hasChildren: !!args.children,
      });

      // Build the LiteXML for the updated node
      let litexml = '';

      // Get node info from pageXML instead of docJSON
      const pageXML = editor.getDocument('litexml') as unknown as string;
      const xmlNode = this.findNodeInXML(pageXML, args.nodeId);

      console.log('[updateNode] pageXML:', pageXML);
      console.log('[updateNode] Found XML node:', xmlNode);

      if (!xmlNode) {
        console.error('[updateNode] Node not found in XML:', args.nodeId);
        throw new Error(`Node ${args.nodeId} not found`);
      }

      const nodeType = xmlNode.tagName;
      const updates: string[] = [];

      // Start building the XML tag
      let attributes = `id="${args.nodeId}"`;

      // Add or update attributes
      if (args.attributes) {
        for (const [key, value] of Object.entries(args.attributes)) {
          if (value !== null) {
            attributes += ` ${key}="${value}"`;
            updates.push(`set attribute ${key}`);
          }
        }
      }

      // Build content
      let content = '';
      if (args.content !== undefined) {
        content = args.content;
        updates.push('content');
      } else if (args.children !== undefined) {
        content = args.children;
        updates.push('children');
      } else {
        // Keep existing content from XML
        content = xmlNode.content;
      }

      litexml = `<${nodeType} ${attributes}>${content}</${nodeType}>`;

      console.log('[updateNode] Generated LiteXML:', litexml);

      const success = editor.dispatchCommand(LITEXML_APPLY_COMMAND, {
        litexml: [litexml],
      });

      console.log('[updateNode] Command dispatched, success:', success);

      const updateSummary = updates.length > 0 ? ` (${updates.join(', ')})` : '';

      return {
        content: `Successfully updated node ${args.nodeId}${updateSummary}.`,
        state: { updatedNodeId: args.nodeId } as UpdateNodeState,
        success: true,
      };
    } catch (error) {
      const err = error as Error;
      console.error('[updateNode] Error:', err.message, err.stack);
      return {
        content: `Failed to update node: ${err.message}`,
        error,
        success: false,
      };
    }
  }

  /**
   * Convert Lexical node type back to XML tag name
   */
  private mapLexicalTypeToXML(lexicalType: string): string {
    const mapping: Record<string, string> = {
      code: 'code',
      heading: 'h1', // Will need the tag property for h1-h6
      image: 'img',
      link: 'a',
      list: 'ul', // Will need to check list type
      listitem: 'li',
      paragraph: 'p',
      quote: 'blockquote',
      table: 'table',
      tablebody: 'tbody',
      tablecell: 'td',
      tablehead: 'thead',
      tablerow: 'tr',
      text: 'span',
    };

    return mapping[lexicalType] || lexicalType;
  }

  /**
   * Convert node children to string representation
   */
  private stringifyNodeChildren(children: any[]): string {
    if (!children || children.length === 0) return '';

    return children
      .map((child) => {
        if (child.type === 'text') {
          return child.text || '';
        }
        // For other nodes, recursively stringify
        const tag = this.mapLexicalTypeToXML(child.type);
        const content = child.children ? this.stringifyNodeChildren(child.children) : '';
        return `<${tag}>${content}</${tag}>`;
      })
      .join('');
  }

  async deleteNode(args: DeleteNodeArgs): Promise<BuiltinServerRuntimeOutput> {
    try {
      const editor = this.getEditor();

      console.log('[deleteNode] Deleting node:', args.nodeId);

      // First verify the node exists in the XML
      const pageXML = editor.getDocument('litexml') as unknown as string;
      const xmlNode = this.findNodeInXML(pageXML, args.nodeId);

      if (!xmlNode) {
        console.error('[deleteNode] Node not found in XML:', args.nodeId);
        throw new Error(`Node ${args.nodeId} not found`);
      }

      console.log('[deleteNode] Found node to delete:', xmlNode.tagName);

      // Use LITEXML_REMOVE_COMMAND to remove the node
      const success = editor.dispatchCommand(LITEXML_REMOVE_COMMAND, {
        id: args.nodeId,
      });

      console.log('[deleteNode] Command dispatched, success:', success);

      return {
        content: `Successfully deleted ${xmlNode.tagName} node ${args.nodeId}.`,
        state: { deletedNodeId: args.nodeId } as DeleteNodeState,
        success: true,
      };
    } catch (error) {
      const err = error as Error;
      console.error('[deleteNode] Error:', err.message, err.stack);
      return {
        content: `Failed to delete node: ${err.message}`,
        error,
        success: false,
      };
    }
  }

  async moveNode(args: MoveNodeArgs): Promise<BuiltinServerRuntimeOutput> {
    try {
      // TODO: Implement node move
      return {
        content: `Node move not yet implemented`,
        state: { movedNodeId: args.nodeId, newPosition: '' } as MoveNodeState,
        success: false,
      };
    } catch (error) {
      const err = error as Error;
      return {
        content: `Failed to move node: ${err.message}`,
        error,
        success: false,
      };
    }
  }

  async duplicateNode(args: DuplicateNodeArgs): Promise<BuiltinServerRuntimeOutput> {
    try {
      // TODO: Implement node duplication
      return {
        content: `Node duplication not yet implemented`,
        state: { newNodeId: '', originalNodeId: args.nodeId } as DuplicateNodeState,
        success: false,
      };
    } catch (error) {
      const err = error as Error;
      return {
        content: `Failed to duplicate node: ${err.message}`,
        error,
        success: false,
      };
    }
  }

  // ==================== Batch Operations ====================

  async batchUpdate(args: BatchUpdateArgs): Promise<BuiltinServerRuntimeOutput> {
    try {
      // TODO: Implement batch update
      return {
        content: `Batch update not yet implemented`,
        state: { updatedNodeIds: args.nodeIds } as any,
        success: false,
      };
    } catch (error) {
      const err = error as Error;
      return {
        content: `Failed to batch update: ${err.message}`,
        error,
        success: false,
      };
    }
  }

  // ==================== Text Operations ====================

  async replaceText(_args: ReplaceTextArgs): Promise<BuiltinServerRuntimeOutput> {
    try {
      // TODO: Implement text replacement
      return {
        content: `Text replacement not yet implemented`,
        state: { replacementCount: 0 } as ReplaceTextState,
        success: false,
      };
    } catch (error) {
      const err = error as Error;
      return {
        content: `Failed to replace text: ${err.message}`,
        error,
        success: false,
      };
    }
  }

  // ==================== Structure Operations ====================

  async mergeNodes(_args: MergeNodesArgs): Promise<BuiltinServerRuntimeOutput> {
    try {
      // TODO: Implement node merging
      return {
        content: `Node merging not yet implemented`,
        state: { mergedNodeId: '', removedNodeIds: [] } as MergeNodesState,
        success: false,
      };
    } catch (error) {
      const err = error as Error;
      return {
        content: `Failed to merge nodes: ${err.message}`,
        error,
        success: false,
      };
    }
  }

  async splitNode(args: SplitNodeArgs): Promise<BuiltinServerRuntimeOutput> {
    try {
      // TODO: Implement node splitting
      return {
        content: `Node splitting not yet implemented`,
        state: { newNodeIds: ['', ''], originalNodeId: args.nodeId } as SplitNodeState,
        success: false,
      };
    } catch (error) {
      const err = error as Error;
      return {
        content: `Failed to split node: ${err.message}`,
        error,
        success: false,
      };
    }
  }

  async unwrapNode(args: UnwrapNodeArgs): Promise<BuiltinServerRuntimeOutput> {
    try {
      // TODO: Implement node unwrapping
      return {
        content: `Node unwrapping not yet implemented`,
        state: { childNodeIds: [], removedNodeId: args.nodeId } as UnwrapNodeState,
        success: false,
      };
    } catch (error) {
      const err = error as Error;
      return {
        content: `Failed to unwrap node: ${err.message}`,
        error,
        success: false,
      };
    }
  }

  async wrapNodes(args: WrapNodesArgs): Promise<BuiltinServerRuntimeOutput> {
    try {
      // TODO: Implement node wrapping
      return {
        content: `Node wrapping not yet implemented`,
        state: { wrappedNodeIds: args.nodeIds, wrapperNodeId: '' } as WrapNodesState,
        success: false,
      };
    } catch (error) {
      const err = error as Error;
      return {
        content: `Failed to wrap nodes: ${err.message}`,
        error,
        success: false,
      };
    }
  }

  // ==================== Table Operations ====================

  /**
   * Helper: Create an empty table cell
   */
  private createTableCell(content?: string): any {
    return {
      children: content
        ? [
            {
              text: content,
              type: 'text',
            },
          ]
        : [],
      type: 'tablecell',
    };
  }

  /**
   * Helper: Find table node by Lexical key
   */
  private findTableNode(docJson: any, tableId: string): any {
    const table = this.findNodeByKey(docJson.root, tableId);

    if (!table || table.type !== 'table') {
      throw new Error(`Table ${tableId} not found`);
    }

    return table;
  }

  async insertTableRow(args: InsertTableRowArgs): Promise<BuiltinServerRuntimeOutput> {
    try {
      const editor = this.getEditor();
      const docJson = editor.getDocument('json') as any;

      if (!docJson || !docJson.root) {
        throw new Error('Document not initialized');
      }

      const table = this.findTableNode(docJson, args.tableId);

      // Determine column count from first row
      const columnCount = table.children?.[0]?.children?.length || args.cells?.length || 3;

      // Create new row with cells
      const newRow: any = {
        children: [],
        type: 'tablerow',
      };

      // Create cells for the new row
      for (let i = 0; i < columnCount; i++) {
        const cellContent = args.cells?.[i] || '';
        newRow.children.push(this.createTableCell(cellContent));
      }

      // Insert the row at the specified position
      if (!table.children) {
        table.children = [];
      }

      let insertIndex = table.children.length;

      if (args.referenceRowId) {
        // Find the reference row within the table
        const refIndex = table.children.findIndex((row: any) => row.key === args.referenceRowId);
        if (refIndex !== -1) {
          insertIndex = args.position === 'before' ? refIndex : refIndex + 1;
        }
      }

      // Generate a unique key for the new row
      newRow.key = `${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;

      table.children.splice(insertIndex, 0, newRow);

      // Update the document
      editor.setDocument('json', JSON.stringify(docJson));

      return {
        content: `Successfully inserted row with ${columnCount} cells into table ${args.tableId}.`,
        state: { newRowId: newRow.key } as InsertTableRowState,
        success: true,
      };
    } catch (error) {
      const err = error as Error;
      return {
        content: `Failed to insert table row: ${err.message}`,
        error,
        success: false,
      };
    }
  }

  async insertTableColumn(args: InsertTableColumnArgs): Promise<BuiltinServerRuntimeOutput> {
    try {
      const editor = this.getEditor();
      const docJson = editor.getDocument('json') as any;

      if (!docJson || !docJson.root) {
        throw new Error('Document not initialized');
      }

      const table = this.findTableNode(docJson, args.tableId);

      if (!table.children || table.children.length === 0) {
        throw new Error('Table has no rows');
      }

      const newCellIds: string[] = [];
      const columnIndex =
        args.columnIndex === -1 ? table.children[0].children.length : args.columnIndex;

      // Add a cell to each row
      table.children.forEach((row: any, rowIndex: number) => {
        if (row.type !== 'tablerow') return;

        if (!row.children) {
          row.children = [];
        }

        // Determine cell content
        let cellContent = '';
        if (rowIndex === 0 && args.headerContent) {
          cellContent = args.headerContent;
        } else if (args.cells && args.cells[rowIndex]) {
          cellContent = args.cells[rowIndex];
        }

        const newCell = this.createTableCell(cellContent);
        // Generate a unique key for the new cell
        newCell.key = `${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
        row.children.splice(columnIndex, 0, newCell);

        // Track the new cell key
        newCellIds.push(newCell.key);
      });

      // Update the document
      editor.setDocument('json', JSON.stringify(docJson));

      return {
        content: `Successfully inserted column at index ${columnIndex} in table ${args.tableId}.`,
        state: { columnIndex, newCellIds } as InsertTableColumnState,
        success: true,
      };
    } catch (error) {
      const err = error as Error;
      return {
        content: `Failed to insert table column: ${err.message}`,
        error,
        success: false,
      };
    }
  }

  async deleteTableRow(args: DeleteTableRowArgs): Promise<BuiltinServerRuntimeOutput> {
    try {
      const editor = this.getEditor();
      const docJson = editor.getDocument('json') as any;

      if (!docJson || !docJson.root) {
        throw new Error('Document not initialized');
      }

      // Find the row by Lexical key and its parent
      const result = this.findParentAndIndex(docJson.root, args.rowId);

      if (!result || !result.parent) {
        throw new Error(`Row ${args.rowId} not found`);
      }

      const { parent: table, index: rowIndex } = result;

      // Verify parent is a table
      if (table.type !== 'table') {
        throw new Error('Parent of row is not a table');
      }

      if (!table.children || !table.children[rowIndex]) {
        throw new Error(`Row ${args.rowId} not found in table children`);
      }

      // Remove the row
      table.children.splice(rowIndex, 1);

      // Update the document
      editor.setDocument('json', JSON.stringify(docJson));

      return {
        content: `Successfully deleted row ${args.rowId} from table.`,
        state: { deletedRowId: args.rowId } as DeleteTableRowState,
        success: true,
      };
    } catch (error) {
      const err = error as Error;
      return {
        content: `Failed to delete table row: ${err.message}`,
        error,
        success: false,
      };
    }
  }

  async deleteTableColumn(args: DeleteTableColumnArgs): Promise<BuiltinServerRuntimeOutput> {
    try {
      const editor = this.getEditor();
      const docJson = editor.getDocument('json') as any;

      if (!docJson || !docJson.root) {
        throw new Error('Document not initialized');
      }

      const table = this.findTableNode(docJson, args.tableId);

      if (!table.children || table.children.length === 0) {
        throw new Error('Table has no rows');
      }

      const deletedCellIds: string[] = [];

      // Remove the cell at columnIndex from each row
      table.children.forEach((row: any) => {
        if (row.type !== 'tablerow') return;

        if (!row.children || !row.children[args.columnIndex]) {
          return;
        }

        // Track the deleted cell key
        const deletedCell = row.children[args.columnIndex];
        if (deletedCell.key) {
          deletedCellIds.push(deletedCell.key);
        }

        // Remove the cell
        row.children.splice(args.columnIndex, 1);
      });

      // Update the document
      editor.setDocument('json', JSON.stringify(docJson));

      return {
        content: `Successfully deleted column at index ${args.columnIndex} from table ${args.tableId}.`,
        state: { columnIndex: args.columnIndex, deletedCellIds } as DeleteTableColumnState,
        success: true,
      };
    } catch (error) {
      const err = error as Error;
      return {
        content: `Failed to delete table column: ${err.message}`,
        error,
        success: false,
      };
    }
  }

  // ==================== Image Operations ====================

  async cropImage(args: CropImageArgs): Promise<BuiltinServerRuntimeOutput> {
    try {
      // TODO: Implement image cropping
      return {
        content: `Image cropping not yet implemented`,
        state: { nodeId: args.nodeId } as CropImageState,
        success: false,
      };
    } catch (error) {
      const err = error as Error;
      return {
        content: `Failed to crop image: ${err.message}`,
        error,
        success: false,
      };
    }
  }

  async resizeImage(args: ResizeImageArgs): Promise<BuiltinServerRuntimeOutput> {
    try {
      // TODO: Implement image resizing
      return {
        content: `Image resizing not yet implemented`,
        state: { newHeight: 0, newWidth: 0, nodeId: args.nodeId } as ResizeImageState,
        success: false,
      };
    } catch (error) {
      const err = error as Error;
      return {
        content: `Failed to resize image: ${err.message}`,
        error,
        success: false,
      };
    }
  }

  async rotateImage(args: RotateImageArgs): Promise<BuiltinServerRuntimeOutput> {
    try {
      // TODO: Implement image rotation
      return {
        content: `Image rotation not yet implemented`,
        state: { newAngle: args.angle, nodeId: args.nodeId } as RotateImageState,
        success: false,
      };
    } catch (error) {
      const err = error as Error;
      return {
        content: `Failed to rotate image: ${err.message}`,
        error,
        success: false,
      };
    }
  }

  async setImageAlt(args: SetImageAltArgs): Promise<BuiltinServerRuntimeOutput> {
    try {
      // TODO: Implement image alt text setting
      return {
        content: `Image alt text setting not yet implemented`,
        state: { nodeId: args.nodeId } as SetImageAltState,
        success: false,
      };
    } catch (error) {
      const err = error as Error;
      return {
        content: `Failed to set image alt text: ${err.message}`,
        error,
        success: false,
      };
    }
  }

  // ==================== List Operations ====================

  async convertToList(args: ConvertToListArgs): Promise<BuiltinServerRuntimeOutput> {
    try {
      // TODO: Implement list conversion
      return {
        content: `List conversion not yet implemented`,
        state: { listId: '', nodeIds: args.nodeIds } as ConvertToListState,
        success: false,
      };
    } catch (error) {
      const err = error as Error;
      return {
        content: `Failed to convert to list: ${err.message}`,
        error,
        success: false,
      };
    }
  }

  async indentListItem(args: IndentListItemArgs): Promise<BuiltinServerRuntimeOutput> {
    try {
      // TODO: Implement list item indentation
      return {
        content: `List item indentation not yet implemented`,
        state: { newParentId: '', nodeId: args.nodeId } as IndentListItemState,
        success: false,
      };
    } catch (error) {
      const err = error as Error;
      return {
        content: `Failed to indent list item: ${err.message}`,
        error,
        success: false,
      };
    }
  }

  async outdentListItem(args: OutdentListItemArgs): Promise<BuiltinServerRuntimeOutput> {
    try {
      // TODO: Implement list item outdentation
      return {
        content: `List item outdentation not yet implemented`,
        state: { newParentId: '', nodeId: args.nodeId } as OutdentListItemState,
        success: false,
      };
    } catch (error) {
      const err = error as Error;
      return {
        content: `Failed to outdent list item: ${err.message}`,
        error,
        success: false,
      };
    }
  }

  async toggleListType(args: ToggleListTypeArgs): Promise<BuiltinServerRuntimeOutput> {
    try {
      // TODO: Implement list type toggling
      return {
        content: `List type toggling not yet implemented`,
        state: { listId: args.listId, newType: args.targetType } as ToggleListTypeState,
        success: false,
      };
    } catch (error) {
      const err = error as Error;
      return {
        content: `Failed to toggle list type: ${err.message}`,
        error,
        success: false,
      };
    }
  }

  // ==================== Snapshot Operations ====================

  async compareSnapshots(_args: CompareSnapshotsArgs): Promise<BuiltinServerRuntimeOutput> {
    try {
      // TODO: Implement snapshot comparison
      return {
        content: `Snapshot comparison not yet implemented`,
        state: {
          additions: [],
          deletions: [],
          modifications: [],
        } as CompareSnapshotsState,
        success: false,
      };
    } catch (error) {
      const err = error as Error;
      return {
        content: `Failed to compare snapshots: ${err.message}`,
        error,
        success: false,
      };
    }
  }

  async deleteSnapshot(args: DeleteSnapshotArgs): Promise<BuiltinServerRuntimeOutput> {
    try {
      // TODO: Implement snapshot deletion
      return {
        content: `Snapshot deletion not yet implemented`,
        state: { deletedSnapshotId: args.snapshotId } as DeleteSnapshotState,
        success: false,
      };
    } catch (error) {
      const err = error as Error;
      return {
        content: `Failed to delete snapshot: ${err.message}`,
        error,
        success: false,
      };
    }
  }

  async listSnapshots(_args: ListSnapshotsArgs): Promise<BuiltinServerRuntimeOutput> {
    try {
      // TODO: Implement snapshot listing
      return {
        content: `Snapshot listing not yet implemented`,
        state: { snapshots: [], total: 0 } as ListSnapshotsState,
        success: false,
      };
    } catch (error) {
      const err = error as Error;
      return {
        content: `Failed to list snapshots: ${err.message}`,
        error,
        success: false,
      };
    }
  }

  async restoreSnapshot(args: RestoreSnapshotArgs): Promise<BuiltinServerRuntimeOutput> {
    try {
      // TODO: Implement snapshot restoration
      return {
        content: `Snapshot restoration not yet implemented`,
        state: { restoredSnapshotId: args.snapshotId } as RestoreSnapshotState,
        success: false,
      };
    } catch (error) {
      const err = error as Error;
      return {
        content: `Failed to restore snapshot: ${err.message}`,
        error,
        success: false,
      };
    }
  }

  async saveSnapshot(_args: SaveSnapshotArgs): Promise<BuiltinServerRuntimeOutput> {
    try {
      // TODO: Implement snapshot saving
      return {
        content: `Snapshot saving not yet implemented`,
        state: { snapshotId: '' } as SaveSnapshotState,
        success: false,
      };
    } catch (error) {
      const err = error as Error;
      return {
        content: `Failed to save snapshot: ${err.message}`,
        error,
        success: false,
      };
    }
  }
}
