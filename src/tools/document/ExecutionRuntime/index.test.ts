import { IEditor } from '@lobehub/editor';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PageAgentExecutionRuntime } from './index';

describe('PageAgentExecutionRuntime - Node CRUD Operations', () => {
  let runtime: PageAgentExecutionRuntime;
  let mockEditor: IEditor;
  let documentState: any;

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

    // Mock editor
    mockEditor = {
      getDocument: vi.fn((format: string) => {
        if (format === 'json') {
          return documentState;
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
      expect(documentState.root.children).toHaveLength(3);
      expect(documentState.root.children[1].children[0].text).toBe('Inserted paragraph');
      expect(documentState.root.children[2].children[0].text).toBe('This is a paragraph');
    });

    it('should insert node before reference node', async () => {
      const result = await runtime.createNode({
        content: 'Inserted before',
        position: 'before',
        referenceNodeId: 'node_1',
        type: 'p',
      });

      expect(result.success).toBe(true);
      expect(documentState.root.children).toHaveLength(3);
      expect(documentState.root.children[1].children[0].text).toBe('Inserted before');
      expect(documentState.root.children[2].children[0].text).toBe('This is a paragraph');
    });

    it('should append node as child of reference node', async () => {
      const result = await runtime.createNode({
        content: 'Child text',
        position: 'append',
        referenceNodeId: 'node_0',
        type: 'span',
      });

      expect(result.success).toBe(true);
      const heading = documentState.root.children[0];
      expect(heading.children).toHaveLength(2);
      expect(heading.children[1].text).toBe('Child text');
    });

    it('should prepend node as child of reference node', async () => {
      const result = await runtime.createNode({
        content: 'First child',
        position: 'prepend',
        referenceNodeId: 'node_0',
        type: 'span',
      });

      expect(result.success).toBe(true);
      const heading = documentState.root.children[0];
      expect(heading.children).toHaveLength(2);
      expect(heading.children[0].text).toBe('First child');
      expect(heading.children[1].text).toBe('Title');
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
      expect(documentState.root.children[1].className).toBeUndefined();
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
      expect(result.content).toContain('Successfully deleted paragraph node');
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
      expect(result.content).toContain('Invalid node ID format');
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
});
