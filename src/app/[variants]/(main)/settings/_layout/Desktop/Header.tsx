'use client';

import { ActionIcon, Tag } from '@lobehub/ui';
import { ChatHeader } from '@lobehub/ui/chat';
import { Drawer, type DrawerProps } from 'antd';
import { createStyles } from 'antd-style';
import { Menu } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { ReactNode, memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import BrandWatermark from '@/components/BrandWatermark';
// 新增：引入 SettingsTabs
import { useActiveSettingsKey } from '@/hooks/useActiveTabKey';
import { useProviderName } from '@/hooks/useProviderName';
import { SettingsTabs } from '@/store/global/initialState';

const useStyles = createStyles(({ token, css }) => ({
  container: css`
    position: relative;
    flex: none;
    height: 54px;
    background: ${token.colorBgLayout};
  `,
  title: css`
    font-size: 18px;
    font-weight: 700;
    line-height: 1.2;
  `,
}));

interface HeaderProps extends Pick<DrawerProps, 'getContainer'> {
  children: ReactNode;
  title?: ReactNode;
}

const Header = memo<HeaderProps>(({ children, getContainer, title }) => {
  const [open, setOpen] = useState(false);
  const { styles, theme } = useStyles();
  const activeKey = useActiveSettingsKey();
  const providerName = useProviderName(activeKey);

  const pathname = usePathname();
  const { t } = useTranslation('setting');

  const isProvider = pathname.includes('/settings/provider/');
  const dynamicTitle = title ? (
    title
  ) : (
    <>
      {isProvider ? providerName : t(`tab.${activeKey}`)}
      {activeKey === SettingsTabs.Sync && (
        <Tag bordered={false} color={'gold'}>
          {t('tab.experiment')}
        </Tag>
      )}
    </>
  );

  return (
    <>
      <ChatHeader
        className={styles.container}
        left={
          <ChatHeader.Title
            title={
              <Flexbox align={'center'} className={styles.title} gap={4} horizontal>
                <ActionIcon
                  color={theme.colorText}
                  icon={Menu}
                  onClick={() => setOpen(true)}
                  size={{ blockSize: 32, size: 18 }}
                />
                {dynamicTitle}
              </Flexbox>
            }
          />
        }
        styles={{
          left: {
            padding: 0,
          },
        }}
      />
      <Drawer
        getContainer={getContainer}
        onClick={() => setOpen(false)}
        onClose={() => setOpen(false)}
        open={open}
        placement={'left'}
        rootStyle={{ position: 'absolute' }}
        style={{
          background: theme.colorBgLayout,
          borderRight: `1px solid ${theme.colorSplit}`,
        }}
        styles={{
          body: {
            display: 'flex',
            flexDirection: 'column',
            gap: 20,
            justifyContent: 'space-between',
            padding: 16,
          },
          header: { display: 'none' },
          mask: { background: 'transparent' },
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

export default Header;
