import { describe, expect, it } from 'vitest';

import type { Message, MessageGroupMetadata } from '../../types';
import { BranchResolver } from '../BranchResolver';
import { FlatListBuilder } from '../FlatListBuilder';
import { MessageCollector } from '../MessageCollector';
import { MessageTransformer } from '../MessageTransformer';

describe('FlatListBuilder', () => {
  const createBuilder = (
    messages: Message[],
    messageGroupMap: Map<string, MessageGroupMetadata> = new Map(),
  ) => {
    const messageMap = new Map<string, Message>();
    const childrenMap = new Map<string | null, string[]>();

    // Build maps
    messages.forEach((msg) => {
      messageMap.set(msg.id, msg);
      const parentId = msg.parentId || null;
      if (!childrenMap.has(parentId)) {
        childrenMap.set(parentId, []);
      }
      childrenMap.get(parentId)!.push(msg.id);
    });

    const branchResolver = new BranchResolver();
    const messageCollector = new MessageCollector(messageMap, childrenMap);
    const messageTransformer = new MessageTransformer();

    return new FlatListBuilder(
      messageMap,
      messageGroupMap,
      childrenMap,
      branchResolver,
      messageCollector,
      messageTransformer,
    );
  };

  describe('flatten', () => {
    it('should flatten simple message chain', () => {
      const messages: Message[] = [
        {
          content: 'Hello',
          createdAt: 0,
          id: 'msg-1',
          meta: {},
          role: 'user',
          updatedAt: 0,
        },
        {
          content: 'Hi',
          createdAt: 0,
          id: 'msg-2',
          meta: {},
          parentId: 'msg-1',
          role: 'assistant',
          updatedAt: 0,
        },
      ];

      const builder = createBuilder(messages);
      const result = builder.flatten(messages);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('msg-1');
      expect(result[1].id).toBe('msg-2');
    });

    it('should create assistant group virtual message', () => {
      const messages: Message[] = [
        {
          content: 'Request',
          createdAt: 0,
          id: 'msg-1',
          meta: {},
          role: 'user',
          updatedAt: 0,
        },
        {
          content: 'Using tool',
          createdAt: 0,
          id: 'msg-2',
          meta: {},
          metadata: { totalInputTokens: 10, totalOutputTokens: 20 },
          parentId: 'msg-1',
          role: 'assistant',
          tools: [
            { apiName: 'test', arguments: '{}', id: 'tool-1', identifier: 'test', type: 'default' },
          ],
          updatedAt: 0,
        },
        {
          content: 'Tool result',
          createdAt: 0,
          id: 'tool-1',
          meta: {},
          parentId: 'msg-2',
          role: 'tool',
          tool_call_id: 'tool-1',
          updatedAt: 0,
        },
      ];

      const builder = createBuilder(messages);
      const result = builder.flatten(messages);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('msg-1');
      expect(result[1].role).toBe('assistantGroup');
      expect(result[1].children).toHaveLength(1);
      expect(result[1].usage).toBeDefined();
    });

    it('should handle user message with branches', () => {
      const messages: Message[] = [
        {
          content: 'User',
          createdAt: 0,
          id: 'msg-1',
          meta: {},
          metadata: { activeBranchIndex: 0 },
          role: 'user',
          updatedAt: 0,
        },
        {
          content: 'Branch 1',
          createdAt: 0,
          id: 'msg-2',
          meta: {},
          parentId: 'msg-1',
          role: 'assistant',
          updatedAt: 0,
        },
        {
          content: 'Branch 2',
          createdAt: 0,
          id: 'msg-3',
          meta: {},
          parentId: 'msg-1',
          role: 'assistant',
          updatedAt: 0,
        },
      ];

      const builder = createBuilder(messages);
      const result = builder.flatten(messages);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('msg-1');
      expect(result[1].id).toBe('msg-2'); // active branch
    });

    it('should handle assistant message with branches', () => {
      const messages: Message[] = [
        {
          content: 'User',
          createdAt: 0,
          id: 'msg-1',
          meta: {},
          role: 'user',
          updatedAt: 0,
        },
        {
          content: 'Assistant',
          createdAt: 0,
          id: 'msg-2',
          meta: {},
          metadata: { activeBranchIndex: 1 },
          parentId: 'msg-1',
          role: 'assistant',
          updatedAt: 0,
        },
        {
          content: 'Branch 1',
          createdAt: 0,
          id: 'msg-3',
          meta: {},
          parentId: 'msg-2',
          role: 'user',
          updatedAt: 0,
        },
        {
          content: 'Branch 2',
          createdAt: 0,
          id: 'msg-4',
          meta: {},
          parentId: 'msg-2',
          role: 'user',
          updatedAt: 0,
        },
      ];

      const builder = createBuilder(messages);
      const result = builder.flatten(messages);

      expect(result).toHaveLength(3);
      expect(result[0].id).toBe('msg-1');
      expect(result[1].id).toBe('msg-2');
      expect(result[2].id).toBe('msg-4'); // active branch (index 1)
    });

    it('should create compare message from message group', () => {
      const messages: Message[] = [
        {
          content: 'Compare 1',
          createdAt: 0,
          groupId: 'group-1',
          id: 'msg-1',
          meta: {},
          metadata: { activeColumn: true },
          role: 'assistant',
          updatedAt: 0,
        },
        {
          content: 'Compare 2',
          createdAt: 0,
          groupId: 'group-1',
          id: 'msg-2',
          meta: {},
          role: 'assistant',
          updatedAt: 0,
        },
      ];

      const messageGroupMap = new Map<string, MessageGroupMetadata>([
        ['group-1', { id: 'group-1', mode: 'compare' }],
      ]);

      const builder = createBuilder(messages, messageGroupMap);
      const result = builder.flatten(messages);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('group-1');
      expect(result[0].role).toBe('compare');
      expect((result[0] as any).columns).toHaveLength(2);
      expect((result[0] as any).activeColumnId).toBe('msg-1');
    });

    it('should create compare message from user metadata', () => {
      const messages: Message[] = [
        {
          content: 'User',
          createdAt: 0,
          id: 'msg-1',
          meta: {},
          metadata: { compare: true },
          role: 'user',
          updatedAt: 0,
        },
        {
          content: 'Assistant 1',
          createdAt: 0,
          id: 'msg-2',
          meta: {},
          metadata: { activeColumn: true },
          parentId: 'msg-1',
          role: 'assistant',
          updatedAt: 0,
        },
        {
          content: 'Assistant 2',
          createdAt: 0,
          id: 'msg-3',
          meta: {},
          parentId: 'msg-1',
          role: 'assistant',
          updatedAt: 0,
        },
      ];

      const builder = createBuilder(messages);
      const result = builder.flatten(messages);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('msg-1');
      expect(result[1].role).toBe('compare');
      expect((result[1] as any).activeColumnId).toBe('msg-2');
    });

    it('should handle empty messages array', () => {
      const builder = createBuilder([]);
      const result = builder.flatten([]);

      expect(result).toHaveLength(0);
    });

    it('should follow active branch correctly', () => {
      const messages: Message[] = [
        {
          content: 'User',
          createdAt: 0,
          id: 'msg-1',
          meta: {},
          metadata: { activeBranchIndex: 0 },
          role: 'user',
          updatedAt: 0,
        },
        {
          content: 'Branch 1',
          createdAt: 0,
          id: 'msg-2',
          meta: {},
          parentId: 'msg-1',
          role: 'assistant',
          updatedAt: 0,
        },
        {
          content: 'Branch 2',
          createdAt: 0,
          id: 'msg-3',
          meta: {},
          parentId: 'msg-1',
          role: 'assistant',
          updatedAt: 0,
        },
        {
          content: 'Follow-up',
          createdAt: 0,
          id: 'msg-4',
          meta: {},
          parentId: 'msg-2',
          role: 'user',
          updatedAt: 0,
        },
      ];

      const builder = createBuilder(messages);
      const result = builder.flatten(messages);

      expect(result).toHaveLength(3);
      expect(result[0].id).toBe('msg-1');
      expect(result[1].id).toBe('msg-2');
      expect(result[2].id).toBe('msg-4');
    });

    it('should handle assistant group in compare columns', () => {
      const messages: Message[] = [
        {
          content: 'User',
          createdAt: 0,
          id: 'msg-1',
          meta: {},
          metadata: { compare: true },
          role: 'user',
          updatedAt: 0,
        },
        {
          content: 'Assistant 1',
          createdAt: 0,
          id: 'msg-2',
          meta: {},
          parentId: 'msg-1',
          role: 'assistant',
          tools: [
            { apiName: 'test', arguments: '{}', id: 'tool-1', identifier: 'test', type: 'default' },
          ],
          updatedAt: 0,
        },
        {
          content: 'Tool result',
          createdAt: 0,
          id: 'tool-1',
          meta: {},
          parentId: 'msg-2',
          role: 'tool',
          tool_call_id: 'tool-1',
          updatedAt: 0,
        },
        {
          content: 'Assistant 2',
          createdAt: 0,
          id: 'msg-3',
          meta: {},
          parentId: 'msg-1',
          role: 'assistant',
          updatedAt: 0,
        },
      ];

      const builder = createBuilder(messages);
      const result = builder.flatten(messages);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('msg-1');
      expect(result[1].role).toBe('compare');
      const columns = (result[1] as any).columns;
      expect(columns).toHaveLength(2);
      // First column should be an assistant group
      expect(columns[0][0].role).toBe('assistantGroup');
      // Second column should be a regular message
      expect(columns[1][0].id).toBe('msg-3');
    });

    it('should include follow-up messages after assistant chain', () => {
      const messages: Message[] = [
        {
          content: 'User request',
          createdAt: 0,
          id: 'msg-1',
          meta: {},
          role: 'user',
          updatedAt: 0,
        },
        {
          content: 'Using tool',
          createdAt: 0,
          id: 'msg-2',
          meta: {},
          parentId: 'msg-1',
          role: 'assistant',
          tools: [
            { apiName: 'test', arguments: '{}', id: 'tool-1', identifier: 'test', type: 'default' },
          ],
          updatedAt: 0,
        },
        {
          content: 'Tool result',
          createdAt: 0,
          id: 'tool-1',
          meta: {},
          parentId: 'msg-2',
          role: 'tool',
          tool_call_id: 'tool-1',
          updatedAt: 0,
        },
        {
          content: 'Response based on tool',
          createdAt: 0,
          id: 'msg-3',
          meta: {},
          parentId: 'tool-1',
          role: 'assistant',
          updatedAt: 0,
        },
        {
          content: 'User follow-up',
          createdAt: 0,
          id: 'msg-4',
          meta: {},
          parentId: 'msg-3',
          role: 'user',
          updatedAt: 0,
        },
      ];

      const builder = createBuilder(messages);
      const result = builder.flatten(messages);

      // Critical: msg-4 should be included
      expect(result).toHaveLength(3);
      expect(result[0].id).toBe('msg-1');
      expect(result[1].role).toBe('assistantGroup');
      expect(result[2].id).toBe('msg-4');
    });

    it('should handle user reply to tool message', () => {
      const messages: Message[] = [
        {
          content: 'User request',
          createdAt: 0,
          id: 'msg-1',
          meta: {},
          role: 'user',
          updatedAt: 0,
        },
        {
          content: 'Using tool',
          createdAt: 0,
          id: 'msg-2',
          meta: {},
          parentId: 'msg-1',
          role: 'assistant',
          tools: [
            { apiName: 'test', arguments: '{}', id: 'tool-1', identifier: 'test', type: 'default' },
          ],
          updatedAt: 0,
        },
        {
          content: 'Tool result',
          createdAt: 0,
          id: 'tool-1',
          meta: {},
          parentId: 'msg-2',
          role: 'tool',
          tool_call_id: 'tool-1',
          updatedAt: 0,
        },
        {
          content: 'User reply to tool',
          createdAt: 0,
          id: 'msg-3',
          meta: {},
          parentId: 'tool-1',
          role: 'user',
          updatedAt: 0,
        },
      ];

      const builder = createBuilder(messages);
      const result = builder.flatten(messages);

      // msg-3 should be included even though it's a reply to tool
      expect(result).toHaveLength(3);
      expect(result[0].id).toBe('msg-1');
      expect(result[1].role).toBe('assistantGroup');
      expect(result[2].id).toBe('msg-3');
    });
  });
});
