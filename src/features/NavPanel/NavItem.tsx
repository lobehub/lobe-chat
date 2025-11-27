'use client';

import { Block, BlockProps, Icon, IconProps, Text } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { Loader2Icon } from 'lucide-react';
import { ReactNode, memo } from 'react';
import { Center, Flexbox } from 'react-layout-kit';

const ACTION_CLASS_NAME = 'nav-item-actions';

const useStyles = createStyles(({ css, token }) => ({
  container: css`
    user-select: none;
    overflow: hidden;
    min-width: 32px;

    .${ACTION_CLASS_NAME} {
      width: 0;
      margin-inline-end: 2px;
      opacity: 0;
      transition: opacity 0.2s ${token.motionEaseOut};
    }

    &:hover {
      .${ACTION_CLASS_NAME} {
        width: unset;
        opacity: 1;
      }
    }
  `,
}));

interface NavItemProps extends Omit<BlockProps, 'children' | 'title'> {
  actions?: ReactNode;
  active?: boolean;
  disabled?: boolean;
  extra?: ReactNode;
  icon?: IconProps['icon'];
  loading?: boolean;
  title: ReactNode;
}

const NavItem = memo<NavItemProps>(
  ({ className, actions, active, icon, title, onClick, disabled, loading, extra, ...rest }) => {
    const { cx, styles, theme } = useStyles();

    const iconColor = active ? theme.colorText : theme.colorTextDescription;
    const textColor = active ? theme.colorText : theme.colorTextSecondary;
    const variant = active ? 'filled' : 'borderless';
    const iconComponent = loading ? Loader2Icon : icon;

    return (
      <Block
        align={'center'}
        className={cx(styles.container, className)}
        clickable={!disabled}
        gap={8}
        height={32}
        horizontal
        onClick={(e) => {
          if (disabled || loading) return;
          onClick?.(e);
        }}
        paddingInline={2}
        variant={variant}
        {...rest}
      >
        {icon && (
          <Center flex={'none'} height={28} width={28}>
            <Icon color={iconColor} icon={iconComponent} size={18} spin={loading} />
          </Center>
        )}

        <Flexbox align={'center'} flex={1} gap={8} horizontal style={{ overflow: 'hidden' }}>
          <Text color={textColor} ellipsis style={{ flex: 1 }}>
            {title}
          </Text>
          <Flexbox
            align={'center'}
            gap={2}
            horizontal
            justify={'flex-end'}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            {extra}
            {actions && (
              <Flexbox
                align={'center'}
                className={ACTION_CLASS_NAME}
                gap={2}
                horizontal
                justify={'flex-end'}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
              >
                {actions}
              </Flexbox>
            )}
          </Flexbox>
        </Flexbox>
      </Block>
    );
  },
);

export default NavItem;
