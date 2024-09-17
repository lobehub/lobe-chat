import { memo, useEffect, useRef } from 'react';

interface HTMLRendererProps {
  height?: string;
  htmlContent: string;
  width?: string;
}
const HTMLRenderer = memo<HTMLRendererProps>(({ htmlContent, width = '100%', height = '100%' }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!iframeRef.current) return;

    const doc = iframeRef.current.contentDocument;
    if (!doc) return;

    doc.open();
    doc.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { margin: 0; padding: 0; }
            </style>
          </head>
          <body>${htmlContent}</body>
        </html>
      `);
    doc.close();
  }, [htmlContent]);

  return <iframe ref={iframeRef} style={{ border: 'none', height, width }} title="html-renderer" />;
});

export default HTMLRenderer;
