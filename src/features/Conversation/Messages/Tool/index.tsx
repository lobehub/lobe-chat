import { Icon } from '@lobehub/ui';
import { ConfigProvider, Empty } from 'antd';
import { useTheme } from 'antd-style';
import { LucideSquareArrowLeft, LucideSquareArrowRight } from 'lucide-react';
import { memo, useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Center, Flexbox } from 'react-layout-kit';

import PluginRender from '@/features/PluginsUI/Render';
import { useChatStore } from '@/store/chat';
import { chatPortalSelectors, chatSelectors } from '@/store/chat/selectors';
import { ChatMessage } from '@/types/message';

import Arguments from '../components/Arguments';
import Inspector from './Inspector';

export const ToolMessage = memo<ChatMessage>(({ id, content, pluginState, plugin }) => {
  const [loading, isMessageToolUIOpen] = useChatStore((s) => [
    chatSelectors.isPluginApiInvoking(id)(s),
    chatPortalSelectors.isArtifactMessageUIOpen(id)(s),
  ]);
  const { direction } = useContext(ConfigProvider.ConfigContext);
  const { t } = useTranslation('plugin');

  const theme = useTheme();
  const [showRender, setShow] = useState(plugin?.type !== 'default');

  return (
    <Flexbox gap={12} id={id} width={'100%'}>
      <Inspector
        arguments={plugin?.arguments}
        content={content}
        id={id}
        identifier={plugin?.identifier}
        loading={loading}
        payload={plugin}
        setShow={setShow}
        showRender={showRender}
      />
      {isMessageToolUIOpen ? (
        <Center paddingBlock={8} style={{ background: theme.colorFillQuaternary, borderRadius: 4 }}>
          <Empty
            description={t('showInPortal')}
            image={
              <Icon
                color={theme.colorTextQuaternary}
                icon={direction === 'rtl' ? LucideSquareArrowLeft : LucideSquareArrowRight}
                size={'large'}
              />
            }
            imageStyle={{ height: 24 }}
          />
        </Center>
      ) : showRender || loading ? (
        <PluginRender
          arguments={plugin?.arguments}
          content={content}
          id={id}
          identifier={plugin?.identifier}
          loading={loading}
          payload={plugin}
          pluginState={pluginState}
          type={plugin?.type}
        />
      ) : (
        <Arguments arguments={plugin?.arguments} />
      )}
    </Flexbox>
  );
});
