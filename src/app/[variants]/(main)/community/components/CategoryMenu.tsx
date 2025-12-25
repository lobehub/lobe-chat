'use client';

import { Menu, MenuProps } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { memo } from 'react';

const useStyles = createStyles(({ css, prefixCls }) => {
  return {
    menu: css`
      padding: 0 !important;
      .${prefixCls}-menu-item {
        display: flex;
        gap: 4px;

        width: 100%;
        height: 36px;
        margin-inline: 0;
        padding-inline-start: 12px !important;

        font-size: 14px;

        .${prefixCls}-menu-title-content > a {
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }
    `,
  };
});

const CategoryMenu = memo<MenuProps>(({ style, ...rest }) => {
  const { styles } = useStyles();

  return (
    <Menu
      className={styles.menu}
      data-testid="category-menu"
      mode="inline"
      style={style}
      {...rest}
    />
  );
});

export default CategoryMenu;
