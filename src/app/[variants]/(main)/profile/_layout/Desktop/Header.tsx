'use client';

import { ActionIcon, ChatHeader, ChatHeaderTitle } from '@lobehub/ui';
import { Drawer, type DrawerProps } from 'antd';
import { createStyles } from 'antd-style';
import { Menu } from 'lucide-react';
import { ReactNode, memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import BrandWatermark from '@/components/BrandWatermark';
import { withSuspense } from '@/components/withSuspense';
import { useActiveProfileKey } from '@/hooks/useActiveTabKey';

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

interface HeaderProps extends Pick<DrawerProps, 'getContainer'> {
  children: ReactNode;
}

const Header = memo<HeaderProps>(({ children, getContainer }) => {
  const [open, setOpen] = useState(false);
  const { styles, theme } = useStyles();
  const { t } = useTranslation('auth');
  const activeKey = useActiveProfileKey();
  const title = t(`tab.${activeKey}`);

  return (
    <>
      <ChatHeader
        className={styles.container}
        left={
          <ChatHeaderTitle
            title={
              <Flexbox align={'center'} className={styles.title} gap={4} horizontal>
                <ActionIcon
                  color={theme.colorText}
                  icon={Menu}
                  onClick={() => setOpen(true)}
                  size={{ blockSize: 32, fontSize: 18 }}
                />
                {title}
              </Flexbox>
            }
          />
        }
      />
      <Drawer
        bodyStyle={{
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
          justifyContent: 'space-between',
          padding: 16,
        }}
        getContainer={getContainer}
        headerStyle={{ display: 'none' }}
        maskStyle={{ background: 'transparent' }}
        onClick={() => setOpen(false)}
        onClose={() => setOpen(false)}
        open={open}
        placement={'left'}
        rootStyle={{ position: 'absolute' }}
        style={{
          background: theme.colorBgContainer,
          borderRight: `1px solid ${theme.colorSplit}`,
        }}
        width={260}
        zIndex={10}
      >
        {children}
        <BrandWatermark paddingInline={12} />
      </Drawer>
    </>
  );
});

export default withSuspense(Header);
