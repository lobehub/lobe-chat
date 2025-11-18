'use client';

import { Block, Icon, IconProps, Text, Tooltip } from '@lobehub/ui';
import { useTheme } from 'antd-style';
import { memo } from 'react';

interface NavItemProps {
  active?: boolean;
  disabled?: boolean;
  expand: boolean;
  hidden?: boolean;
  icon: IconProps['icon'];
  onClick: () => void;
  title: string;
}

const NavItem = memo<NavItemProps>(({ active, hidden, expand, icon, title, onClick, disabled }) => {
  const theme = useTheme();
  if (hidden) return;
  const content = (
    <Block
      align={'center'}
      clickable={!disabled}
      gap={14}
      height={32}
      horizontal
      onClick={() => {
        if (disabled) return;
        onClick();
      }}
      padding={8}
      style={{
        overflow: 'hidden',
      }}
      variant={active ? 'filled' : 'borderless'}
    >
      <Icon color={active ? theme.colorText : theme.colorTextDescription} icon={icon} size={16} />
      {expand && (
        <Text
          color={active ? theme.colorText : theme.colorTextSecondary}
          ellipsis
          style={{
            flex: 1,
          }}
        >
          {title}
        </Text>
      )}
    </Block>
  );

  if (expand) return content;

  return (
    <Tooltip placement={'right'} title={title}>
      {content}
    </Tooltip>
  );
});

export default NavItem;
