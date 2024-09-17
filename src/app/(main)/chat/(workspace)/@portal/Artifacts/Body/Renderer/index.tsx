import dynamic from 'next/dynamic';
import { memo } from 'react';

import HTMLRenderer from './HTMLRender';
import SVGRender from './SVGRender';

const ReactRenderer = dynamic(() => import('./ReactRenderer'), { ssr: false });

const Renderer = memo<{ content: string; type?: string }>(({ content, type }) => {
  switch (type) {
    case 'application/lobe.artifacts.react': {
      return <ReactRenderer code={content} />;
    }

    case 'image/svg+xml': {
      return <SVGRender content={content} />;
    }

    default: {
      return <HTMLRenderer htmlContent={content} />;
    }
  }
});

export default Renderer;
