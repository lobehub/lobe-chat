import { Empty, Highlighter } from '@lobehub/ui';
import { memo } from 'react';
import { Center } from 'react-layout-kit';

import { useLd } from './useHead';

const Ld = memo(() => {
  const ld = useLd();

  if (!ld)
    return (
      <Center height={'80%'}>
        <Empty />
      </Center>
    );

  return (
    <Highlighter language="json" variant={'borderless'}>
      {JSON.stringify(JSON.parse(ld), null, 2)}
    </Highlighter>
  );
});

export default Ld;
