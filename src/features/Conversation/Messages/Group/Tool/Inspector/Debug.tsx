import { Highlighter } from '@lobehub/ui';
import { Tabs } from 'antd';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import PluginResult from './PluginResult';
import PluginState from './PluginState';

interface DebugProps {
  apiName: string;
  identifier: string;
  requestArgs?: string;
  result?: { content: string | null; error?: any; state?: any };
  toolCallId: string;
  type?: string;
}

const Debug = memo<DebugProps>(({ result, requestArgs, toolCallId, apiName, identifier, type }) => {
  const { t } = useTranslation('plugin');

  const params = useMemo(() => {
    try {
      return JSON.stringify(JSON.parse(requestArgs || ''), null, 2);
    } catch {
      return '';
    }
  }, [requestArgs]);

  const functionCall = useMemo(() => {
    return {
      apiName,
      arguments: requestArgs,
      id: toolCallId,
      identifier,
      type,
    };
  }, [requestArgs, toolCallId, apiName, identifier, type]);

  return (
    <Tabs
      items={[
        {
          children: <Highlighter language={'json'}>{params}</Highlighter>,
          key: 'arguments',
          label: t('debug.arguments'),
        },
        {
          children: <PluginResult content={result?.content} />,
          key: 'response',
          label: t('debug.response'),
        },
        {
          children: (
            <Highlighter language={'json'}>{JSON.stringify(functionCall, null, 2)}</Highlighter>
          ),
          key: 'function_call',
          label: t('debug.function_call'),
        },
        {
          children: <PluginState state={result?.state} />,
          key: 'pluginState',
          label: t('debug.pluginState'),
        },
      ]}
      style={{ display: 'grid', maxWidth: 800, minWidth: 400 }}
    />
  );
});

export default Debug;
