import { Icon } from '@lobehub/ui';
import { ConfigProvider, Empty } from 'antd';
import { useTheme } from 'antd-style';
import { LucideSquareArrowLeft, LucideSquareArrowRight } from 'lucide-react';
import { memo, useContext, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Center, Flexbox } from 'react-layout-kit';

import PluginRender from '@/features/PluginsUI/Render';
import { useChatStore } from '@/store/chat';
import { chatPortalSelectors, chatSelectors } from '@/store/chat/selectors';
import { ChatMessage } from '@/types/message';

import Arguments from './Arguments';

const CustomRender = memo<
  ChatMessage & {
    requestArgs?: string;
    setShowPluginRender: (show: boolean) => void;
    showPluginRender: boolean;
  }
>(
  ({
    id,
    content,
    pluginState,
    plugin,
    requestArgs,
    showPluginRender,
    setShowPluginRender,
    pluginError,
  }) => {
    const [loading, isMessageToolUIOpen] = useChatStore((s) => [
      chatSelectors.isPluginApiInvoking(id)(s),
      chatPortalSelectors.isPluginUIOpen(id)(s),
    ]);
    const { direction } = useContext(ConfigProvider.ConfigContext);
    const { t } = useTranslation('plugin');

    const theme = useTheme();
    useEffect(() => {
      if (!plugin?.type || loading) return;

      setShowPluginRender(plugin?.type !== 'default');
    }, [plugin?.type, loading]);

    if (isMessageToolUIOpen)
      return (
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
            styles={{
              image: { height: 24 },
            }}
          />
        </Center>
      );

    if (loading) return <Arguments arguments={requestArgs} shine />;

    return (
      <Flexbox gap={12} id={id} width={'100%'}>
        {showPluginRender ? (
          <PluginRender
            arguments={plugin?.arguments}
            content={content}
            id={id}
            identifier={plugin?.identifier}
            loading={loading}
            payload={plugin}
            pluginError={pluginError}
            pluginState={pluginState}
            type={plugin?.type}
          />
        ) : (
          <Arguments arguments={requestArgs} />
        )}
      </Flexbox>
    );
  },
);

export default CustomRender;
