import { memo } from 'react';

import HTMLRenderer from './HTMLRender';
import SVGRender from './SVGRender';

const Renderer = memo<{ content: string; type?: string }>(({ content, type }) => {
  switch (type) {
    case 'image/svg+xml': {
      return <SVGRender content={content} />;
    }

    default: {
      return <HTMLRenderer htmlContent={content} />;
    }
  }
});

export default Renderer;
