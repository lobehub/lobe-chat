import { Highlighter, RenderErrorMessage } from '@lobehub/ui';
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

const PluginError: RenderErrorMessage = memo(({ error, id }) => {
  const { styles } = useStyles();
  const errorBody: OpenAIErrorResponse = (error as any)?.body;

  return (
    <Flexbox className={styles.container} id={id} style={{ maxWidth: 600 }}>
      <Highlighter language={'json'}>{JSON.stringify(errorBody, null, 2)}</Highlighter>
    </Flexbox>
  );
});

export default PluginError;
