import { Form } from '@lobehub/ui';
import { Input } from 'antd';
import { memo } from 'react';

import { useHead, useTitle } from './useHead';

const MetaData = memo(() => {
  const title = useTitle();
  const description = useHead('name', 'description');

  return (
    <Form
      itemMinWidth={'max(75%,240px)'}
      items={[
        {
          children: <Input value={title} variant={'filled'} />,
          label: `Title (${title.length})`,
        },
        {
          children: <Input.TextArea rows={2} value={description} variant={'filled'} />,
          label: `Description (${description.length})`,
        },
      ]}
      itemsType={'flat'}
      variant={'pure'}
    />
  );
});

export default MetaData;
