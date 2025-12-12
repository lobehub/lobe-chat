import { describe, expect, it } from 'vitest';

import type { PipelineContext } from '../../types';
import { type PageEditorContext, PageEditorContextInjector } from '../PageEditorContextInjector';

describe('PageEditorContextInjector', () => {
  const createContext = (messages: any[] = []): PipelineContext => ({
    initialState: {
      messages: [],
      model: 'test-model',
      provider: 'test-provider',
    },
    isAborted: false,
    messages,
    metadata: {
      maxTokens: 4000,
      model: 'test-model',
    },
  });

  // Minimal page context for predictable output
  const createMinimalPageContext = (): PageEditorContext => ({
    content: 'Doc content',
  });

  describe('injection position', () => {
    it('should append context to the last user message', async () => {
      const injector = new PageEditorContextInjector({
        enabled: true,
        pageContext: createMinimalPageContext(),
      });

      const context = createContext([
        { content: 'First question', role: 'user' },
        { content: 'First answer', role: 'assistant' },
        { content: 'Second question', role: 'user' },
      ]);

      const result = await injector.process(context);

      expect(result.messages).toHaveLength(3);
      expect(result.messages[0].content).toBe('First question');
      expect(result.messages[1].content).toBe('First answer');
      expect(result.messages[2].content).toBe(`Second question

<!-- SYSTEM CONTEXT (NOT PART OF USER QUERY) -->
<context.instruction>following part contains context information injected by the system. Please follow these instructions:

1. Always prioritize handling user-visible content.
2. the context is only required when user's queries rely on it.
</context.instruction>
<current_page_context>
<instruction>This is the current page/document context. The document uses an XML-based structure with unique node IDs. Use the Document tools (initPage, editTitle, etc.) to read and modify the page content when the user asks.</instruction>
<content_preview length="11">Doc content</content_preview>
</current_page_context>
<!-- END SYSTEM CONTEXT -->`);
    });

    it('should append to the only user message when there is just one', async () => {
      const injector = new PageEditorContextInjector({
        enabled: true,
        pageContext: createMinimalPageContext(),
      });

      const context = createContext([{ content: 'Only question', role: 'user' }]);

      const result = await injector.process(context);

      expect(result.messages).toHaveLength(1);
      expect(result.messages[0].content).toBe(`Only question

<!-- SYSTEM CONTEXT (NOT PART OF USER QUERY) -->
<context.instruction>following part contains context information injected by the system. Please follow these instructions:

1. Always prioritize handling user-visible content.
2. the context is only required when user's queries rely on it.
</context.instruction>
<current_page_context>
<instruction>This is the current page/document context. The document uses an XML-based structure with unique node IDs. Use the Document tools (initPage, editTitle, etc.) to read and modify the page content when the user asks.</instruction>
<content_preview length="11">Doc content</content_preview>
</current_page_context>
<!-- END SYSTEM CONTEXT -->`);
    });
  });

  describe('injection format with document metadata', () => {
    it('should include document metadata in injection', async () => {
      const injector = new PageEditorContextInjector({
        enabled: true,
        pageContext: {
          document: {
            id: 'doc-456',
            title: 'My Title',
          },
        },
      });

      const context = createContext([{ content: 'Question', role: 'user' }]);
      const result = await injector.process(context);

      expect(result.messages[0].content).toBe(`Question

<!-- SYSTEM CONTEXT (NOT PART OF USER QUERY) -->
<context.instruction>following part contains context information injected by the system. Please follow these instructions:

1. Always prioritize handling user-visible content.
2. the context is only required when user's queries rely on it.
</context.instruction>
<current_page_context>
<instruction>This is the current page/document context. The document uses an XML-based structure with unique node IDs. Use the Document tools (initPage, editTitle, etc.) to read and modify the page content when the user asks.</instruction>
<document_metadata>
  <id>doc-456</id>
  <title>My Title</title>
</document_metadata>
</current_page_context>
<!-- END SYSTEM CONTEXT -->`);
    });

    it('should include full document metadata', async () => {
      const injector = new PageEditorContextInjector({
        enabled: true,
        pageContext: {
          document: {
            id: 'doc-123',
            title: 'Test',
            slug: 'test-slug',
            fileType: 'md',
            totalCharCount: 100,
            totalLineCount: 10,
          },
        },
      });

      const context = createContext([{ content: 'Q', role: 'user' }]);
      const result = await injector.process(context);

      expect(result.messages[0].content).toBe(`Q

<!-- SYSTEM CONTEXT (NOT PART OF USER QUERY) -->
<context.instruction>following part contains context information injected by the system. Please follow these instructions:

1. Always prioritize handling user-visible content.
2. the context is only required when user's queries rely on it.
</context.instruction>
<current_page_context>
<instruction>This is the current page/document context. The document uses an XML-based structure with unique node IDs. Use the Document tools (initPage, editTitle, etc.) to read and modify the page content when the user asks.</instruction>
<document_metadata>
  <id>doc-123</id>
  <title>Test</title>
  <slug>test-slug</slug>
  <fileType>md</fileType>
  <totalCharCount>100</totalCharCount>
  <totalLineCount>10</totalLineCount>
</document_metadata>
</current_page_context>
<!-- END SYSTEM CONTEXT -->`);
    });
  });

  describe('skip conditions', () => {
    it('should skip injection when disabled', async () => {
      const injector = new PageEditorContextInjector({
        enabled: false,
        pageContext: createMinimalPageContext(),
      });

      const context = createContext([{ content: 'Question', role: 'user' }]);
      const result = await injector.process(context);

      expect(result.messages[0].content).toBe('Question');
      expect(result.metadata.pageEditorContextInjected).toBeUndefined();
    });

    it('should skip injection when pageContext is not provided', async () => {
      const injector = new PageEditorContextInjector({
        enabled: true,
      });

      const context = createContext([{ content: 'Question', role: 'user' }]);
      const result = await injector.process(context);

      expect(result.messages[0].content).toBe('Question');
      expect(result.metadata.pageEditorContextInjected).toBeUndefined();
    });

    it('should skip injection when no user messages exist', async () => {
      const injector = new PageEditorContextInjector({
        enabled: true,
        pageContext: createMinimalPageContext(),
      });

      const context = createContext([{ content: 'System message', role: 'system' }]);
      const result = await injector.process(context);

      expect(result.messages).toHaveLength(1);
      expect(result.messages[0].content).toBe('System message');
    });

    it('should skip injection when pageContext is empty', async () => {
      const injector = new PageEditorContextInjector({
        enabled: true,
        pageContext: {},
      });

      const context = createContext([{ content: 'Question', role: 'user' }]);
      const result = await injector.process(context);

      expect(result.messages[0].content).toBe('Question');
    });
  });

  describe('metadata', () => {
    it('should set pageEditorContextInjected metadata to true', async () => {
      const injector = new PageEditorContextInjector({
        enabled: true,
        pageContext: createMinimalPageContext(),
      });

      const context = createContext([{ content: 'Question', role: 'user' }]);
      const result = await injector.process(context);

      expect(result.metadata.pageEditorContextInjected).toBe(true);
    });
  });

  describe('multimodal messages', () => {
    it('should append to array content with text parts', async () => {
      const injector = new PageEditorContextInjector({
        enabled: true,
        pageContext: createMinimalPageContext(),
      });

      const context = createContext([
        {
          content: [
            { text: 'User question', type: 'text' },
            { image_url: { url: 'http://example.com/image.png' }, type: 'image_url' },
          ],
          role: 'user',
        },
      ]);

      const result = await injector.process(context);

      expect(result.messages[0].content[0].text).toBe(`User question

<!-- SYSTEM CONTEXT (NOT PART OF USER QUERY) -->
<context.instruction>following part contains context information injected by the system. Please follow these instructions:

1. Always prioritize handling user-visible content.
2. the context is only required when user's queries rely on it.
</context.instruction>
<current_page_context>
<instruction>This is the current page/document context. The document uses an XML-based structure with unique node IDs. Use the Document tools (initPage, editTitle, etc.) to read and modify the page content when the user asks.</instruction>
<content_preview length="11">Doc content</content_preview>
</current_page_context>
<!-- END SYSTEM CONTEXT -->`);
      expect(result.messages[0].content[1]).toEqual({
        image_url: { url: 'http://example.com/image.png' },
        type: 'image_url',
      });
    });
  });

  describe('custom formatPageContext', () => {
    it('should use custom format function when provided', async () => {
      const customFormat = (ctx: PageEditorContext) => `Custom: ${ctx.document?.title}`;

      const injector = new PageEditorContextInjector({
        enabled: true,
        formatPageContext: customFormat,
        pageContext: { document: { id: '1', title: 'Custom Title' } },
      });

      const context = createContext([{ content: 'Question', role: 'user' }]);
      const result = await injector.process(context);

      expect(result.messages[0].content).toBe(`Question

<!-- SYSTEM CONTEXT (NOT PART OF USER QUERY) -->
<context.instruction>following part contains context information injected by the system. Please follow these instructions:

1. Always prioritize handling user-visible content.
2. the context is only required when user's queries rely on it.
</context.instruction>
<current_page_context>
Custom: Custom Title
</current_page_context>
<!-- END SYSTEM CONTEXT -->`);
    });
  });
});
