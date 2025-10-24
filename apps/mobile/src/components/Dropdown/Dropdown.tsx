import { memo, useMemo } from 'react';
import * as ContextMenu from 'zeego/context-menu';
import * as DropdownMenu from 'zeego/dropdown-menu';

import { hapticsEffect } from '@/utils/hapticsEffect';

import type { DropdownPlacement, DropdownProps } from './type';

/**
 * 将 placement 映射为 zeego 的 side 和 align
 *
 * 注意：由于原生平台菜单 API 的限制，这些属性在大多数情况下不会生效。
 * 原生菜单会根据触发元素位置和屏幕空间自动调整位置。
 * 保留此配置是为了 API 的完整性，以防未来平台支持更精确的控制。
 */
const getPlacementConfig = (placement: DropdownPlacement = 'bottom') => {
  const map: Record<
    DropdownPlacement,
    { align: 'start' | 'center' | 'end'; side: 'top' | 'bottom' }
  > = {
    bottom: { align: 'center', side: 'bottom' },
    bottomLeft: { align: 'start', side: 'bottom' },
    bottomRight: { align: 'end', side: 'bottom' },
    top: { align: 'center', side: 'top' },
    topLeft: { align: 'start', side: 'top' },
    topRight: { align: 'end', side: 'top' },
  };
  return map[placement];
};

/**
 * Dropdown 组件
 * 基于 zeego 的 ContextMenu/DropdownMenu 封装，提供更友好的 API
 */
const Dropdown = memo<DropdownProps>(
  ({ children, options, onOpenChange, placement = 'bottom', trigger = 'longPress' }) => {
    // 过滤掉隐藏的选项（缓存优化）
    const visibleOptions = useMemo(() => options.filter((option) => !option.hidden), [options]);

    // 根据 trigger 类型选择对应的组件
    const isPress = trigger === 'press';
    const Menu = isPress ? DropdownMenu : ContextMenu;

    // 获取 placement 配置
    const { side, align } = getPlacementConfig(placement);

    const content = useMemo(
      () =>
        visibleOptions.map((option) => (
          <Menu.Item
            destructive={option.destructive}
            disabled={option.disabled}
            key={option.key}
            onSelect={option.onSelect}
            shouldDismissMenuOnSelect={option.shouldDismissMenuOnSelect}
          >
            <Menu.ItemTitle>{option.title}</Menu.ItemTitle>
            {option.icon && (
              <Menu.ItemIcon
                ios={{
                  name: option.icon.name,
                  pointSize: option.icon.pointSize ?? 18,
                }}
              />
            )}
          </Menu.Item>
        )),
      [visibleOptions],
    );

    return (
      <Menu.Root
        onOpenChange={(open) => {
          onOpenChange?.(open);
          if (open) hapticsEffect();
        }}
      >
        <Menu.Trigger asChild>{children}</Menu.Trigger>
        <Menu.Content align={align} side={side}>
          {content}
        </Menu.Content>
      </Menu.Root>
    );
  },
);

Dropdown.displayName = 'Dropdown';

export default Dropdown;
