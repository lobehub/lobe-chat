import { Highlighter } from '@lobehub/ui';
import { Empty } from 'antd';
import { memo } from 'react';
import { Center } from 'react-layout-kit';

import { useLd } from './useHead';

const Ld = memo(() => {
  const ld = useLd();

  if (!ld)
    return (
      <Center height={'80%'}>
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
      </Center>
    );

  return (
    <Highlighter language="json" type={'pure'}>
      {JSON.stringify(JSON.parse(ld), null, 2)}
    </Highlighter>
  );
});

export default Ld;
