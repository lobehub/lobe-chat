import { Highlighter } from '@lobehub/ui';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { useStyles } from '../style';

interface OpenAIError {
  code: 'invalid_api_key' | string;
  message: string;
  param?: any;
  type: string;
}

interface OpenAIErrorResponse {
  error: OpenAIError;
}

const PluginError = memo<{ content: OpenAIErrorResponse; id: string }>(({ content, id }) => {
  const { styles } = useStyles();

  return (
    <Flexbox className={styles.container} style={{ maxWidth: 600 }}>
      <Highlighter language={'json'}>{JSON.stringify(content, null, 2)}</Highlighter>
    </Flexbox>
  );
});

export default PluginError;
