// Node position types
export type NodePosition = 'before' | 'after' | 'prepend' | 'append';

// ============ Initialize Args ============
export interface InitDocumentArgs {
  markdown: string;
}

// ============ Document Metadata Args ============
export interface EditTitleArgs {
  title: string;
}

// Common node types in XML document
export type NodeType =
  | 'p'
  | 'span'
  | 'file'
  | 'img'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 'ul'
  | 'ol'
  | 'li'
  | 'table'
  | 'thead'
  | 'tbody'
  | 'tr'
  | 'td'
  | 'th'
  | 'blockquote'
  | 'code'
  | 'pre'
  | 'a'
  | 'br'
  | 'hr'
  | 'div'
  | string;

// ============ Query & Search Args ============
export interface GetPageContentArgs {
  format?: 'xml' | 'markdown' | 'both';
}

export interface GetNodeArgs {
  nodeId: string;
}

export interface FindNodesArgs {
  attributes?: Record<string, string>;
  containsText?: string;
  type?: NodeType;
}

// ============ Basic CRUD Args ============

/** Single node creation specification */
export interface NodeCreate {
  attributes?: Record<string, string>;
  children?: string;
  content?: string;
  position?: NodePosition;
  referenceNodeId?: string;
  type: NodeType;
}

/**
 * Args for creating nodes. Supports two modes:
 * 1. Single node: Use type, content, etc. directly
 * 2. Multiple nodes: Use nodes array containing multiple NodeCreate objects
 */
export type CreateNodeArgs =
  | NodeCreate
  | {
      nodes: NodeCreate[];
    };

/** Single node update specification */
export interface NodeUpdate {
  attributes?: Record<string, string | null>;
  children?: string;
  content?: string;
  nodeId: string;
}

/**
 * Args for updating nodes. Supports two modes:
 * 1. Single node: Use `nodeId` with optional `content`, `children`, `attributes`
 * 2. Multiple nodes: Use `nodes` array containing multiple NodeUpdate objects
 */
export type UpdateNodeArgs =
  | NodeUpdate
  | {
      nodes: NodeUpdate[];
    };

export interface DeleteNodeArgs {
  nodeId: string;
}

export interface MoveNodeArgs {
  nodeId: string;
  position: NodePosition;
  targetNodeId: string;
}

export interface DuplicateNodeArgs {
  nodeId: string;
  position?: 'before' | 'after';
}

// ============ Unified Modify Nodes Args ============

/** Insert operation: insert a node before or after a reference node */
export type ModifyInsertOperation =
  | {
      action: 'insert';
      afterId: string;
      litexml: string;
    }
  | {
      action: 'insert';
      beforeId: string;
      litexml: string;
    };

/** Remove operation: remove a node by ID */
export interface ModifyRemoveOperation {
  action: 'remove';
  id: string;
}

/** Modify operation: update existing nodes by their IDs (embedded in litexml) */
export interface ModifyUpdateOperation {
  action: 'modify';
  litexml: string | string[];
}

/** Union type for all modify operations */
export type ModifyOperation = ModifyInsertOperation | ModifyRemoveOperation | ModifyUpdateOperation;

/** Args for the unified modifyNodes API */
export interface ModifyNodesArgs {
  operations: ModifyOperation[];
}

// ============ Text Operations Args ============
export interface ReplaceTextArgs {
  newText: string;
  nodeIds?: string[];
  replaceAll?: boolean;
  searchText: string;
  useRegex?: boolean;
}

// ============ Batch Operations Args ============
export interface BatchUpdateArgs {
  attributes?: Record<string, string | null>;
  nodeIds: string[];
}

// ============ Structure Operations Args ============
export interface WrapNodesArgs {
  nodeIds: string[];
  wrapperAttributes?: Record<string, string>;
  wrapperType: NodeType;
}

export interface UnwrapNodeArgs {
  nodeId: string;
}

export interface MergeNodesArgs {
  nodeIds: string[];
}

export interface SplitNodeArgs {
  nodeId: string;
  splitAt: number;
}

// ============ Table Operations Args ============
export interface InsertTableRowArgs {
  cells?: string[];
  position?: 'before' | 'after';
  referenceRowId?: string;
  tableId: string;
}

export interface InsertTableColumnArgs {
  cells?: string[];
  columnIndex: number;
  headerContent?: string;
  tableId: string;
}

export interface DeleteTableRowArgs {
  rowId: string;
}

export interface DeleteTableColumnArgs {
  columnIndex: number;
  tableId: string;
}

// ============ State Types for Renders ============
export interface DocumentNode {
  attributes?: Record<string, string>;
  children?: DocumentNode[];
  content?: string;
  id: string;
  type: string;
}

export interface GetPageContentState {
  documentId: string;
  markdown?: string;
  metadata: {
    fileType?: string;
    title: string;
    totalCharCount?: number;
    totalLineCount?: number;
  };
  xml?: string;
}

export interface GetNodeState {
  node: DocumentNode;
}

export interface FindNodesState {
  matches: Array<{
    id: string;
    preview?: string;
    type: string;
  }>;
  total: number;
}

/** Details of a single node creation result */
export interface NodeCreateResult {
  content?: string;
  createdNodeId: string;
  success: boolean;
  type: string;
}

export interface CreateNodeState {
  /** @deprecated Use results instead. Kept for backward compatibility */
  createdNodeId?: string;
  /** @deprecated Use results instead. Kept for backward compatibility */
  createdNodeIds?: string[];
  /** Individual creation results with details */
  results: NodeCreateResult[];
}

/** Details of a single node update result */
export interface NodeUpdateResult {
  attributes?: Record<string, string | null>;
  content?: string;
  nodeId: string;
  success: boolean;
}

export interface UpdateNodeState {
  /** Individual update results with details */
  results: NodeUpdateResult[];
  /** @deprecated Use results instead. Kept for backward compatibility */
  updatedNodeId?: string;
  /** @deprecated Use results instead. Kept for backward compatibility */
  updatedNodeIds?: string[];
}

export interface DeleteNodeState {
  deletedNodeId: string;
}

export interface MoveNodeState {
  movedNodeId: string;
  newPosition: string;
}

export interface DuplicateNodeState {
  newNodeId: string;
  originalNodeId: string;
}

/** Result of a single modify operation */
export interface ModifyOperationResult {
  action: 'insert' | 'remove' | 'modify';
  error?: string;
  success: boolean;
}

export interface ModifyNodesState {
  results: ModifyOperationResult[];
  successCount: number;
  totalCount: number;
}

export interface ReplaceTextState {
  replacementCount: number;
}

export interface BatchUpdateState {
  updatedNodeIds: string[];
}

export interface WrapNodesState {
  wrappedNodeIds: string[];
  wrapperNodeId: string;
}

export interface UnwrapNodeState {
  childNodeIds: string[];
  removedNodeId: string;
}

export interface MergeNodesState {
  mergedNodeId: string;
  removedNodeIds: string[];
}

export interface SplitNodeState {
  newNodeIds: [string, string];
  originalNodeId: string;
}

export interface InsertTableRowState {
  newRowId: string;
}

export interface InsertTableColumnState {
  columnIndex: number;
  newCellIds: string[];
}

export interface DeleteTableRowState {
  deletedRowId: string;
}

export interface DeleteTableColumnState {
  columnIndex: number;
  deletedCellIds: string[];
}

// ============ Image Operations Args ============
export interface ResizeImageArgs {
  height?: number;
  keepAspectRatio?: boolean;
  nodeId: string;
  width?: number;
}

export interface CropImageArgs {
  height: number;
  nodeId: string;
  width: number;
  x: number;
  y: number;
}

export interface RotateImageArgs {
  angle: 90 | 180 | 270 | -90 | -180 | -270;
  nodeId: string;
}

export interface SetImageAltArgs {
  alt: string;
  nodeId: string;
}

// ============ List Operations Args ============
export interface IndentListItemArgs {
  nodeId: string;
}

export interface OutdentListItemArgs {
  nodeId: string;
}

export interface ToggleListTypeArgs {
  listId: string;
  targetType: 'ul' | 'ol';
}

export interface ConvertToListArgs {
  listType: 'ul' | 'ol';
  nodeIds: string[];
}

// ============ Snapshot Operations Args ============
export interface SaveSnapshotArgs {
  description?: string;
}

export interface RestoreSnapshotArgs {
  snapshotId: string;
}

export interface ListSnapshotsArgs {
  limit?: number;
}

export interface DeleteSnapshotArgs {
  snapshotId: string;
}

export interface CompareSnapshotsArgs {
  snapshotId1: string;
  snapshotId2: string;
}

// ============ Image Operations State ============
export interface ResizeImageState {
  newHeight: number;
  newWidth: number;
  nodeId: string;
}

export interface CropImageState {
  nodeId: string;
}

export interface RotateImageState {
  newAngle: number;
  nodeId: string;
}

export interface SetImageAltState {
  nodeId: string;
}

// ============ List Operations State ============
export interface IndentListItemState {
  newParentId: string;
  nodeId: string;
}

export interface OutdentListItemState {
  newParentId: string;
  nodeId: string;
}

export interface ToggleListTypeState {
  listId: string;
  newType: 'ul' | 'ol';
}

export interface ConvertToListState {
  listId: string;
  nodeIds: string[];
}

// ============ Initialize State ============
export interface InitDocumentState {
  nodeCount: number;
  rootId: string;
}

// ============ Document Metadata State ============
export interface EditTitleState {
  newTitle: string;
  previousTitle: string;
}

// ============ Snapshot Operations State ============
export interface SnapshotInfo {
  createdAt: string;
  description?: string;
  id: string;
  nodeCount: number;
}

export interface SaveSnapshotState {
  snapshotId: string;
}

export interface RestoreSnapshotState {
  restoredSnapshotId: string;
}

export interface ListSnapshotsState {
  snapshots: SnapshotInfo[];
  total: number;
}

export interface DeleteSnapshotState {
  deletedSnapshotId: string;
}

export interface CompareSnapshotsState {
  additions: string[];
  deletions: string[];
  modifications: string[];
}
