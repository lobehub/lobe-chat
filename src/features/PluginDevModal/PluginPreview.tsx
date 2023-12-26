import { Avatar, Form } from '@lobehub/ui';
import { Form as AForm, Card, FormInstance } from 'antd';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import PluginTag from '@/features/PluginStore/PluginItem/PluginTag';
import { pluginHelpers } from '@/store/tool';
import { LobeToolCustomPlugin } from '@/types/tool/plugin';

const PluginPreview = memo<{ form: FormInstance }>(({ form }) => {
  const { t } = useTranslation('plugin');

  const plugin: LobeToolCustomPlugin = AForm.useWatch([], form);
  const meta = plugin?.manifest?.meta;

  const items = {
    avatar: <Avatar avatar={pluginHelpers.getPluginAvatar(meta)} style={{ flex: 'none' }} />,
    desc: pluginHelpers.getPluginDesc(meta) || 'Plugin Description',
    label: (
      <Flexbox align={'center'} gap={8} horizontal>
        {pluginHelpers.getPluginTitle(meta) || 'Plugin Title'}
        <PluginTag type={'customPlugin'} />
      </Flexbox>
    ),
    minWidth: undefined,
  };

  return (
    <Card bodyStyle={{ padding: '0 16px' }} size={'small'} title={t('dev.preview.card')}>
      <Form.Item {...items} colon={false} style={{ alignItems: 'center', marginBottom: 0 }} />
    </Card>
  );
});

export default PluginPreview;
