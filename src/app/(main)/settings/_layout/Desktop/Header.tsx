'use client';

import { ActionIcon, ChatHeader, ChatHeaderTitle } from '@lobehub/ui';
import { type DrawerProps, Popover } from 'antd';
import { createStyles } from 'antd-style';
import { Menu } from 'lucide-react';
import { PropsWithChildren, memo } from 'react';

const useStyles = createStyles(({ token, css }) => ({
  container: css`
    position: relative;
    flex: none;
    height: 54px;
    background: ${token.colorBgContainer};
  `,
  title: css`
    font-size: 18px;
    font-weight: 700;
    line-height: 1.2;
  `,
}));

const Header = memo<PropsWithChildren & Pick<DrawerProps, 'getContainer'>>(({ children }) => {
  const { styles, theme } = useStyles();

  return (
    <ChatHeader
      className={styles.container}
      left={
        <ChatHeaderTitle
          title={
            <Popover
              arrow={false}
              content={children}
              overlayInnerStyle={{ minWidth: 240, padding: '2px 4px' }}
              placement={'bottomLeft'}
              trigger={['click']}
            >
              <ActionIcon
                color={theme.colorText}
                icon={Menu}
                size={{ blockSize: 32, fontSize: 18 }}
              />
            </Popover>
          }
        />
      }
    />
  );
});

export default Header;
