import { sanitizeMermaidContent } from '@lobechat/utils/client';
import { Mermaid } from '@lobehub/ui';
import { useMemo } from 'react';

interface MermaidRendererProps {
  content: string;
}

const MermaidRenderer = ({ content }: MermaidRendererProps) => {
  // Sanitize Mermaid content to prevent XSS attacks
  const sanitizedContent = useMemo(() => sanitizeMermaidContent(content), [content]);

  return <Mermaid variant={'borderless'}>{sanitizedContent}</Mermaid>;
};

export default MermaidRenderer;
