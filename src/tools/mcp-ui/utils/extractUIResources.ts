import { McpUIResource } from '@/types/message';

/**
 * Extract UI resources from MCP tool response
 * Supports multiple formats for parsing UI resources
 */

function extractFromStringContent(content: string): {
  textContent: string;
  uiResources: McpUIResource[];
} {
  let textContent = content;
  const uiResources: McpUIResource[] = [];

  // Parse text content for ui:// prefixed resources
  if (textContent) {
    const uiResourceRegex = /ui:\/\/(\S+)/g;
    const matches = Array.from(textContent.matchAll(uiResourceRegex));

    for (const match of matches) {
      const resourceUri = match[1];

      try {
        // Decode if it's base64 encoded
        const decodedContent = atob(resourceUri);
        const parsedResource = JSON.parse(decodedContent);

        if (parsedResource.type && parsedResource.content) {
          uiResources.push({
            content: parsedResource.content,
            metadata: parsedResource.metadata,
            type: parsedResource.type,
          });
        }
      } catch {
        // If parsing fails, treat as direct URL
        if (resourceUri.startsWith('http')) {
          uiResources.push({
            content: `ui://${resourceUri}`.replace('ui://', ''),
            type: 'url',
          });
        }
      }
    }

    // Remove ui:// resources from text content
    textContent = textContent.replaceAll(uiResourceRegex, '').trim();
  }

  return { textContent, uiResources };
}

function extractFromObjectContent(response: any): {
  textContent: string;
  uiResources: McpUIResource[];
} {
  let textContent = '';
  const uiResources: McpUIResource[] = [];

  // Handle array of MCP responses (common format)
  if (Array.isArray(response)) {
    for (const item of response) {
      if (item.type === 'text' && item.text) {
        textContent += (textContent ? '\n' : '') + item.text;
      } else if (item.type === 'resource' && item.resource) {
        // Extract UI resource from MCP resource object
        const resource = item.resource;

        // Check if this is a UI resource (uri starts with ui:// or has UI-related mimeType)
        const isUIResource =
          resource.uri?.startsWith('ui://') ||
          resource.mimeType === 'text/html' ||
          resource.mimeType === 'text/uri-list' ||
          resource.mimeType === 'application/vnd.mcp-ui.remote-dom+javascript' ||
          resource.uri?.startsWith('data:text/html');

        if (isUIResource) {
          if (resource.uri && resource.uri.startsWith('data:text/html')) {
            // Decode HTML from data URI
            const htmlContent = decodeURIComponent(resource.uri.replace('data:text/html,', ''));
            uiResources.push({
              content: htmlContent,
              metadata: {
                height: resource._meta?.height || 'auto',
                title:
                  resource.title ||
                  resource.uri?.split('/').pop() ||
                  `${resource.mimeType || 'Content'} Resource`,
                ...resource._meta,
              },
              type: 'html',
            });
          } else if (resource.text && resource.mimeType === 'text/html') {
            // HTML content in text field
            uiResources.push({
              content: resource.text,
              metadata: {
                height: resource._meta?.height || 'auto',
                title: resource.title || resource.uri?.split('/').pop() || 'HTML Document',
                ...resource._meta,
              },
              type: 'html',
            });
          } else if (resource.mimeType === 'text/uri-list' && resource.text) {
            // URL list content
            const urls = resource.text
              .split('\n')
              .filter((url: string) => url.trim() && !url.startsWith('#'));
            for (const url of urls) {
              uiResources.push({
                content: url.trim(),
                metadata: {
                  title: resource.title || resource.uri?.split('/').pop() || 'Resource Links',
                  ...resource._meta,
                },
                type: 'url',
              });
            }
          } else if (
            resource.mimeType === 'application/vnd.mcp-ui.remote-dom+javascript' &&
            resource.text
          ) {
            // Remote DOM JavaScript content (official MCP UI format)
            uiResources.push({
              content: resource.text,
              metadata: {
                height: resource._meta?.height || 'auto',
                title: resource.title || resource.uri?.split('/').pop() || 'Web Application',
                ...resource._meta,
              },
              type: 'html',
            });
          } else if (resource.uri && !resource.uri.startsWith('ui://')) {
            // External URL resource (but not ui:// internal references)
            uiResources.push({
              content: resource.uri,
              metadata: {
                title: resource.title || resource.uri.split('/').pop() || 'External Resource',
                ...resource._meta,
              },
              type: 'url',
            });
          }
        }
      }
    }

    return { textContent, uiResources };
  }

  // Handle direct UI resources array
  if (Array.isArray(response.uiResources)) {
    uiResources.push(...response.uiResources);
  }

  // Handle new MCP UI format with structured uiResources object
  if (
    response.uiResources &&
    typeof response.uiResources === 'object' &&
    !Array.isArray(response.uiResources)
  ) {
    const uiResourcesObj = response.uiResources;

    // Check if it has article content for structured UI
    if (uiResourcesObj.article && uiResourcesObj.article.content) {
      let htmlContent = uiResourcesObj.article.content;

      // Add container styling if provided
      if (uiResourcesObj.container && uiResourcesObj.container.style) {
        htmlContent = `<div style="${uiResourcesObj.container.style}">${htmlContent}</div>`;
      }

      // Add scripts if provided
      if (uiResourcesObj.container && uiResourcesObj.container.scripts) {
        const scripts = uiResourcesObj.container.scripts
          .map((script: any) => `<script>${script.code}</script>`)
          .join('\n');
        htmlContent += `\n${scripts}`;
      }

      uiResources.push({
        content: htmlContent,
        metadata: {
          height: uiResourcesObj.metaData?.height || 'auto',
          title: uiResourcesObj.metaData?.title || uiResourcesObj.article.class || 'Component',
          ...uiResourcesObj.metaData,
        },
        type: 'html',
      });

      // Only clear text content if there's no meaningful text or if explicitly requested
      if (!textContent?.trim() || uiResourcesObj.metaData?.replaceText) {
        textContent = '';
      }
    }
  }

  // Handle text content
  switch ('string') {
    case typeof response.content: {
      textContent = response.content;

      break;
    }
    case typeof response.text: {
      textContent = response.text;

      break;
    }
    case typeof response: {
      textContent = response;

      break;
    }
    // No default
  }

  // Parse text content for ui:// prefixed resources
  if (textContent) {
    const uiResourceRegex = /ui:\/\/(\S+)/g;
    const matches = Array.from(textContent.matchAll(uiResourceRegex));

    for (const match of matches) {
      const resourceUri = match[1];

      try {
        // Decode if it's base64 encoded
        const decodedContent = atob(resourceUri);
        const parsedResource = JSON.parse(decodedContent);

        if (parsedResource.type && parsedResource.content) {
          uiResources.push({
            content: parsedResource.content,
            metadata: parsedResource.metadata,
            type: parsedResource.type,
          });
        }
      } catch {
        // If parsing fails, treat as direct URL
        if (resourceUri.startsWith('http')) {
          uiResources.push({
            content: `ui://${resourceUri}`.replace('ui://', ''),
            type: 'url',
          });
        }
      }
    }

    // Remove ui:// resources from text content
    textContent = textContent.replaceAll(uiResourceRegex, '').trim();
  }

  // Handle different MIME types
  if (response.mimeType) {
    switch (response.mimeType) {
      case 'text/uri-list': {
        const urls = textContent.split('\n').filter((url) => url.trim() && !url.startsWith('#'));
        for (const url of urls) {
          uiResources.push({
            content: url.trim(),
            type: 'url',
          });
        }
        textContent = ''; // Clear text content as it's now in UI resources
        break;
      }
      case 'text/html': {
        uiResources.push({
          content: textContent,
          type: 'html',
        });
        textContent = ''; // Clear text content as it's now in UI resources
        break;
      }
    }
  }

  // Handle structured response with separate fields
  if (response.uiContent) {
    if (Array.isArray(response.uiContent)) {
      uiResources.push(...response.uiContent);
    } else if (typeof response.uiContent === 'object') {
      uiResources.push(response.uiContent);
    }
  }

  return {
    textContent,
    uiResources: uiResources.filter(
      (resource) =>
        resource.type && resource.content && ['html', 'url', 'iframe'].includes(resource.type),
    ),
  };
}

export function extractUIResources(response: any): {
  textContent: string;
  uiResources: McpUIResource[];
} {
  // Handle string responses with encoded UI resources
  if (typeof response === 'string') {
    // Check for our encoded UI resources format
    const resourceMarker = '__MCP_UI_RESOURCES__:';
    const markerIndex = response.indexOf(resourceMarker);

    if (markerIndex !== -1) {
      const textContent = response.slice(0, Math.max(0, markerIndex)).trim();
      const encodedResources = response.slice(Math.max(0, markerIndex + resourceMarker.length));

      try {
        const decoded = atob(encodedResources);
        const parsed = JSON.parse(decoded);
        return {
          textContent,
          uiResources: parsed.uiResources || [],
        };
      } catch (error) {
        console.warn('Failed to parse encoded UI resources:', error);
        return {
          textContent: response,
          uiResources: [],
        };
      }
    }

    // Try to parse as JSON (common MCP format)
    try {
      const parsed = JSON.parse(response);
      if (Array.isArray(parsed)) {
        return extractFromObjectContent(parsed);
      } else if (parsed && typeof parsed === 'object') {
        return extractFromObjectContent(parsed);
      }
    } catch {
      // Not JSON, fall through to string parsing
    }

    // Fall through to existing string parsing logic
    return extractFromStringContent(response);
  }

  if (!response || typeof response !== 'object') {
    return {
      textContent: typeof response === 'string' ? response : '',
      uiResources: [],
    };
  }

  return extractFromObjectContent(response);
}

/**
 * Check if a response contains UI resources
 */
export function hasUIResources(response: any): boolean {
  const { uiResources } = extractUIResources(response);
  return uiResources.length > 0;
}
