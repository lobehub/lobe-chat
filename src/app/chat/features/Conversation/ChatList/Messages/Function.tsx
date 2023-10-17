import { ActionIconGroup, RenderAction, RenderMessage, useChatListActionsBar } from '@lobehub/ui';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { useSessionStore } from '@/store/session';
import { currentFunctionCallProps } from '@/store/session/slices/chat/selectors/chat';

import FunctionCall from '../Plugins/FunctionCall';
import PluginMessage from '../Plugins/PluginMessage';

export const FunctionMessage: RenderMessage = memo(
  ({ id, content, plugin, function_call, ...props }) => {
    const genFunctionCallProps = useSessionStore(currentFunctionCallProps);
    const fcProps = genFunctionCallProps({ content, function_call, id, plugin });

    return (
      <Flexbox gap={12} id={id}>
        <FunctionCall {...fcProps} />
        <PluginMessage
          content={content}
          function_call={function_call}
          id={id}
          loading={fcProps.loading}
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
