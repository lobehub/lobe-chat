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
    <Flexbox gap={4}>
      <Flexbox
        align={'center'}
        height={40}
        horizontal
        style={{ fontSize: 20, fontWeight: 'bold' }}
        width={'100%'}
      >
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
          size={'large'}
          style={{ maxWidth: 200 }}
          type={'block'}
          value={deviceName}
        />
      </Flexbox>
    </Flexbox>
  );
});

export default DeviceName;
