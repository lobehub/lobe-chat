import { Loading3QuartersOutlined } from '@ant-design/icons';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { PluginsRender } from '@/plugins/Render';
import { ChatMessage } from '@/types/chatMessage';

import PluginResult from './PluginResultRender';

export interface FunctionMessageProps extends ChatMessage {
  loading?: boolean;
}

const PluginMessage = memo<FunctionMessageProps>(({ content, name }) => {
  const { t } = useTranslation('plugin');

  const Render = PluginsRender[name || ''];

  let isJSON = true;
  try {
    JSON.parse(content);
  } catch {
    isJSON = false;
  }

  if (!isJSON) {
    return (
      <Flexbox gap={8} horizontal>
        <div>
          <Loading3QuartersOutlined spin />
        </div>
        {t('loading.content')}
      </Flexbox>
    );
  }

  if (Render) {
    return <Render content={JSON.parse(content)} name={name || 'unknown'} />;
  }

  return <PluginResult content={content} />;
});

export default PluginMessage;
