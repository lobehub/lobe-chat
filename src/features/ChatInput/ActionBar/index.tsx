import { ChatInputActions, type ChatInputActionsProps } from '@lobehub/editor/react';
import { memo, useMemo } from 'react';

import { useGlobalStore } from '@/store/global';
import { systemStatusSelectors } from '@/store/global/selectors';

import { ActionKeys, actionMap } from '../ActionBar/config';
import { useChatInputStore } from '../store';

const mapActionsToItems = (keys: ActionKeys[]): ChatInputActionsProps['items'] =>
  keys.map((actionKey, index) => {
    if (typeof actionKey === 'string') {
      if (actionKey === '---') {
        return {
          key: `divider-${index}`,
          type: 'divider',
        };
      }
      const Render = actionMap[actionKey];
      return {
        alwaysDisplay: actionKey === 'mainToken',
        children: <Render key={actionKey} />,
        key: actionKey,
      };
    } else {
      return {
        children: actionKey.map((groupActionKey) => {
          const Render = actionMap[groupActionKey];
          return {
            children: <Render key={groupActionKey} />,
            key: groupActionKey,
          };
        }),
        key: `group-${index}`,
        type: 'collapse',
      };
    }
  });

const ActionToolbar = memo(() => {
  const [expandInputActionbar, toggleExpandInputActionbar] = useGlobalStore((s) => [
    systemStatusSelectors.expandInputActionbar(s),
    s.toggleExpandInputActionbar,
  ]);

  const leftActions = useChatInputStore((s) => s.leftActions);
  const mobile = useChatInputStore((s) => s.mobile);
  const items = useMemo(() => mapActionsToItems(leftActions), [leftActions]);
  return (
    <ChatInputActions
      collapseOffset={mobile ? 48 : 80}
      defaultGroupCollapse={true}
      groupCollapse={!expandInputActionbar}
      items={items}
      onGroupCollapseChange={(v) => {
        toggleExpandInputActionbar(!v);
      }}
    />
  );
});

export default ActionToolbar;
