import { Form } from '@lobehub/ui';
import { Form as AForm, Card, FormInstance } from 'antd';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import PluginAvatar from '@/features/PluginStore/PluginItem/PluginAvatar';
import PluginTag from '@/features/PluginStore/PluginItem/PluginTag';
import { pluginHelpers } from '@/store/tool';
import { LobeToolCustomPlugin } from '@/types/tool/plugin';

const PluginPreview = memo<{ form: FormInstance }>(({ form }) => {
  const { t } = useTranslation('plugin');

  const plugin: LobeToolCustomPlugin = AForm.useWatch([], form);
  const meta = plugin?.manifest?.meta;

  const items = {
    avatar: <PluginAvatar avatar={pluginHelpers.getPluginAvatar(meta)} />,
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
    <Card size={'small'} styles={{ body: { padding: '0 16px' } }} title={t('dev.preview.card')}>
      <Form.Item {...items} colon={false} style={{ alignItems: 'center', marginBottom: 0 }} />
    </Card>
  );
});

export default PluginPreview;
