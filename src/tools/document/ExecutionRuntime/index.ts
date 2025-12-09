/* eslint-disable @typescript-eslint/no-unused-vars */
import { BuiltinServerRuntimeOutput } from '@lobechat/types';
import { IEditor } from '@lobehub/editor';

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

  /**
   * Set the current editor instance
   */
  setEditor(editor: IEditor | null) {
    this.editor = editor;
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

  // ==================== Helper Methods ====================

  /**
   * Find a node in the Lexical JSON structure by its path-based ID
   * Node IDs are generated as "node_{path}" where path is like "0.1.2"
   */
  private findNodeByPath(root: any, path: number[]): any {
    let current = root;
    for (const index of path) {
      if (!current.children || !current.children[index]) {
        return null;
      }
      current = current.children[index];
    }
    return current;
  }

  /**
   * Parse a node ID (format: "node_0_1_2") into a path array [0, 1, 2]
   */
  private parseNodeId(nodeId: string): number[] {
    if (!nodeId.startsWith('node_')) {
      throw new Error(`Invalid node ID format: ${nodeId}. Expected format: node_0_1_2`);
    }
    const pathStr = nodeId.slice(5);
    if (!pathStr || pathStr.trim() === '') {
      throw new Error(`Invalid node ID format: ${nodeId}. Expected format: node_0_1_2`);
    }
    return pathStr.split('_').map(Number);
  }

  /**
   * Generate a node ID from a path array
   */
  private generateNodeId(path: number[]): string {
    return `node_${path.join('_')}`;
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
      // For now, store as text - in a full implementation, would parse XML
      node.children = [
        {
          text: args.children,
          type: 'text',
        },
      ];
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
      ul: 'list',
    };

    return mapping[type] || type;
  }

  // ==================== Basic CRUD ====================

  async createNode(args: CreateNodeArgs): Promise<BuiltinServerRuntimeOutput> {
    try {
      const editor = this.getEditor();

      // Get current document
      const docJson = editor.getDocument('json') as any;
      if (!docJson || !docJson.root) {
        throw new Error('Document not initialized');
      }

      // Create the new node
      const newNode = this.createLexicalNode(args);

      // Find the reference node and insert
      if (args.referenceNodeId) {
        const refPath = this.parseNodeId(args.referenceNodeId);
        const parent = this.findNodeByPath(docJson.root, refPath.slice(0, -1)) || docJson.root;

        if (!parent.children) {
          parent.children = [];
        }

        const position = args.position || 'after';
        const refIndex = refPath.at(-1);

        if (refIndex === undefined) {
          throw new Error('Invalid reference node path');
        }

        switch (position) {
          case 'before': {
            parent.children.splice(refIndex, 0, newNode);
            break;
          }
          case 'after': {
            parent.children.splice(refIndex + 1, 0, newNode);
            break;
          }
          case 'prepend': {
            const refNode = parent.children[refIndex];
            if (!refNode.children) refNode.children = [];
            refNode.children.unshift(newNode);
            break;
          }
          case 'append': {
            const refNode = parent.children[refIndex];
            if (!refNode.children) refNode.children = [];
            refNode.children.push(newNode);
            break;
          }
        }
      } else {
        // Append to root
        if (!docJson.root.children) {
          docJson.root.children = [];
        }
        docJson.root.children.push(newNode);
      }

      // Update the document
      editor.setDocument('json', JSON.stringify(docJson));

      return {
        content: `Successfully created ${args.type} node${args.referenceNodeId ? ` ${args.position || 'after'} node ${args.referenceNodeId}` : ' at document root'}.`,
        state: {
          createdNodeId: this.generateNodeId([
            ...(args.referenceNodeId ? this.parseNodeId(args.referenceNodeId).slice(0, -1) : []),
            docJson.root.children.length - 1,
          ]),
        } as CreateNodeState,
        success: true,
      };
    } catch (error) {
      const err = error as Error;
      return {
        content: `Failed to create node: ${err.message}`,
        error,
        success: false,
      };
    }
  }

  async updateNode(args: UpdateNodeArgs): Promise<BuiltinServerRuntimeOutput> {
    try {
      const editor = this.getEditor();

      // Get current document
      const docJson = editor.getDocument('json') as any;
      if (!docJson || !docJson.root) {
        throw new Error('Document not initialized');
      }

      // Find the node
      const path = this.parseNodeId(args.nodeId);
      const node = this.findNodeByPath(docJson.root, path);

      if (!node) {
        throw new Error(`Node ${args.nodeId} not found`);
      }

      // Update content
      if (args.content !== undefined) {
        if (node.type === 'text') {
          node.text = args.content;
        } else {
          node.children = [
            {
              text: args.content,
              type: 'text',
            },
          ];
        }
      }

      // Update children
      if (args.children !== undefined) {
        // For now, replace with text - full implementation would parse XML
        node.children = [
          {
            text: args.children,
            type: 'text',
          },
        ];
      }

      // Update attributes
      if (args.attributes) {
        for (const [key, value] of Object.entries(args.attributes)) {
          if (value === null) {
            delete node[key];
          } else {
            node[key] = value;
          }
        }
      }

      // Update the document
      editor.setDocument('json', JSON.stringify(docJson));

      return {
        content: `Successfully updated node ${args.nodeId}.`,
        state: { updatedNodeId: args.nodeId } as UpdateNodeState,
        success: true,
      };
    } catch (error) {
      const err = error as Error;
      return {
        content: `Failed to update node: ${err.message}`,
        error,
        success: false,
      };
    }
  }

  async deleteNode(args: DeleteNodeArgs): Promise<BuiltinServerRuntimeOutput> {
    try {
      const editor = this.getEditor();

      // Get current document
      const docJson = editor.getDocument('json') as any;
      if (!docJson || !docJson.root) {
        throw new Error('Document not initialized');
      }

      // Find the parent and remove the node
      const path = this.parseNodeId(args.nodeId);
      if (path.length === 0) {
        throw new Error('Cannot delete root node');
      }

      const parentPath = path.slice(0, -1);
      const nodeIndex = path.at(-1);
      const parent =
        parentPath.length === 0 ? docJson.root : this.findNodeByPath(docJson.root, parentPath);

      if (nodeIndex === undefined) {
        throw new Error('Invalid node path');
      }

      if (!parent || !parent.children || !parent.children[nodeIndex]) {
        throw new Error(`Node ${args.nodeId} not found`);
      }

      // Remove the node
      const deletedNode = parent.children[nodeIndex];
      parent.children.splice(nodeIndex, 1);

      // Update the document
      editor.setDocument('json', JSON.stringify(docJson));

      return {
        content: `Successfully deleted ${deletedNode.type} node ${args.nodeId}.`,
        state: { deletedNodeId: args.nodeId } as DeleteNodeState,
        success: true,
      };
    } catch (error) {
      const err = error as Error;
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

  async deleteTableColumn(args: DeleteTableColumnArgs): Promise<BuiltinServerRuntimeOutput> {
    try {
      // TODO: Implement table column deletion
      return {
        content: `Table column deletion not yet implemented`,
        state: { columnIndex: args.columnIndex, deletedCellIds: [] } as DeleteTableColumnState,
        success: false,
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

  async deleteTableRow(args: DeleteTableRowArgs): Promise<BuiltinServerRuntimeOutput> {
    try {
      // TODO: Implement table row deletion
      return {
        content: `Table row deletion not yet implemented`,
        state: { deletedRowId: args.rowId } as DeleteTableRowState,
        success: false,
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

  async insertTableColumn(args: InsertTableColumnArgs): Promise<BuiltinServerRuntimeOutput> {
    try {
      // TODO: Implement table column insertion
      return {
        content: `Table column insertion not yet implemented`,
        state: { columnIndex: args.columnIndex, newCellIds: [] } as InsertTableColumnState,
        success: false,
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

  async insertTableRow(_args: InsertTableRowArgs): Promise<BuiltinServerRuntimeOutput> {
    try {
      // TODO: Implement table row insertion
      return {
        content: `Table row insertion not yet implemented`,
        state: { newRowId: '' } as InsertTableRowState,
        success: false,
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
