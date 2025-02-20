import { Markdown, Mermaid } from '@lobehub/ui';
import dynamic from 'next/dynamic';
import { memo } from 'react';

import HTMLRenderer from './HTML';
import SVGRender from './SVG';

const ReactRenderer = dynamic(() => import('./React'), { ssr: false });

const Renderer = memo<{ content: string; type?: string }>(({ content, type }) => {
  switch (type) {
    case 'application/lobe.artifacts.react': {
      return <ReactRenderer code={content} />;
    }

    case 'image/svg+xml': {
      return <SVGRender content={content} />;
    }

    case 'application/lobe.artifacts.mermaid': {
      return <Mermaid type={'pure'}>{content}</Mermaid>;
    }

    case 'text/markdown': {
      return <Markdown style={{ overflow: 'auto' }}>{content}</Markdown>;
    }

    default: {
      return <HTMLRenderer htmlContent={content} />;
    }
  }
});

export default Renderer;
