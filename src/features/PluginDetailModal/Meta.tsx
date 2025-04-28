import { Block } from '@lobehub/ui';
import { Typography } from 'antd';
import isEqual from 'fast-deep-equal';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import PluginAvatar from '@/features/PluginAvatar';
import { pluginHelpers, useToolStore } from '@/store/tool';
import { pluginSelectors } from '@/store/tool/selectors';

const Meta = memo<{
  id: string;
}>(({ id }) => {
  const pluginMeta = useToolStore(pluginSelectors.getPluginMetaById(id), isEqual);

  return (
    <Block gap={16} horizontal padding={16} variant={'outlined'}>
      <PluginAvatar identifier={id} size={40} />
      <Flexbox gap={2}>
        <div>{pluginHelpers.getPluginTitle(pluginMeta)}</div>
        <Typography.Text style={{ fontSize: 12 }} type={'secondary'}>
          {pluginHelpers.getPluginDesc(pluginMeta)}
        </Typography.Text>
      </Flexbox>
    </Block>
  );
});

export default Meta;
