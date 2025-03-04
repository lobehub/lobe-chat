import { memo, useEffect } from 'react';
import { Flexbox } from 'react-layout-kit';

import PluginRender from '@/features/PluginsUI/Render';
import { useChatStore } from '@/store/chat';
import { chatSelectors } from '@/store/chat/selectors';
import { ChatMessage } from '@/types/message';

import Arguments from './Arguments';

interface CustomRenderProps extends ChatMessage {
  requestArgs?: string;
  setShowPluginRender: (value: boolean) => void;
  showPluginRender: boolean;
}

const CustomRender = memo<CustomRenderProps>(
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
    const [loading] = useChatStore((s) => [chatSelectors.isPluginApiInvoking(id)(s)]);

    useEffect(() => {
      if (!plugin?.type || loading) return;

      setShowPluginRender(plugin?.type !== 'default');
    }, [plugin?.type, loading]);

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
