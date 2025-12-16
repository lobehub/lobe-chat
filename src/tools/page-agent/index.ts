/* eslint-disable sort-keys-fix/sort-keys-fix */
import { BuiltinToolManifest } from '@lobechat/types';

import { systemPrompt } from './systemRole';

export const DocumentApiName = {
  // Initialize
  initPage: 'initPage',

  // Document Metadata
  editTitle: 'editTitle',

  // Query & Read
  getPageContent: 'getPageContent',

  // Unified CRUD - replaces createNode, updateNode, deleteNode
  modifyNodes: 'modifyNodes',

  // Legacy CRUD (deprecated, kept for backward compatibility)
  createNode: 'createNode',
  deleteNode: 'deleteNode',
  duplicateNode: 'duplicateNode',
  moveNode: 'moveNode',
  updateNode: 'updateNode',

  // Batch Operations
  batchUpdate: 'batchUpdate',

  // Text Operations
  replaceText: 'replaceText',

  // Structure Operations
  mergeNodes: 'mergeNodes',
  splitNode: 'splitNode',
  unwrapNode: 'unwrapNode',
  wrapNodes: 'wrapNodes',

  // Table Operations
  deleteTableColumn: 'deleteTableColumn',
  deleteTableRow: 'deleteTableRow',
  insertTableColumn: 'insertTableColumn',
  insertTableRow: 'insertTableRow',

  // Image Operations
  cropImage: 'cropImage',
  resizeImage: 'resizeImage',
  rotateImage: 'rotateImage',
  setImageAlt: 'setImageAlt',

  // List Operations
  convertToList: 'convertToList',
  indentListItem: 'indentListItem',
  outdentListItem: 'outdentListItem',
  toggleListType: 'toggleListType',

  // Snapshot Operations
  compareSnapshots: 'compareSnapshots',
  deleteSnapshot: 'deleteSnapshot',
  listSnapshots: 'listSnapshots',
  restoreSnapshot: 'restoreSnapshot',
  saveSnapshot: 'saveSnapshot',
};

export const PageAgentManifest: BuiltinToolManifest = {
  api: [
    // ============ Initialize ============
    {
      description:
        'Initialize a new document from Markdown content. Converts the Markdown into an XML-structured document with unique IDs for each node. This should be called first before performing any other document operations.',
      name: DocumentApiName.initPage,
      parameters: {
        properties: {
          markdown: {
            description:
              'The Markdown content to convert into a document. Supports headings, paragraphs, lists, tables, images, links, code blocks, and other common Markdown syntax.',
            type: 'string',
          },
        },
        required: ['markdown'],
        type: 'object',
      },
    },
    // ============ Document Metadata ============
    {
      description:
        'Edit the title of the current document. The title is displayed in the document header and is stored separately from the document content.',
      name: DocumentApiName.editTitle,
      parameters: {
        properties: {
          title: {
            description: 'The new title for the document.',
            type: 'string',
          },
        },
        required: ['title'],
        type: 'object',
      },
    },

    // ============ Query & Read ============
    {
      description:
        'Get the current page content and metadata. Returns the document in XML format with node IDs, markdown format, or both. Use this tool to retrieve the latest state of the document.',
      name: DocumentApiName.getPageContent,
      parameters: {
        properties: {
          format: {
            default: 'both',
            description:
              'The format to return the content in. Options: "xml" (returns document structure with node IDs), "markdown" (returns plain markdown text), "both" (returns both formats). Defaults to "both".',
            enum: ['xml', 'markdown', 'both'],
            type: 'string',
          },
        },
        type: 'object',
      },
    },

    // ============ Unified Node Operations ============
    {
      description:
        'Perform node operations (insert, modify, remove) on the document. This is the unified API for all CRUD operations. Supports batch operations by passing multiple operations in a single call.',
      name: DocumentApiName.modifyNodes,
      parameters: {
        properties: {
          operations: {
            description:
              'Array of operations to perform. Each operation can be: insert (add a new node), modify (update existing nodes), or remove (delete a node).',
            items: {
              oneOf: [
                {
                  description: 'Insert a new node before a reference node',
                  properties: {
                    action: { const: 'insert', type: 'string' },
                    beforeId: {
                      description: 'ID of the node to insert before',
                      type: 'string',
                    },
                    litexml: {
                      description:
                        'The LiteXML string representing the node to insert (e.g., "<p>New paragraph</p>")',
                      type: 'string',
                    },
                  },
                  required: ['action', 'beforeId', 'litexml'],
                  type: 'object',
                },
                {
                  description: 'Insert a new node after a reference node',
                  properties: {
                    action: { const: 'insert', type: 'string' },
                    afterId: {
                      description: 'ID of the node to insert after',
                      type: 'string',
                    },
                    litexml: {
                      description:
                        'The LiteXML string representing the node to insert (e.g., "<p>New paragraph</p>")',
                      type: 'string',
                    },
                  },
                  required: ['action', 'afterId', 'litexml'],
                  type: 'object',
                },
                {
                  description: 'Modify existing nodes by providing updated LiteXML with node IDs',
                  properties: {
                    action: { const: 'modify', type: 'string' },
                    litexml: {
                      description:
                        'LiteXML string or array of strings with node IDs to update (e.g., "<p id=\\"abc\\">Updated content</p>" or ["<p id=\\"a\\">Text 1</p>", "<p id=\\"b\\">Text 2</p>"])',
                      oneOf: [{ type: 'string' }, { items: { type: 'string' }, type: 'array' }],
                    },
                  },
                  required: ['action', 'litexml'],
                  type: 'object',
                },
                {
                  description: 'Remove a node by ID',
                  properties: {
                    action: { const: 'remove', type: 'string' },
                    id: {
                      description: 'ID of the node to remove',
                      type: 'string',
                    },
                  },
                  required: ['action', 'id'],
                  type: 'object',
                },
              ],
            },
            type: 'array',
          },
        },
        required: ['operations'],
        type: 'object',
      },
    },

    // ============ Text Operations ============
    {
      description:
        'Find and replace text across the document or within specific nodes. Supports regex patterns.',
      name: DocumentApiName.replaceText,
      parameters: {
        properties: {
          newText: {
            description: 'The replacement text.',
            type: 'string',
          },
          nodeIds: {
            description:
              'Optional array of node IDs to limit the replacement scope. If not provided, searches entire document.',
            items: { type: 'string' },
            type: 'array',
          },
          replaceAll: {
            default: true,
            description: 'Whether to replace all occurrences or just the first one.',
            type: 'boolean',
          },
          searchText: {
            description: 'The text to find. Can be a plain string or regex pattern.',
            type: 'string',
          },
          useRegex: {
            default: false,
            description: 'Whether to treat searchText as a regular expression.',
            type: 'boolean',
          },
        },
        required: ['searchText', 'newText'],
        type: 'object',
      },
    },

    // ============ Batch Operations ============
    {
      description:
        'Update multiple nodes at once with the same changes. Useful for bulk formatting or attribute changes.',
      name: DocumentApiName.batchUpdate,
      parameters: {
        properties: {
          attributes: {
            description: 'Attributes to update on all specified nodes.',
            type: 'object',
          },
          nodeIds: {
            description: 'Array of node IDs to update.',
            items: { type: 'string' },
            type: 'array',
          },
        },
        required: ['nodeIds'],
        type: 'object',
      },
    },

    // ============ Structure Operations ============
    {
      description:
        'Wrap one or more nodes with a new parent node. Useful for grouping content or adding containers.',
      name: DocumentApiName.wrapNodes,
      parameters: {
        properties: {
          nodeIds: {
            description: 'Array of node IDs to wrap. Nodes must be siblings.',
            items: { type: 'string' },
            type: 'array',
          },
          wrapperAttributes: {
            description: 'Attributes for the wrapper node.',
            type: 'object',
          },
          wrapperType: {
            description: 'The type of wrapper node to create (e.g., "div", "blockquote", "ul").',
            type: 'string',
          },
        },
        required: ['nodeIds', 'wrapperType'],
        type: 'object',
      },
    },
    {
      description:
        'Remove a wrapper node while keeping its children. The children will take the place of the wrapper.',
      name: DocumentApiName.unwrapNode,
      parameters: {
        properties: {
          nodeId: {
            description: 'The ID of the wrapper node to unwrap.',
            type: 'string',
          },
        },
        required: ['nodeId'],
        type: 'object',
      },
    },
    {
      description:
        'Merge multiple adjacent sibling nodes into one. Content from all nodes will be combined.',
      name: DocumentApiName.mergeNodes,
      parameters: {
        properties: {
          nodeIds: {
            description:
              'Array of adjacent sibling node IDs to merge. The first node will be kept and others merged into it.',
            items: { type: 'string' },
            type: 'array',
          },
        },
        required: ['nodeIds'],
        type: 'object',
      },
    },
    {
      description:
        'Split a node at a specific position. Creates two nodes from one, dividing the content.',
      name: DocumentApiName.splitNode,
      parameters: {
        properties: {
          nodeId: {
            description: 'The ID of the node to split.',
            type: 'string',
          },
          splitAt: {
            description:
              'Where to split. For text nodes, this is the character offset. For container nodes, this is the child index.',
            type: 'number',
          },
        },
        required: ['nodeId', 'splitAt'],
        type: 'object',
      },
    },

    // ============ Table Operations ============
    {
      description:
        'Insert a new row into a table. Can insert at a specific position or at the end.',
      name: DocumentApiName.insertTableRow,
      parameters: {
        properties: {
          cells: {
            description:
              'Array of cell contents for the new row. If not provided, empty cells will be created.',
            items: { type: 'string' },
            type: 'array',
          },
          position: {
            default: 'after',
            description: 'Insert "before" or "after" the reference row.',
            enum: ['before', 'after'],
            type: 'string',
          },
          referenceRowId: {
            description:
              'The ID of the reference row. If not provided, inserts at the end of the table.',
            type: 'string',
          },
          tableId: {
            description: 'The ID of the table to modify.',
            type: 'string',
          },
        },
        required: ['tableId'],
        type: 'object',
      },
    },
    {
      description:
        'Insert a new column into a table. Adds a cell to each row at the specified position.',
      name: DocumentApiName.insertTableColumn,
      parameters: {
        properties: {
          cells: {
            description:
              'Array of cell contents for the new column, one for each row. If not provided, empty cells will be created.',
            items: { type: 'string' },
            type: 'array',
          },
          columnIndex: {
            description: 'The index where to insert the column (0-based). -1 means at the end.',
            type: 'number',
          },
          headerContent: {
            description: 'Content for the header cell if the table has a header row.',
            type: 'string',
          },
          tableId: {
            description: 'The ID of the table to modify.',
            type: 'string',
          },
        },
        required: ['tableId', 'columnIndex'],
        type: 'object',
      },
    },
    {
      description: 'Delete a row from a table.',
      humanIntervention: 'required',
      name: DocumentApiName.deleteTableRow,
      parameters: {
        properties: {
          rowId: {
            description: 'The ID of the row to delete.',
            type: 'string',
          },
        },
        required: ['rowId'],
        type: 'object',
      },
    },
    {
      description:
        'Delete a column from a table. Removes the cell at the specified index from each row.',
      humanIntervention: 'required',
      name: DocumentApiName.deleteTableColumn,
      parameters: {
        properties: {
          columnIndex: {
            description: 'The index of the column to delete (0-based).',
            type: 'number',
          },
          tableId: {
            description: 'The ID of the table to modify.',
            type: 'string',
          },
        },
        required: ['tableId', 'columnIndex'],
        type: 'object',
      },
    },

    // ============ Image Operations ============
    {
      description:
        'Resize an image node. You can specify width, height, or both. Use keepAspectRatio to maintain proportions.',
      name: DocumentApiName.resizeImage,
      parameters: {
        properties: {
          height: {
            description: 'The new height in pixels.',
            type: 'number',
          },
          keepAspectRatio: {
            default: true,
            description:
              'Whether to maintain the aspect ratio when only one dimension is specified.',
            type: 'boolean',
          },
          nodeId: {
            description: 'The ID of the image node to resize.',
            type: 'string',
          },
          width: {
            description: 'The new width in pixels.',
            type: 'number',
          },
        },
        required: ['nodeId'],
        type: 'object',
      },
    },
    {
      description:
        'Crop an image to a specific region. Specify the x, y coordinates (top-left corner) and the width and height of the crop area.',
      name: DocumentApiName.cropImage,
      parameters: {
        properties: {
          height: {
            description: 'The height of the crop area in pixels.',
            type: 'number',
          },
          nodeId: {
            description: 'The ID of the image node to crop.',
            type: 'string',
          },
          width: {
            description: 'The width of the crop area in pixels.',
            type: 'number',
          },
          x: {
            description: 'The x coordinate of the top-left corner of the crop area.',
            type: 'number',
          },
          y: {
            description: 'The y coordinate of the top-left corner of the crop area.',
            type: 'number',
          },
        },
        required: ['nodeId', 'x', 'y', 'width', 'height'],
        type: 'object',
      },
    },
    {
      description: 'Rotate an image by 90, 180, or 270 degrees (clockwise or counter-clockwise).',
      name: DocumentApiName.rotateImage,
      parameters: {
        properties: {
          angle: {
            description:
              'The rotation angle. Positive values rotate clockwise, negative counter-clockwise.',
            enum: [90, 180, 270, -90, -180, -270],
            type: 'number',
          },
          nodeId: {
            description: 'The ID of the image node to rotate.',
            type: 'string',
          },
        },
        required: ['nodeId', 'angle'],
        type: 'object',
      },
    },
    {
      description: 'Set or update the alt text of an image for accessibility.',
      name: DocumentApiName.setImageAlt,
      parameters: {
        properties: {
          alt: {
            description: 'The alt text to set for the image.',
            type: 'string',
          },
          nodeId: {
            description: 'The ID of the image node.',
            type: 'string',
          },
        },
        required: ['nodeId', 'alt'],
        type: 'object',
      },
    },

    // ============ List Operations ============
    {
      description:
        'Indent a list item, making it a child of the previous sibling. Creates nested list structure.',
      name: DocumentApiName.indentListItem,
      parameters: {
        properties: {
          nodeId: {
            description: 'The ID of the list item (li) to indent.',
            type: 'string',
          },
        },
        required: ['nodeId'],
        type: 'object',
      },
    },
    {
      description:
        'Outdent a list item, moving it up one level in the list hierarchy. Reduces nesting.',
      name: DocumentApiName.outdentListItem,
      parameters: {
        properties: {
          nodeId: {
            description: 'The ID of the list item (li) to outdent.',
            type: 'string',
          },
        },
        required: ['nodeId'],
        type: 'object',
      },
    },
    {
      description:
        'Toggle a list between ordered (ol) and unordered (ul) types. All list items are preserved.',
      name: DocumentApiName.toggleListType,
      parameters: {
        properties: {
          listId: {
            description: 'The ID of the list (ul or ol) to toggle.',
            type: 'string',
          },
          targetType: {
            description: 'The target list type.',
            enum: ['ul', 'ol'],
            type: 'string',
          },
        },
        required: ['listId', 'targetType'],
        type: 'object',
      },
    },
    {
      description:
        'Convert one or more paragraph or other nodes into a list. Creates a new list containing the specified nodes as list items.',
      name: DocumentApiName.convertToList,
      parameters: {
        properties: {
          listType: {
            description: 'The type of list to create.',
            enum: ['ul', 'ol'],
            type: 'string',
          },
          nodeIds: {
            description: 'Array of node IDs to convert into list items.',
            items: { type: 'string' },
            type: 'array',
          },
        },
        required: ['nodeIds', 'listType'],
        type: 'object',
      },
    },

    // ============ Snapshot Operations ============
    {
      description:
        'Save a snapshot of the current document state. Useful for creating restore points before making significant changes.',
      name: DocumentApiName.saveSnapshot,
      parameters: {
        properties: {
          description: {
            description:
              'Optional description to identify this snapshot (e.g., "Before reformatting tables").',
            type: 'string',
          },
        },
        type: 'object',
      },
    },
    {
      description:
        'Restore the document to a previously saved snapshot. This will discard all changes made after that snapshot.',
      humanIntervention: 'required',
      name: DocumentApiName.restoreSnapshot,
      parameters: {
        properties: {
          snapshotId: {
            description: 'The ID of the snapshot to restore.',
            type: 'string',
          },
        },
        required: ['snapshotId'],
        type: 'object',
      },
    },
    {
      description: 'List all saved snapshots for the current document.',
      name: DocumentApiName.listSnapshots,
      parameters: {
        properties: {
          limit: {
            default: 10,
            description: 'Maximum number of snapshots to return.',
            type: 'number',
          },
        },
        type: 'object',
      },
    },
    {
      description: 'Delete a saved snapshot.',
      name: DocumentApiName.deleteSnapshot,
      parameters: {
        properties: {
          snapshotId: {
            description: 'The ID of the snapshot to delete.',
            type: 'string',
          },
        },
        required: ['snapshotId'],
        type: 'object',
      },
    },
    {
      description:
        'Compare two snapshots to see what changed between them. Returns lists of added, deleted, and modified nodes.',
      name: DocumentApiName.compareSnapshots,
      parameters: {
        properties: {
          snapshotId1: {
            description: 'The ID of the first (older) snapshot.',
            type: 'string',
          },
          snapshotId2: {
            description: 'The ID of the second (newer) snapshot.',
            type: 'string',
          },
        },
        required: ['snapshotId1', 'snapshotId2'],
        type: 'object',
      },
    },
  ],
  identifier: 'lobe-page-agent',
  meta: {
    avatar: '📄',
    description: 'Create, read, update, and delete nodes in XML-structured documents',
    title: 'Document',
  },
  systemRole: systemPrompt,
  type: 'builtin',
};
