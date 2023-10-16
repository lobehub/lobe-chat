import { ActionIconGroup, RenderAction, RenderMessage, useChatListActionsBar } from '@lobehub/ui';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { useSessionStore } from '@/store/session';

import FunctionCall from '../Plugins/FunctionCall';
import PluginMessage from '../Plugins/PluginMessage';

export const FunctionMessage: RenderMessage = memo(
  ({ id, content, plugin, function_call, ...props }) => {
    const chatLoadingId = useSessionStore((s) => s.chatLoadingId);
    const itemId = plugin?.identifier || function_call?.name;
    const command = plugin ?? function_call;
    const args = command?.arguments;
    const fcProps = {
      arguments: args,
      command,
      content,
      id,
      loading: id === chatLoadingId,
    };

    return (
      <Flexbox gap={12} id={itemId}>
        <FunctionCall {...fcProps} />
        <PluginMessage
          content={content}
          function_call={function_call}
          id={id}
          loading={id === chatLoadingId}
          plugin={plugin}
          {...props}
        />
      </Flexbox>
    );
  },
);

export const FunctionActionsBar: RenderAction = memo(({ text, ...props }) => {
  const { regenerate, divider, del } = useChatListActionsBar(text);
  return (
    <ActionIconGroup
      dropdownMenu={[regenerate, divider, del]}
      items={[regenerate]}
      type="ghost"
      {...props}
    />
  );
});
