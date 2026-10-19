import { createStaticStyles, HtmlPreviewIframe } from '@lobehub/ui';

const styles = createStaticStyles(({ css }) => ({
  frame: css`
    display: block;
    width: 100%;
    border: 0;
  `,
}));

interface HtmlDocumentFrameProps {
  content: string;
  title?: string;
}

/**
 * The body of an HTML page document. The page is model- or user-authored, so
 * it runs in the preview's default sandbox (scripts, no same origin) and grows
 * to its own height inside the surrounding scroll container.
 */
const HtmlDocumentFrame = ({ content, title }: HtmlDocumentFrameProps) => (
  <HtmlPreviewIframe
    className={styles.frame}
    content={content}
    defaultHeight={480}
    title={title || undefined}
  />
);

export default HtmlDocumentFrame;
