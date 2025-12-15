import { Block, Empty } from '@lobehub/ui';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { useDetailContext } from '../../DetailProvider';
import PluginItem from './PluginItem';

const Plugin = memo(() => {
  const { config } = useDetailContext();

  if (!config?.plugins?.length)
    return (
      <Block variant={'outlined'}>
        <Empty />
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
