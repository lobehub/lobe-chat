import { Menu as AntdMenu, MenuProps as AntdMenuProps, ConfigProvider } from 'antd';
import { createStyles } from 'antd-style';
import { memo } from 'react';

const useStyles = createStyles(({ css, token, prefixCls }) => ({
  compact: css`
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
  `,
  menu: css`
    flex: 1;
    border: none !important;
    background: transparent;

    .${prefixCls}-menu-item-divider {
      margin-block: 0.125rem;
      border-color: ${token.colorFillTertiary};

      &:first-child {
        margin-block-start: 0;
      }

      &:last-child {
        margin-block-end: 0;
      }
    }

    .${prefixCls}-menu-item, .${prefixCls}-menu-submenu-title {
      display: flex;
      gap: 0.75rem;
      align-items: center;

      height: unset;
      min-height: 2rem;
      padding-block: 0.375rem;
      padding-inline: 0.75rem;

      line-height: 2;

      .anticon + .${prefixCls}-menu-title-content {
        margin-inline-start: 0;
      }
    }

    .${prefixCls}-menu-item-selected {
      .${prefixCls}-menu-item-icon svg {
        color: ${token.colorText};
      }
    }

    .${prefixCls}-menu-item-icon svg {
      color: ${token.colorTextSecondary};
    }

    .${prefixCls}-menu-title-content {
      flex: 1;
    }
  `,
}));

export interface MenuProps extends AntdMenuProps {
  variant?: 'default' | 'compact';
}

const Menu = memo<MenuProps>(({ className, selectable = false, variant, ...rest }) => {
  const isCompact = variant === 'compact';
  const { cx, styles, theme } = useStyles();
  return (
    <ConfigProvider
      theme={{
        components: {
          Menu: {
            controlHeightLG: 36,
            iconMarginInlineEnd: 8,
            iconSize: 16,
            itemBorderRadius: theme.borderRadius,
            itemColor: selectable ? theme.colorTextSecondary : theme.colorText,
            itemHoverBg: theme.colorFillTertiary,
            itemMarginBlock: isCompact ? 0 : 4,
            itemMarginInline: isCompact ? 0 : 4,
            itemSelectedBg: theme.colorFillSecondary,
            paddingXS: -8,
          },
        },
      }}
    >
      <AntdMenu
        className={cx(styles.menu, isCompact && styles.compact, className)}
        mode="vertical"
        selectable={selectable}
        {...rest}
      />
    </ConfigProvider>
  );
});

export default Menu;
