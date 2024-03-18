'use client';

import { EditableText } from '@lobehub/ui';
import { Typography } from 'antd';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useGlobalStore } from '@/store/global';
import { syncSettingsSelectors } from '@/store/global/selectors';

const DeviceName = memo(() => {
  const { t } = useTranslation('setting');

  const [deviceName, setSettings] = useGlobalStore((s) => [
    syncSettingsSelectors.deviceName(s),
    s.setSettings,
  ]);

  const [editing, setEditing] = useState(false);

  const updateDeviceName = (deviceName: string) => {
    setSettings({ sync: { deviceName } });
    setEditing(false);
  };

  return (
    <Flexbox
      align={'flex-end'}
      gap={4}
      style={{ maxWidth: 292, paddingInlineEnd: 8 }}
      width={'100%'}
    >
      <div>{t('sync.device.deviceName.title')}</div>
      <Flexbox align={'center'} height={32} horizontal justify={'flex-end'} width={'100%'}>
        {!deviceName && !editing && (
          <Flexbox
            onClick={() => {
              setEditing(true);
            }}
            style={{ cursor: 'pointer' }}
          >
            <Typography.Text type={'secondary'}>{t('sync.device.deviceName.hint')}</Typography.Text>
          </Flexbox>
        )}
        <EditableText
          editing={editing}
          onBlur={(e) => {
            updateDeviceName(e.target.value);
          }}
          onChange={(e) => {
            updateDeviceName(e);
          }}
          onEditingChange={setEditing}
          placeholder={t('sync.device.deviceName.placeholder')}
          value={deviceName}
        />
      </Flexbox>
    </Flexbox>
  );
});

export default DeviceName;
