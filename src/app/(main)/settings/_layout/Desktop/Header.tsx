'use client';

import { ActionIcon, ChatHeader, ChatHeaderTitle } from '@lobehub/ui';
import { Drawer, type DrawerProps, Tag } from 'antd';
import { createStyles } from 'antd-style';
import { Menu } from 'lucide-react';
import { PropsWithChildren, memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import BrandWatermark from '@/components/BrandWatermark';
import { useActiveSettingsKey } from '@/hooks/useActiveSettingsKey';
import { SettingsTabs } from '@/store/global/initialState';

const useStyles = createStyles(({ token, css }) => ({
  container: css`
    position: relative;
    height: 54px;
    background: ${token.colorBgContainer};
  `,
  title: css`
    font-size: 18px;
    font-weight: 700;
  `,
}));

const Header = memo<PropsWithChildren & Pick<DrawerProps, 'getContainer'>>(
  ({ children, getContainer }) => {
    const [open, setOpen] = useState(false);
    const { styles, theme } = useStyles();
    const { t } = useTranslation('setting');

    const activeKey = useActiveSettingsKey();

    return (
      <>
        <ChatHeader
          className={styles.container}
          left={
            <div style={{ paddingLeft: 8 }}>
              <ChatHeaderTitle
                title={
                  <Flexbox align={'center'} className={styles.title} gap={4} horizontal>
                    <ActionIcon
                      color={theme.colorText}
                      icon={Menu}
                      onClick={() => setOpen(true)}
                      size={{ blockSize: 32, fontSize: 18 }}
                    />
                    {t(`tab.${activeKey}`)}
                    {activeKey === SettingsTabs.Sync && (
                      <Tag color={'gold'}>{t('tab.experiment')}</Tag>
                    )}
                  </Flexbox>
                }
              />
            </div>
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
  },
);

export default Header;
