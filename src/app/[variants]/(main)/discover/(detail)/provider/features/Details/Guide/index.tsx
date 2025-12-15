import { Block, Empty } from '@lobehub/ui';
import { Mdx } from '@lobehub/ui/mdx';
import { memo } from 'react';

import { useDetailContext } from '../../DetailProvider';

const Guide = memo(() => {
  const { readme = '' } = useDetailContext();

  if (!readme)
    return (
      <Block variant={'outlined'}>
        <Empty />
      </Block>
    );

  return (
    <Mdx enableImageGallery={false} enableLatex={false} fontSize={14} headerMultiple={0.3}>
      {readme}
    </Mdx>
  );
});

export default Guide;
