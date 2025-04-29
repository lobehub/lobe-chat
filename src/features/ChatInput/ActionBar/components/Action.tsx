'use client';

import { ActionIcon, type ActionIconProps, Drawer, Icon, Menu } from '@lobehub/ui';
import { Loader2Icon } from 'lucide-react';
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
        title={!showTooltip || mobile ? undefined : title}
        tooltipProps={{
          placement: 'bottom',
        }}
        {...rest}
      />
    );

    if (disabled) return iconNode;

    if (mobile)
      return (
        <>
          {iconNode}
          <Drawer
            extra={loading && <Icon icon={Loader2Icon} spin />}
            height={'auto'}
            onClose={() => setShow(false)}
            open={show}
            placement={'bottom'}
            styles={{
              body: {
                paddingInline: 0,
                ...popover?.styles?.body,
              },
            }}
            title={title}
          >
            {dropdown?.menu && <Menu mode={'inline'} {...dropdown?.menu} />}
            {popover && popover?.content}
          </Drawer>
        </>
      );

    if (dropdown)
      return (
        <ActionDropdown onOpenChange={setShow} open={show} trigger={trigger} {...dropdown}>
          {iconNode}
        </ActionDropdown>
      );
    if (popover)
      return (
        <ActionPopover onOpenChange={setShow} open={show} trigger={trigger} {...popover}>
          {iconNode}
        </ActionPopover>
      );

    return iconNode;
  },
);

export default Action;
