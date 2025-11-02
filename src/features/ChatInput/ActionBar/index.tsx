import { ChatInputActions, type ChatInputActionsProps } from '@lobehub/editor/react';
import { memo, useMemo } from 'react';

import { useGlobalStore } from '@/store/global';
import { systemStatusSelectors } from '@/store/global/selectors';
import { featureFlagsSelectors, useServerConfigStore } from '@/store/serverConfig';
import { useUserStore } from '@/store/user';
import { preferenceSelectors } from '@/store/user/slices/preference/selectors';

import { ActionKeys, actionMap } from '../ActionBar/config';
import { useChatInputStore } from '../store';

// Helper to count visible items in a group based on feature flags
const countVisibleGroupItems = (
  actionKeys: string[],
  featureFlags: ReturnType<typeof featureFlagsSelectors>,
): number => {
  let count = 0;

  for (const key of actionKeys) {
    // Check if the action should be visible based on feature flags
    if (key === 'params' && !featureFlags.showAdvancedModelParams) continue;
    if (key === 'stt' && !featureFlags.enableSTT) continue;
    if (key === 'fileUpload' && !featureFlags.enableFileUpload) continue;
    if (key === 'knowledgeBase' && !featureFlags.enableKnowledgeBase) continue;
    if (key === 'tools' && !featureFlags.enableMCP) continue;
    // Add other action-to-flag mappings as needed

    count++;
  }

  return count;
};

const mapActionsToItems = (
  keys: ActionKeys[],
  featureFlags: ReturnType<typeof featureFlagsSelectors>,
): ChatInputActionsProps['items'] => {
  const items: ChatInputActionsProps['items'] = [];

  keys.forEach((actionKey) => {
    if (typeof actionKey === 'string') {
      if (actionKey === '---') {
        items.push({
          type: 'divider',
        });
      } else {
        const Render = actionMap[actionKey];
        items.push({
          alwaysDisplay: actionKey === 'mainToken',
          children: <Render key={actionKey} />,
          key: actionKey,
        });
      }
    } else {
      // Map group actions to items
      const groupItems = actionKey.map((groupActionKey) => {
        const Render = actionMap[groupActionKey];
        return {
          children: <Render key={groupActionKey} />,
          key: groupActionKey,
        };
      });

      // Count how many items will actually be visible based on feature flags
      const visibleCount = countVisibleGroupItems(actionKey, featureFlags);

      // If group has less than 3 visible items, flatten them instead of using collapse
      // This prevents showing collapse button for minimal groups (e.g., only 'history' and 'clear')
      if (visibleCount < 3) {
        items.push(...groupItems);
      } else {
        items.push({
          children: groupItems,
          type: 'collapse',
        });
      }
    }
  });

  return items;
};

const ActionToolbar = memo(() => {
  const [expandInputActionbar, toggleExpandInputActionbar] = useGlobalStore((s) => [
    systemStatusSelectors.expandInputActionbar(s),
    s.toggleExpandInputActionbar,
  ]);
  const enableRichRender = useUserStore(preferenceSelectors.inputMarkdownRender);
  const featureFlags = useServerConfigStore(featureFlagsSelectors);

  const leftActions = useChatInputStore((s) =>
    s.leftActions.filter((item) => (enableRichRender ? true : item !== 'typo')),
  );

  const mobile = useChatInputStore((s) => s.mobile);

  const items = useMemo(
    () => mapActionsToItems(leftActions, featureFlags),
    [leftActions, featureFlags],
  );

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
