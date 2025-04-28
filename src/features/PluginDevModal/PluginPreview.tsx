import { Block } from '@lobehub/ui';
import { Form as AForm, FormInstance, Typography } from 'antd';
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

  return (
    <Block gap={16} horizontal padding={16} title={t('dev.preview.card')} variant={'outlined'}>
      <PluginAvatar avatar={pluginHelpers.getPluginAvatar(meta)} size={40} />
      <Flexbox gap={2}>
        <Flexbox align={'center'} gap={8} horizontal>
          {pluginHelpers.getPluginTitle(meta) || 'Plugin Title'}
          <PluginTag type={'customPlugin'} />
        </Flexbox>
        <Typography.Text style={{ fontSize: 12 }} type={'secondary'}>
          {pluginHelpers.getPluginDesc(meta) || 'Plugin Description'}
        </Typography.Text>
      </Flexbox>
    </Block>
  );
});

export default PluginPreview;
