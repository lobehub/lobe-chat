import type { BuiltinToolManifest } from '@lobechat/types';

import { systemPrompt } from './systemRole';
import { DocumentApiName, PageAgentIdentifier } from './types';

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
              'The Markdown content。 Supports headings, paragraphs, lists, tables, images, links, code blocks, and other common Markdown syntax.',
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

    // ============ HTML pages ============
    {
      description:
        'Read the current HTML of an HTML page (a page whose body is one self-contained HTML document rendered as a web page). Call this before editing so oldString matches exactly. Only for HTML pages.',
      name: DocumentApiName.readHtml,
      parameters: { properties: {}, type: 'object' },
    },
    {
      description:
        'Edit an HTML page by exact string replacement in its HTML source. oldString must match the current HTML exactly (including whitespace) and occur once, unless replaceAll is true. Prefer this for targeted changes. Only for HTML pages.',
      name: DocumentApiName.editHtml,
      parameters: {
        properties: {
          newString: { description: 'The replacement text.', type: 'string' },
          oldString: {
            description: 'The exact text to replace, copied from readHtml output.',
            type: 'string',
          },
          replaceAll: {
            default: false,
            description: 'Replace every occurrence of oldString instead of exactly one.',
            type: 'boolean',
          },
        },
        required: ['oldString', 'newString'],
        type: 'object',
      },
    },
    {
      description:
        'Replace the whole HTML of an HTML page with a new self-contained HTML document (inline CSS/JS; images as data URIs or public URLs). Use for rewrites; use editHtml for targeted changes. Only for HTML pages.',
      name: DocumentApiName.writeHtml,
      parameters: {
        properties: {
          html: { description: 'The complete new HTML document.', type: 'string' },
        },
        required: ['html'],
        type: 'object',
      },
    },
  ],
  identifier: PageAgentIdentifier,
  meta: {
    avatar: '📄',
    description: 'Create, read, update, and delete nodes in XML-structured documents',
    readme:
      'Create and edit structured documents with precise node-level control. Initialize from Markdown, perform batch insert/modify/remove operations, and find-and-replace text across documents.',
    title: 'Document',
  },
  systemRole: systemPrompt,
  type: 'builtin',
};
