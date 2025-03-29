'use client';

import { Drawer, Grid, TabsNav } from '@lobehub/ui';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useGlobalStore } from '@/store/global';
import { HotkeyGroupEnum, HotkeyGroupId } from '@/types/hotkey';

import HotkeyContent from './HotkeyContent';

const HotkeyHelperPanel = memo(() => {
  const [open, updateSystemStatus] = useGlobalStore((s) => [
    s.status.showHotkeyHelper,
    s.updateSystemStatus,
  ]);
  const [active, setActive] = useState<HotkeyGroupId>(HotkeyGroupEnum.Essential);
  const { t } = useTranslation('setting');

  const handleClose = () => updateSystemStatus({ showHotkeyHelper: false });

  return (
    <Drawer
      height={240}
      mask={false}
      maskClosable={false}
      onClose={handleClose}
      open={open}
      placement={'bottom'}
      styles={{
        bodyContent: { paddingBlock: 24 },
        title: { paddingBlock: 0 },
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
          variant={'compact'}
        />
      }
    >
      <Grid gap={32}>
        <HotkeyContent groupId={active} />
      </Grid>
    </Drawer>
  );
});

export default HotkeyHelperPanel;
