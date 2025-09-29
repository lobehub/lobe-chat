/**
 * Test examples for MCP UI integration
 * This file demonstrates how MCP UI resources should be structured
 */
import { McpUIResource } from '@/types/message';

// Example 1: HTML UI Resource
export const htmlUIResource: McpUIResource = {
  content: `
    <div style="padding: 20px; background: #f5f5f5; border-radius: 8px;">
      <h3>Interactive MCP UI Component</h3>
      <p>This is an example of HTML content rendered from an MCP server.</p>
      <button onclick="alert('Button clicked!')">Click me</button>
    </div>
  `,
  metadata: {
    height: '200px',
    title: 'HTML Widget',
  },
  type: 'html',
};

// Example 2: URL UI Resource
export const urlUIResource: McpUIResource = {
  content: 'https://example.com/widget',
  metadata: {
    height: '400px',
    title: 'External Widget',
  },
  type: 'url',
};

// Example 3: Iframe UI Resource
export const iframeUIResource: McpUIResource = {
  content: 'data:text/html,<h1>Iframe Content</h1><p>This is embedded content</p>',
  metadata: {
    height: '300px',
    title: 'Embedded Content',
  },
  type: 'iframe',
};

// Example MCP response with UI resources
export const mcpResponseWithUI = {
  content: 'Here are the search results with an interactive chart:',
  uiResources: [
    htmlUIResource,
    {
      content: `
        <div style="padding: 16px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 8px;">
          <h4>Chart Visualization</h4>
          <div style="height: 200px; background: rgba(255,255,255,0.1); border-radius: 4px; display: flex; align-items: center; justify-content: center;">
            <span>📊 Interactive Chart Placeholder</span>
          </div>
        </div>
      `,
      metadata: {
        height: '300px',
        title: 'Data Visualization',
      },
      type: 'html' as const,
    },
  ],
};

// Example response with ui:// prefix
export const uiPrefixResponse = {
  content: `
    Search results found.
    ui://eyJ0eXBlIjoiaHRtbCIsImNvbnRlbnQiOiI8ZGl2PkludGVyYWN0aXZlIFJlc3VsdHM8L2Rpdj4ifQ==
    Additional text content here.
  `,
};

// Example MIME type responses
export const mimeTypeHTMLResponse = {
  content: '<div><h1>HTML Content</h1></div>',
  mimeType: 'text/html',
};

export const mimeTypeURLResponse = {
  content: 'https://example.com/widget\nhttps://another-widget.com',
  mimeType: 'text/uri-list',
};
