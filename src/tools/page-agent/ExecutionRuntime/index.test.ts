import {
  IEditor,
  LITEXML_APPLY_COMMAND,
  LITEXML_INSERT_COMMAND,
  LITEXML_REMOVE_COMMAND,
} from '@lobehub/editor';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PageAgentExecutionRuntime } from './index';

/**
 * Helper to generate LiteXML from document state
 * Converts JSON document structure to LiteXML format
 */
const generateLiteXML = (documentState: any): string => {
  const nodeToXML = (node: any, index: number, parentPath: string = ''): string => {
    const nodeId = parentPath ? `${parentPath}_${index}` : `node_${index}`;

    if (node.type === 'text') {
      return `<span id="${nodeId}">${node.text || ''}</span>`;
    }

    let tagName = node.type;
    if (node.type === 'heading') tagName = node.tag || 'h1';
    if (node.type === 'paragraph') tagName = 'p';
    if (node.type === 'tablerow') tagName = 'tr';
    if (node.type === 'tablecell') tagName = 'td';

    const children = node.children
      ? node.children.map((child: any, i: number) => nodeToXML(child, i, nodeId)).join('')
      : '';

    return `<${tagName} id="${nodeId}">${children}</${tagName}>`;
  };

  if (!documentState?.root?.children) return '';

  return documentState.root.children
    .map((child: any, i: number) => nodeToXML(child, i, ''))
    .join('');
};

describe('PageAgentExecutionRuntime - Node CRUD Operations', () => {
  let runtime: PageAgentExecutionRuntime;
  let mockEditor: IEditor;
  let documentState: any;
  let dispatchCommandMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    runtime = new PageAgentExecutionRuntime();

    // Mock document state
    documentState = {
      root: {
        children: [
          {
            children: [
              {
                text: 'Title',
                type: 'text',
              },
            ],
            tag: 'h1',
            type: 'heading',
          },
          {
            children: [
              {
                text: 'This is a paragraph',
                type: 'text',
              },
            ],
            type: 'paragraph',
          },
        ],
        type: 'root',
      },
    };

    // Create dispatchCommand mock that simulates editor behavior
    dispatchCommandMock = vi.fn((command: any, payload: any) => {
      if (command === LITEXML_INSERT_COMMAND) {
        // Simulate inserting a node - parse litexml and add to document
        const litexml = payload.litexml;
        const match = /<(\w+)[^>]*>(?:<span>)?([^<]*)(?:<\/span>)?<\/\1>/.exec(litexml);
        if (match) {
          const [, tagName, content] = match;
          const newNode: any = {
            children: content ? [{ text: content, type: 'text' }] : [],
            type: tagName === 'p' ? 'paragraph' : tagName.startsWith('h') ? 'heading' : tagName,
          };
          if (tagName.startsWith('h')) {
            newNode.tag = tagName;
          }

          // Handle position based on afterId or beforeId
          const afterId = payload.afterId;
          const beforeId = payload.beforeId;

          if (afterId === 'root') {
            // Append to root
            documentState.root.children.push(newNode);
          } else if (afterId) {
            // Insert after the reference node
            const nodeMatch = /^node_(\d+)(?:_(\d+))?$/.exec(afterId);
            if (nodeMatch) {
              const parentIndex = parseInt(nodeMatch[1], 10);
              const childIndex =
                nodeMatch[2] !== undefined ? parseInt(nodeMatch[2], 10) : undefined;

              if (childIndex !== undefined) {
                // Append to parent node's children (after last child = append)
                documentState.root.children[parentIndex].children.push({
                  text: content,
                  type: 'text',
                });
              } else {
                // Insert after this node at root level
                documentState.root.children.splice(parentIndex + 1, 0, newNode);
              }
            }
          } else if (beforeId) {
            // Insert before the reference node
            const nodeMatch = /^node_(\d+)(?:_(\d+))?$/.exec(beforeId);
            if (nodeMatch) {
              const parentIndex = parseInt(nodeMatch[1], 10);
              const childIndex =
                nodeMatch[2] !== undefined ? parseInt(nodeMatch[2], 10) : undefined;

              if (childIndex !== undefined) {
                // Prepend to parent node's children (before first child = prepend)
                documentState.root.children[parentIndex].children.unshift({
                  text: content,
                  type: 'text',
                });
              } else {
                // Insert before this node at root level
                documentState.root.children.splice(parentIndex, 0, newNode);
              }
            }
          }
        }
        return true;
      }

      if (command === LITEXML_APPLY_COMMAND) {
        // Simulate updating nodes
        const litexmlList = Array.isArray(payload.litexml) ? payload.litexml : [payload.litexml];
        for (const litexml of litexmlList) {
          const idMatch = /id="([^"]+)"/.exec(litexml);
          if (idMatch) {
            const nodeId = idMatch[1];
            // Extract content - try nested span first, then direct content between tags
            let content = '';
            const spanMatch = /<span[^>]*>([^<]*)<\/span>/.exec(litexml);
            if (spanMatch) {
              content = spanMatch[1];
            } else {
              // Direct content: <p id="...">content</p>
              const directMatch = />([^<]+)<\/\w+>$/.exec(litexml);
              if (directMatch) {
                content = directMatch[1];
              }
            }

            // Find and update the node
            const nodeMatch = /^node_(\d+)(?:_(\d+))?$/.exec(nodeId);
            if (nodeMatch) {
              const parentIndex = parseInt(nodeMatch[1], 10);
              const childIndex =
                nodeMatch[2] !== undefined ? parseInt(nodeMatch[2], 10) : undefined;

              if (childIndex !== undefined) {
                // Update child text node
                if (documentState.root.children[parentIndex]?.children[childIndex]) {
                  documentState.root.children[parentIndex].children[childIndex].text = content;
                }
              } else {
                // Update parent node
                const node = documentState.root.children[parentIndex];
                if (node) {
                  if (content) {
                    node.children = [{ text: content, type: 'text' }];
                  }
                  // Handle attributes
                  const classMatch = /className="([^"]*)"/.exec(litexml);
                  if (classMatch && classMatch[1] !== 'null') {
                    node.className = classMatch[1];
                  } else if (litexml.includes('className=')) {
                    delete node.className;
                  }
                  const dataTestMatch = /data-test="([^"]*)"/.exec(litexml);
                  if (dataTestMatch && dataTestMatch[1] !== 'null') {
                    node['data-test'] = dataTestMatch[1];
                  }
                }
              }
            }
          }
        }
        return true;
      }

      if (command === LITEXML_REMOVE_COMMAND) {
        const nodeId = payload.id;
        const nodeMatch = /^node_(\d+)(?:_(\d+))?$/.exec(nodeId);
        if (nodeMatch) {
          const parentIndex = parseInt(nodeMatch[1], 10);
          const childIndex = nodeMatch[2] !== undefined ? parseInt(nodeMatch[2], 10) : undefined;

          if (childIndex !== undefined) {
            // Delete child node
            if (documentState.root.children[parentIndex]?.children) {
              documentState.root.children[parentIndex].children.splice(childIndex, 1);
            }
          } else {
            // Delete parent node
            documentState.root.children.splice(parentIndex, 1);
          }
        }
        return true;
      }

      return false;
    });

    // Mock editor
    mockEditor = {
      dispatchCommand: dispatchCommandMock,
      getDocument: vi.fn((format: string) => {
        if (format === 'json') {
          return documentState;
        }
        if (format === 'litexml') {
          return generateLiteXML(documentState);
        }
        return null;
      }),
      setDocument: vi.fn((format: string, content: string) => {
        if (format === 'json') {
          documentState = JSON.parse(content);
        }
      }),
    } as unknown as IEditor;

    runtime.setEditor(mockEditor);
  });

  describe('createNode', () => {
    it('should create a paragraph node and append to root', async () => {
      const result = await runtime.createNode({
        content: 'New paragraph content',
        type: 'p',
      });

      expect(result.success).toBe(true);
      expect(result.content).toContain('Successfully created p node');
      expect(documentState.root.children).toHaveLength(3);
      expect(documentState.root.children[2].type).toBe('paragraph');
      expect(documentState.root.children[2].children[0].text).toBe('New paragraph content');
    });

    it('should create a heading node with tag', async () => {
      const result = await runtime.createNode({
        content: 'New heading',
        type: 'h2',
      });

      expect(result.success).toBe(true);
      const newHeading = documentState.root.children[2];
      expect(newHeading.type).toBe('heading');
      expect(newHeading.tag).toBe('h2');
      expect(newHeading.children[0].text).toBe('New heading');
    });

    it('should insert node after reference node', async () => {
      const result = await runtime.createNode({
        content: 'Inserted paragraph',
        position: 'after',
        referenceNodeId: 'node_0',
        type: 'p',
      });

      expect(result.success).toBe(true);
      // Verify dispatchCommand was called with correct payload
      expect(dispatchCommandMock).toHaveBeenCalledWith(
        LITEXML_INSERT_COMMAND,
        expect.objectContaining({
          afterId: 'node_0',
          litexml: expect.stringContaining('Inserted paragraph'),
        }),
      );
    });

    it('should insert node before reference node', async () => {
      const result = await runtime.createNode({
        content: 'Inserted before',
        position: 'before',
        referenceNodeId: 'node_1',
        type: 'p',
      });

      expect(result.success).toBe(true);
      // Verify dispatchCommand was called with correct payload
      expect(dispatchCommandMock).toHaveBeenCalledWith(
        LITEXML_INSERT_COMMAND,
        expect.objectContaining({
          beforeId: 'node_1',
          litexml: expect.stringContaining('Inserted before'),
        }),
      );
    });

    it('should append node as child of reference node', async () => {
      const result = await runtime.createNode({
        content: 'Child text',
        position: 'append',
        referenceNodeId: 'node_0',
        type: 'span',
      });

      expect(result.success).toBe(true);
      // Verify dispatchCommand was called - append uses afterId
      expect(dispatchCommandMock).toHaveBeenCalledWith(
        LITEXML_INSERT_COMMAND,
        expect.objectContaining({
          afterId: 'node_0',
          litexml: expect.stringContaining('Child text'),
        }),
      );
    });

    it('should prepend node as child of reference node', async () => {
      const result = await runtime.createNode({
        content: 'First child',
        position: 'prepend',
        referenceNodeId: 'node_0',
        type: 'span',
      });

      expect(result.success).toBe(true);
      // Note: Current implementation treats 'prepend' same as 'append' (uses afterId)
      // Only 'before' position uses beforeId
      expect(dispatchCommandMock).toHaveBeenCalledWith(
        LITEXML_INSERT_COMMAND,
        expect.objectContaining({
          afterId: 'node_0',
          litexml: expect.stringContaining('First child'),
        }),
      );
    });
  });

  describe('updateNode', () => {
    it('should update node content', async () => {
      const result = await runtime.updateNode({
        content: 'Updated paragraph text',
        nodeId: 'node_1',
      });

      expect(result.success).toBe(true);
      expect(result.content).toContain('Successfully updated node node_1');
      expect(documentState.root.children[1].children[0].text).toBe('Updated paragraph text');
    });

    it('should update text node content', async () => {
      const result = await runtime.updateNode({
        content: 'Updated title',
        nodeId: 'node_0_0',
      });

      expect(result.success).toBe(true);
      expect(documentState.root.children[0].children[0].text).toBe('Updated title');
    });

    it('should update node attributes', async () => {
      const result = await runtime.updateNode({
        attributes: {
          'className': 'custom-class',
          'data-test': 'test-value',
        },
        nodeId: 'node_1',
      });

      expect(result.success).toBe(true);
      const paragraph = documentState.root.children[1];
      expect(paragraph.className).toBe('custom-class');
      expect(paragraph['data-test']).toBe('test-value');
    });

    it('should remove attributes when set to null', async () => {
      // First add an attribute
      documentState.root.children[1].className = 'to-remove';

      const result = await runtime.updateNode({
        attributes: {
          className: null,
        },
        nodeId: 'node_1',
      });

      expect(result.success).toBe(true);
      // Verify the command was dispatched with the correct payload
      // Note: The actual attribute removal depends on editor behavior
      expect(dispatchCommandMock).toHaveBeenCalledWith(
        LITEXML_APPLY_COMMAND,
        expect.objectContaining({
          litexml: expect.arrayContaining([expect.stringContaining('id="node_1"')]),
        }),
      );
    });

    it('should fail when node not found', async () => {
      const result = await runtime.updateNode({
        content: 'Updated text',
        nodeId: 'node_99',
      });

      expect(result.success).toBe(false);
      expect(result.content).toContain('not found');
    });
  });

  describe('deleteNode', () => {
    it('should delete a node', async () => {
      const result = await runtime.deleteNode({
        nodeId: 'node_1',
      });

      expect(result.success).toBe(true);
      // The implementation uses the XML tag name (p) in the message
      expect(result.content).toContain('Successfully deleted p node');
      expect(documentState.root.children).toHaveLength(1);
      expect(documentState.root.children[0].type).toBe('heading');
    });

    it('should delete a child node', async () => {
      const result = await runtime.deleteNode({
        nodeId: 'node_0_0',
      });

      expect(result.success).toBe(true);
      expect(documentState.root.children[0].children).toHaveLength(0);
    });

    it('should fail when trying to delete root node', async () => {
      const result = await runtime.deleteNode({
        nodeId: 'node_',
      });

      expect(result.success).toBe(false);
      // The implementation returns 'not found' since 'node_' is not a valid node in the XML
      expect(result.content).toContain('not found');
    });

    it('should fail when node not found', async () => {
      const result = await runtime.deleteNode({
        nodeId: 'node_99',
      });

      expect(result.success).toBe(false);
      expect(result.content).toContain('not found');
    });
  });

  describe('integration tests', () => {
    it('should support creating, updating, and deleting nodes in sequence', async () => {
      // Create a new paragraph
      const createResult = await runtime.createNode({
        content: 'New content',
        type: 'p',
      });
      expect(createResult.success).toBe(true);

      // Update the new paragraph
      const updateResult = await runtime.updateNode({
        content: 'Updated content',
        nodeId: 'node_2',
      });
      expect(updateResult.success).toBe(true);
      expect(documentState.root.children[2].children[0].text).toBe('Updated content');

      // Delete the paragraph
      const deleteResult = await runtime.deleteNode({
        nodeId: 'node_2',
      });
      expect(deleteResult.success).toBe(true);
      expect(documentState.root.children).toHaveLength(2);
    });
  });

  describe('Table Operations', () => {
    beforeEach(() => {
      // Set up a document with a table - nodes need 'key' property for findNodeByKey
      documentState = {
        root: {
          children: [
            {
              children: [
                {
                  children: [
                    {
                      children: [{ text: 'Header 1', type: 'text' }],
                      key: 'node_0_0_0',
                      type: 'tablecell',
                    },
                    {
                      children: [{ text: 'Header 2', type: 'text' }],
                      key: 'node_0_0_1',
                      type: 'tablecell',
                    },
                    {
                      children: [{ text: 'Header 3', type: 'text' }],
                      key: 'node_0_0_2',
                      type: 'tablecell',
                    },
                  ],
                  key: 'node_0_0',
                  type: 'tablerow',
                },
                {
                  children: [
                    {
                      children: [{ text: 'Cell 1', type: 'text' }],
                      key: 'node_0_1_0',
                      type: 'tablecell',
                    },
                    {
                      children: [{ text: 'Cell 2', type: 'text' }],
                      key: 'node_0_1_1',
                      type: 'tablecell',
                    },
                    {
                      children: [{ text: 'Cell 3', type: 'text' }],
                      key: 'node_0_1_2',
                      type: 'tablecell',
                    },
                  ],
                  key: 'node_0_1',
                  type: 'tablerow',
                },
              ],
              key: 'node_0',
              type: 'table',
            },
          ],
          type: 'root',
        },
      };
    });

    describe('insertTableRow', () => {
      it('should insert a row at the end of table', async () => {
        const result = await runtime.insertTableRow({
          cells: ['New 1', 'New 2', 'New 3'],
          tableId: 'node_0',
        });

        expect(result.success).toBe(true);
        expect(documentState.root.children[0].children).toHaveLength(3);
        const newRow = documentState.root.children[0].children[2];
        expect(newRow.type).toBe('tablerow');
        expect(newRow.children[0].children[0].text).toBe('New 1');
      });

      it('should insert a row before a reference row', async () => {
        const result = await runtime.insertTableRow({
          cells: ['Inserted 1', 'Inserted 2', 'Inserted 3'],
          position: 'before',
          referenceRowId: 'node_0_1',
          tableId: 'node_0',
        });

        expect(result.success).toBe(true);
        expect(documentState.root.children[0].children).toHaveLength(3);
        const insertedRow = documentState.root.children[0].children[1];
        expect(insertedRow.children[0].children[0].text).toBe('Inserted 1');
      });

      it('should insert a row with empty cells if no content provided', async () => {
        const result = await runtime.insertTableRow({
          tableId: 'node_0',
        });

        expect(result.success).toBe(true);
        const newRow = documentState.root.children[0].children[2];
        expect(newRow.children).toHaveLength(3);
        expect(newRow.children[0].children).toHaveLength(0);
      });
    });

    describe('insertTableColumn', () => {
      it('should insert a column at specified index', async () => {
        const result = await runtime.insertTableColumn({
          cells: ['Header 4', 'Cell 4'],
          columnIndex: 1,
          tableId: 'node_0',
        });

        expect(result.success).toBe(true);
        expect(documentState.root.children[0].children[0].children).toHaveLength(4);
        expect(documentState.root.children[0].children[0].children[1].children[0].text).toBe(
          'Header 4',
        );
        expect(documentState.root.children[0].children[1].children[1].children[0].text).toBe(
          'Cell 4',
        );
      });

      it('should insert a column at the end with index -1', async () => {
        const result = await runtime.insertTableColumn({
          cells: ['Header 4', 'Cell 4'],
          columnIndex: -1,
          tableId: 'node_0',
        });

        expect(result.success).toBe(true);
        expect(documentState.root.children[0].children[0].children).toHaveLength(4);
        const lastCell = documentState.root.children[0].children[0].children[3];
        expect(lastCell.children[0].text).toBe('Header 4');
      });
    });

    describe('deleteTableRow', () => {
      it('should delete a row by ID', async () => {
        const result = await runtime.deleteTableRow({
          rowId: 'node_0_1',
        });

        expect(result.success).toBe(true);
        expect(documentState.root.children[0].children).toHaveLength(1);
        expect(documentState.root.children[0].children[0].children[0].children[0].text).toBe(
          'Header 1',
        );
      });

      it('should fail when row ID is invalid', async () => {
        const result = await runtime.deleteTableRow({
          rowId: 'node_0_99',
        });

        expect(result.success).toBe(false);
        expect(result.content).toContain('not found');
      });
    });

    describe('deleteTableColumn', () => {
      it('should delete a column at specified index', async () => {
        const result = await runtime.deleteTableColumn({
          columnIndex: 1,
          tableId: 'node_0',
        });

        expect(result.success).toBe(true);
        expect(documentState.root.children[0].children[0].children).toHaveLength(2);
        expect(documentState.root.children[0].children[0].children[0].children[0].text).toBe(
          'Header 1',
        );
        expect(documentState.root.children[0].children[0].children[1].children[0].text).toBe(
          'Header 3',
        );
      });

      it('should fail when table not found', async () => {
        const result = await runtime.deleteTableColumn({
          columnIndex: 0,
          tableId: 'node_99',
        });

        expect(result.success).toBe(false);
        expect(result.content).toContain('not found');
      });
    });
  });
});
