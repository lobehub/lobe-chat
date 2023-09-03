import { Loading3QuartersOutlined } from '@ant-design/icons';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { usePluginStore } from '@/store/plugin';
import { ChatMessage } from '@/types/chatMessage';

import IFrameRender from './IFrameRender';
import SystemJsRender from './SystemJsRender';

export interface FunctionMessageProps extends ChatMessage {
  loading?: boolean;
}

const PluginMessage = memo<FunctionMessageProps>(({ content, name }) => {
  const { t } = useTranslation('plugin');

  const manifest = usePluginStore((s) => s.pluginManifestMap[name || '']);
  let isJSON = true;
  try {
    JSON.parse(content);
  } catch {
    isJSON = false;
  }

  const contentObj = useMemo(() => (isJSON ? JSON.parse(content) : content), [content]);

  // if (!loading)

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

  if (!manifest?.ui) return;

  const ui = manifest.ui;

  if (!ui.url) return;

  if (ui.mode === 'module')
    return <SystemJsRender content={contentObj} name={name || 'unknown'} url={ui.url} />;

  return (
    <IFrameRender
      content={contentObj}
      height={ui.height}
      name={name || 'unknown'}
      url={ui.url}
      width={ui.width}
    />
  );
});

export default PluginMessage;
