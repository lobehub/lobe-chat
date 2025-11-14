import { WriteLocalFileParams } from '@lobechat/electron-client-ipc';
import { BuiltinRenderProps } from '@lobechat/types';
import { Icon } from '@lobehub/ui';
import { Skeleton } from 'antd';
import { ChevronRight } from 'lucide-react';
import path from 'path-browserify-esm';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { LocalFile, LocalFolder } from '@/features/LocalFile';

const WriteFile = memo<BuiltinRenderProps<WriteLocalFileParams>>(({ args }) => {
  if (!args) return <Skeleton active />;

  const { base, dir } = path.parse(args.path);

  return (
    <Flexbox horizontal>
      <LocalFolder path={dir} />
      <Icon icon={ChevronRight} />
      <LocalFile name={base} path={args.path} />
    </Flexbox>
  );
});

export default WriteFile;
