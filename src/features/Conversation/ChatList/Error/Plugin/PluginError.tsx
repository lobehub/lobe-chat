import { Highlighter, RenderErrorMessage } from '@lobehub/ui';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

interface OpenAIError {
  code: 'invalid_api_key' | string;
  message: string;
  param?: any;
  type: string;
}

interface OpenAIErrorResponse {
  error: OpenAIError;
}

const PluginError: RenderErrorMessage['Render'] = memo(({ error, id }) => {
  const errorBody: OpenAIErrorResponse = (error as any)?.body;

  return (
    <Flexbox id={id} style={{ maxWidth: 600 }}>
      <Highlighter copyButtonSize={'small'} language={'json'} type={'pure'}>
        {JSON.stringify(errorBody, null, 2)}
      </Highlighter>
    </Flexbox>
  );
});

export default PluginError;
