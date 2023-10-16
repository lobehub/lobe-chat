import { Highlighter, RenderErrorMessage } from '@lobehub/ui';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import OpenAPIKey from './OpenAPIKey';
import { useStyles } from './style';

interface OpenAIError {
  code: 'invalid_api_key' | string;
  message: string;
  param?: any;
  type: string;
}

interface OpenAIErrorResponse {
  error: OpenAIError;
}

const OpenAiBizError: RenderErrorMessage = memo(({ error, id, ...props }) => {
  const { styles } = useStyles();

  const errorBody: OpenAIErrorResponse = (error as any)?.body;

  const errorCode = errorBody.error?.code;

  if (errorCode === 'invalid_api_key') return <OpenAPIKey error={error} id={id} {...props} />;

  return (
    <Flexbox className={styles.container} style={{ maxWidth: 600 }}>
      <Highlighter language={'json'}>{JSON.stringify(errorBody, null, 2)}</Highlighter>
    </Flexbox>
  );
});

export default OpenAiBizError;
