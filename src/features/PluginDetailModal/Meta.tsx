import { Avatar } from '@lobehub/ui';
import { Typography } from 'antd';
import { useTheme } from 'antd-style';
import isEqual from 'fast-deep-equal';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { pluginHelpers, useToolStore } from '@/store/tool';
import { pluginSelectors } from '@/store/tool/selectors';

const Meta = memo<{
  id: string;
}>(({ id }) => {
  const pluginMeta = useToolStore(pluginSelectors.getPluginMetaById(id), isEqual);

  const theme = useTheme();

  return (
    <>
      <Avatar
        avatar={pluginHelpers.getPluginAvatar(pluginMeta) || '⚙️'}
        background={theme.colorFillContent}
        gap={12}
        size={64}
      />

      <Flexbox style={{ fontSize: 20 }}>{pluginHelpers.getPluginTitle(pluginMeta)}</Flexbox>
      <Typography.Text type={'secondary'}>
        {pluginHelpers.getPluginDesc(pluginMeta)}
      </Typography.Text>
    </>
  );
});

export default Meta;
