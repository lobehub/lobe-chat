import { Avatar, Form } from '@lobehub/ui';
import { Card, Switch } from 'antd';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { pluginHelpers, usePluginStore } from '@/store/plugin';

const PluginPreview = memo(() => {
  const { t } = useTranslation('plugin');
  const meta = usePluginStore((s) => s.newDevPlugin);

  console.log(pluginHelpers.getPluginDesc(meta?.meta));
  const items = {
    avatar: <Avatar avatar={pluginHelpers.getPluginAvatar(meta?.meta) || '🧩'} />,
    children: <Switch />,
    desc: pluginHelpers.getPluginDesc(meta?.meta) ?? t('dev.preview.desc'),
    label: pluginHelpers.getPluginTitle(meta?.meta) ?? t('dev.preview.title'),
    minWidth: undefined,
    tag: !!meta?.identifier ? meta?.identifier : 'id',
  };

  return (
    <Card size={'small'} title={t('dev.preview.card')}>
      <Form.Item {...items} colon={false} style={{ marginBottom: 0 }} />
    </Card>
  );
});

export default PluginPreview;
