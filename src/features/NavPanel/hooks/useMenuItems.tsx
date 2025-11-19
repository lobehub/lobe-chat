import { Icon, type MenuProps } from '@lobehub/ui';
import { Bot, Plus, Settings2, Users, UsersRound } from 'lucide-react';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { featureFlagsSelectors, useServerConfigStore } from '@/store/serverConfig';

type ItemOfType<T> = T extends (infer Item)[] ? Item : never;
type MenuItemType = ItemOfType<MenuProps['items']>;

interface UseMenuItemsOptions {
  /**
   * Callback when "New Agent" menu item is clicked
   */
  onCreateAgent?: () => void | Promise<void>;
  /**
   * Callback when "New Group Chat" menu item is clicked
   */
  onCreateGroup?: () => void;
  /**
   * Callback when "Config" menu item is clicked
   */
  onOpenConfig?: () => void;
}

/**
 * Unified hook for all menu item generation
 * Provides factory methods for common menu items and composed menu lists
 */
export const useMenuItems = (options?: UseMenuItemsOptions) => {
  const { t } = useTranslation('chat');
  const { enableGroupChat } = useServerConfigStore(featureFlagsSelectors);

  // ============ Factory Methods ============
  // These create individual menu items that can be composed

  /**
   * Create a "Config" menu item
   */
  const createConfigMenuItem = useCallback(
    (onClick?: () => void): MenuItemType => ({
      icon: <Icon icon={Settings2} />,
      key: 'config',
      label: t('sessionGroup.config'),
      onClick: (info) => {
        info.domEvent?.stopPropagation();
        (onClick || options?.onOpenConfig)?.();
      },
    }),
    [t, options?.onOpenConfig],
  );

  /**
   * Create a "New Agent" menu item
   */
  const createNewAgentMenuItem = useCallback(
    (onClick?: () => void | Promise<void>): MenuItemType => ({
      icon: <Icon icon={Plus} />,
      key: 'newAgent',
      label: t('newAgent'),
      onClick: async (info) => {
        info.domEvent?.stopPropagation();
        await (onClick || options?.onCreateAgent)?.();
      },
    }),
    [t, options?.onCreateAgent],
  );

  /**
   * Create a "New Group Chat" menu item
   */
  const createNewGroupChatMenuItem = useCallback(
    (onClick?: () => void): MenuItemType => ({
      icon: <Icon icon={UsersRound} />,
      key: 'newGroupChat',
      label: t('newGroupChat'),
      onClick: (info) => {
        info.domEvent?.stopPropagation();
        (onClick || options?.onCreateGroup)?.();
      },
    }),
    [t, options?.onCreateGroup],
  );

  // ============ Composed Menu Lists ============
  // These create complete menu item lists for common scenarios

  /**
   * Create menu items for the "Create" dropdown (agent + group)
   * Used in AddButton and CreateButton
   */
  const createMenuItems = useMemo(
    () =>
      [
        options?.onCreateAgent && {
          icon: <Icon icon={Bot} />,
          key: 'newAgent',
          label: t('newAgent'),
          onClick: options.onCreateAgent,
        },
        enableGroupChat &&
          options?.onCreateGroup && {
            icon: <Icon icon={Users} />,
            key: 'newGroup',
            label: t('newGroupChat'),
            onClick: options.onCreateGroup,
          },
      ].filter(Boolean) as MenuItemType[],
    [t, enableGroupChat, options?.onCreateAgent, options?.onCreateGroup],
  );

  return {
    // Factory methods for individual items
    createConfigMenuItem,
    // Composed menu lists
createMenuItems: createMenuItems.length > 0 ? createMenuItems : null,
    
createNewAgentMenuItem,

    
    createNewGroupChatMenuItem,
  };
};
