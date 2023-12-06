import { Avatar, Form } from '@lobehub/ui';
import { Form as AForm, Card, FormInstance, Switch, Tag } from 'antd';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { pluginHelpers } from '@/store/tool';
import { CustomPlugin } from '@/types/plugin';

const PluginPreview = memo<{ form: FormInstance }>(({ form }) => {
  const { t } = useTranslation('plugin');
  const plugin: CustomPlugin = AForm.useWatch([], form);

  const items = {
    avatar: <Avatar avatar={pluginHelpers.getPluginAvatar(plugin?.meta) || '🧩'} />,
    children: <Switch disabled />,
    desc: pluginHelpers.getPluginDesc(plugin?.meta),
    label: (
      <Flexbox align={'center'} gap={8} horizontal>
        {pluginHelpers.getPluginTitle(plugin?.meta) ?? t('dev.preview.title')}
        <Tag bordered={false} color={'gold'}>
          {t('list.item.local.title', { ns: 'plugin' })}
        </Tag>
      </Flexbox>
    ),
    minWidth: undefined,
    tag: !!plugin?.identifier ? plugin?.identifier : 'id',
  };

  return (
    <Card size={'small'} title={t('dev.preview.card')}>
      <Form.Item {...items} colon={false} style={{ marginBottom: 0 }} />
    </Card>
  );
});

export default PluginPreview;
