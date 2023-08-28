import { Avatar, Form } from '@lobehub/ui';
import { Card, Switch, Tag } from 'antd';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { pluginHelpers, usePluginStore } from '@/store/plugin';

const PluginPreview = memo(() => {
  const { t } = useTranslation('plugin');
  const meta = usePluginStore((s) => s.newDevPlugin);

  const items = {
    avatar: <Avatar avatar={pluginHelpers.getPluginAvatar(meta?.meta) || '🧩'} />,
    children: <Switch />,
    desc: pluginHelpers.getPluginDesc(meta?.meta),
    label: (
      <Flexbox align={'center'} gap={8} horizontal>
        {pluginHelpers.getPluginTitle(meta?.meta) ?? t('dev.preview.title')}
        <Tag bordered={false} color={'gold'}>
          {t('list.title.local', { ns: 'plugin' })}
        </Tag>
      </Flexbox>
    ),
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
