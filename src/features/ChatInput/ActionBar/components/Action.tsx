'use client';

import { ActionIcon, type ActionIconProps } from '@lobehub/ui';
import { isUndefined } from 'lodash-es';
import { memo } from 'react';
import useMergeState from 'use-merge-value';

import { useServerConfigStore } from '@/store/serverConfig';

import ActionDropdown, { ActionDropdownProps } from './ActionDropdown';
import ActionPopover, { ActionPopoverProps } from './ActionPopover';

interface ActionProps extends Omit<ActionIconProps, 'popover'> {
  dropdown?: ActionDropdownProps;
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
  popover?: ActionPopoverProps;
  showTooltip?: boolean;
  trigger?: ActionDropdownProps['trigger'];
}

const Action = memo<ActionProps>(
  ({
    showTooltip,
    loading,
    icon,
    title,
    dropdown,
    popover,
    open,
    onOpenChange,
    trigger,
    disabled,
    ...rest
  }) => {
    const [show, setShow] = useMergeState(false, {
      onChange: onOpenChange,
      value: open,
    });
    const mobile = useServerConfigStore((s) => s.isMobile);
    const iconNode = (
      <ActionIcon
        disabled={disabled}
        icon={icon}
        loading={loading}
        onClick={() => setShow(true)}
        title={
          isUndefined(showTooltip) ? (mobile ? undefined : title) : showTooltip ? title : undefined
        }
        tooltipProps={{
          placement: 'bottom',
        }}
        {...rest}
        size={{
          blockSize: 36,
          size: 20,
        }}
      />
    );

    if (disabled) return iconNode;

    if (dropdown)
      return (
        <ActionDropdown
          onOpenChange={setShow}
          open={show}
          trigger={trigger}
          {...dropdown}
          minWidth={mobile ? '100%' : dropdown.minWidth}
          placement={mobile ? 'top' : dropdown.placement}
        >
          {iconNode}
        </ActionDropdown>
      );
    if (popover)
      return (
        <ActionPopover
          onOpenChange={setShow}
          open={show}
          trigger={trigger}
          {...popover}
          minWidth={mobile ? '100%' : popover.minWidth}
          placement={mobile ? 'top' : popover.placement}
        >
          {iconNode}
        </ActionPopover>
      );

    return iconNode;
  },
);

export default Action;
