import { memo } from 'react';

import { McpUIResource } from '@/types/message/tools';
import { BuiltinRenderProps } from '@/types/tool';

interface McpUIRenderProps extends BuiltinRenderProps {
  content: {
    text?: string;
    uiResources?: McpUIResource[];
  };
}

const McpUIRender = memo<McpUIRenderProps>(({ content, messageId }) => {
  const { text, uiResources } = content || {};

  // Simple filtering: only exclude very basic completion messages
  const shouldShowText =
    text && text.trim().length > 0 && !/^(ok|done|success|completed?|rendered?)\.?$/i.test(text);

  if (!uiResources?.length && !shouldShowText) {
    return <div>No content to display</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {shouldShowText && <div>{text}</div>}

      {uiResources?.map((resource, index) => {
        if (!resource.content || !resource.type) return null;

        const key = `${messageId}-${resource.type}-${index}`;

        if (resource.type === 'html') {
          const dataUrl = `data:text/html;charset=utf-8,${encodeURIComponent(resource.content)}`;
          return (
            <iframe
              aria-label={resource.metadata?.title || 'MCP UI Content'}
              key={key}
              onLoad={(e) => {
                // Auto-resize iframe based on content
                const iframe = e.target as HTMLIFrameElement;
                try {
                  const doc = iframe.contentDocument || iframe.contentWindow?.document;
                  if (doc?.body) {
                    const height = doc.body.scrollHeight;
                    if (height > 100) {
                      iframe.style.height = `${Math.min(height + 20, 800)}px`;
                    }
                  }
                } catch (error) {
                  // Cross-origin restriction or other error, keep default height
                  console.warn('Auto-resize failed (likely cross-origin):', error);
                  // Ensure iframe has a reasonable fallback height
                  if (!iframe.style.height || iframe.style.height === '0px') {
                    iframe.style.height = '500px';
                  }
                }
              }}
              role="application"
              sandbox="allow-scripts allow-same-origin allow-forms"
              src={dataUrl}
              style={{
                border: '1px solid #e1e5e9',
                borderRadius: '8px',
                height: resource.metadata?.height || '500px',
                minHeight: '300px',
                width: '100%',
              }}
              title={resource.metadata?.title || `MCP Content ${index + 1}`}
            />
          );
        }

        if (resource.type === 'url') {
          return (
            <div
              key={key}
              style={{ border: '1px solid #e1e5e9', borderRadius: '8px', padding: '16px' }}
            >
              <a href={resource.content} rel="noopener noreferrer" target="_blank">
                {resource.metadata?.title || resource.content}
              </a>
            </div>
          );
        }

        return null;
      })}
    </div>
  );
});

McpUIRender.displayName = 'McpUIRender';

export default McpUIRender;
