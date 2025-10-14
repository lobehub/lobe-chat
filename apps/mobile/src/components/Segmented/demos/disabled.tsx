import { Flexbox, Segmented, Text } from '@lobehub/ui-rn';
import React from 'react';

export default () => {
  return (
    <Flexbox gap={16}>
      <Flexbox gap={8}>
        <Text type="secondary">整体禁用</Text>
        <Segmented defaultValue="iOS" disabled options={['iOS', 'Android', 'Web']} />
      </Flexbox>

      <Flexbox gap={8}>
        <Text type="secondary">单个选项禁用</Text>
        <Segmented
          defaultValue="ios"
          options={[
            { label: 'iOS', value: 'ios' },
            { disabled: true, label: 'Android', value: 'android' },
            { label: 'Web', value: 'web' },
          ]}
        />
      </Flexbox>
    </Flexbox>
  );
};
