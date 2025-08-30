import { ChatInputActions, type ChatInputActionsProps } from '@lobehub/editor/react';
import { memo, useMemo } from 'react';

import { ActionKeys, actionMap } from '../ActionBar/config';
import { useChatInput } from '../hooks/useChatInput';

const mapActionsToItems = (keys: ActionKeys[]): ChatInputActionsProps['items'] =>
  keys.map((item) => {
    if (typeof item === 'string') {
      if (item === '---') {
        return {
          type: 'divider',
        };
      }
      const Render = actionMap[item];
      return {
        alwaysDisplay: item === 'mainToken',
        children: <Render />,
        key: item,
      };
    } else {
      return {
        children: item.map((i) => {
          const Render = actionMap[i];
          return {
            children: <Render />,
            key: i,
          };
        }),
        type: 'collapse',
      };
    }
  });

const ActionToolbar = memo(() => {
  const { actions, mobile } = useChatInput();
  const items = useMemo(() => mapActionsToItems(actions), [actions]);
  return <ChatInputActions collapseOffset={mobile ? 48 : 80} items={items} />;
});

export default ActionToolbar;
