'use client';

import { ActionIcon, Grid, TabsNav } from '@lobehub/ui';
import { Drawer } from 'antd';
import { useTheme } from 'antd-style';
import { XIcon } from 'lucide-react';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useGlobalStore } from '@/store/global';
import { HotkeyGroupEnum, HotkeyGroupId } from '@/types/hotkey';

import HotkeyContent from './HotkeyContent';

const MAX_WIDTH = 1024;

const HotkeyHelperPanel = memo(() => {
  const [open, updateSystemStatus] = useGlobalStore((s) => [
    s.status.showHotkeyHelper,
    s.updateSystemStatus,
  ]);
  const [active, setActive] = useState<HotkeyGroupId>(HotkeyGroupEnum.Essential);
  const { t } = useTranslation('setting');
  const theme = useTheme();

  const handleClose = () => updateSystemStatus({ showHotkeyHelper: false });

  return (
    <Drawer
      closable={false}
      extra={<ActionIcon icon={XIcon} onClick={handleClose} size={'site'} />}
      height={240}
      keyboard={true}
      mask={false}
      maskClosable={false}
      onClose={handleClose}
      open={open}
      placement={'bottom'}
      styles={{
        body: {
          background: theme.colorBgContainer,
        },
        header: {
          background: theme.colorBgContainer,
          borderTop: `1px solid ${theme.colorBorder}`,
          padding: '0 4px',
        },
      }}
      title={
        <TabsNav
          activeKey={active}
          items={[
            {
              key: HotkeyGroupEnum.Essential,
              label: t('hotkey.group.essential'),
            },
            {
              key: HotkeyGroupEnum.Conversation,
              label: t('hotkey.group.conversation'),
            },
          ]}
          onChange={(key) => setActive(key as HotkeyGroupId)}
          style={{
            justifySelf: 'center',
            marginLeft: 34,
            maxWidth: MAX_WIDTH,
            width: '100%',
          }}
          variant={'compact'}
        />
      }
    >
      <Grid
        gap={32}
        style={{
          justifySelf: 'center',
          maxWidth: MAX_WIDTH,
          width: '100%',
        }}
      >
        <HotkeyContent groupId={active} />
      </Grid>
    </Drawer>
  );
});

export default HotkeyHelperPanel;
