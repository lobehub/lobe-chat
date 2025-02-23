import { Highlighter } from '@lobehub/ui';
import { Tabs } from 'antd';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import PluginResult from './PluginResultJSON';

interface DebugProps {
  payload: object;
  requestArgs?: string;
  toolCallId: string;
}

const Debug = memo<DebugProps>(({ payload, requestArgs, toolCallId }) => {
  const { t } = useTranslation('plugin');
  let params;
  try {
    params = JSON.stringify(JSON.parse(requestArgs || ''), null, 2);
  } catch {
    params = '';
  }

  return (
    <Tabs
      items={[
        {
          children: <Highlighter language={'json'}>{params}</Highlighter>,
          key: 'arguments',
          label: t('debug.arguments'),
        },
        {
          children: <Highlighter language={'json'}>{JSON.stringify(payload, null, 2)}</Highlighter>,
          key: 'function_call',
          label: t('debug.function_call'),
        },
        {
          children: <PluginResult toolCallId={toolCallId} />,
          key: 'response',
          label: t('debug.response'),
        },
      ]}
      style={{ display: 'grid', maxWidth: 800, minWidth: 400 }}
    />
  );
});
export default Debug;
