import { Highlighter } from '@lobehub/ui';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

interface JsonViewerProps {
  data: object;
}

const JsonViewer = memo<JsonViewerProps>(({ data }) => {
  return (
    <Flexbox style={{ overflow: 'scroll' }}>
      <Highlighter language={'json'} style={{ overflow: 'scroll', whiteSpace: 'pre' }}>
        {JSON.stringify(data, null, 2)}
      </Highlighter>
    </Flexbox>
  );
});

export default JsonViewer;
