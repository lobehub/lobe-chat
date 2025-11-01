import { Block } from '@lobehub/ui';
import { Empty } from 'antd';
import Link from 'next/link';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';
import urlJoin from 'url-join';

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
      {config?.plugins.map((item) => (
        <Link href={urlJoin('/discover/plugin', item)} key={item}>
          <PluginItem identifier={item} />
        </Link>
      ))}
    </Flexbox>
  );
});

export default Plugin;
