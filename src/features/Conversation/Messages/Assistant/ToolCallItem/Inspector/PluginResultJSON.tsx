import { Highlighter } from '@lobehub/ui';
import { memo } from 'react';

export interface FunctionMessageProps {
  content: string;
}

const PluginResult = memo<FunctionMessageProps>(({ content }) => {
  let data;

  try {
    data = JSON.stringify(JSON.parse(content), null, 2);
  } catch {
    data = content;
  }

  return (
    <Highlighter language={'json'} style={{ maxHeight: 200, maxWidth: 800, overflow: 'scroll' }}>
      {data}
    </Highlighter>
  );
});

export default PluginResult;
