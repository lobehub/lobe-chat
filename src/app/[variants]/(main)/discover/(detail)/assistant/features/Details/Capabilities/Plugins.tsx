import { Block } from '@lobehub/ui';
import { Empty } from 'antd';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { useDetailContext } from '../../DetailProvider';
import PluginItem from './PluginItem';

const Plugin = memo(() => {
  const { config } = useDetailContext();

  if (!config?.plugins?.length)
    return (
      <Block variant={'outlined'}>
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
      </Block>
    );

  return (
    <Flexbox gap={8}>
      {config?.plugins.map((item) => {
        const identifier =
          typeof item === 'string' ? item : (item as { identifier: string }).identifier;

        return <PluginItem identifier={identifier} key={identifier} />;
      })}
    </Flexbox>
  );
});

export default Plugin;
