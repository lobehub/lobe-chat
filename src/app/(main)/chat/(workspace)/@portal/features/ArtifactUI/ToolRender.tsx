import isEqual from 'fast-deep-equal';
import { memo } from 'react';

import PluginRender from '@/features/PluginsUI/Render';
import { useChatStore } from '@/store/chat';
import { chatPortalSelectors, chatSelectors } from '@/store/chat/selectors';
import { BuiltinToolsPortals } from '@/tools/portals';
import { safeParseJSON } from '@/utils/safeParseJSON';

const ToolRender = memo(() => {
  const messageId = useChatStore(chatPortalSelectors.artifactMessageId);
  const message = useChatStore(chatSelectors.getMessageById(messageId || ''), isEqual);

  // make sure the message and id is valid
  if (!messageId || !message) return;

  const { plugin, pluginState } = message;

  // make sure the plugin and identifier is valid
  if (!plugin || !plugin.identifier) return;

  const args = safeParseJSON(plugin.arguments);

  if (!args) return;

  const Render = BuiltinToolsPortals[plugin.identifier];

  if (!Render)
    return (
      <PluginRender
        arguments={plugin.arguments}
        content={message.content}
        id={messageId}
        identifier={plugin.identifier}
        payload={plugin}
        pluginState={pluginState}
        type={plugin?.type}
      />
    );

  return (
    <Render
      arguments={args}
      identifier={plugin.identifier}
      messageId={messageId}
      state={pluginState}
    />
  );
});

export default ToolRender;
