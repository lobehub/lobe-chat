import { Flexbox, Segmented, Text } from '@lobehub/ui-rn';
import React from 'react';

export default () => {
  return (
    <Flexbox gap={16}>
      <Flexbox gap={8}>
        <Text type="secondary">数字选项</Text>
        <Segmented defaultValue={3} options={[1, 2, 3, 4, 5]} />
      </Flexbox>

      <Flexbox gap={8}>
        <Text type="secondary">自定义标签</Text>
        <Segmented
          defaultValue="mobile"
          options={[
            {
              label: (
                <Flexbox align="center" gap={4}>
                  <Text>📱</Text>
                  <Text>手机</Text>
                </Flexbox>
              ),
              value: 'mobile',
            },
            {
              label: (
                <Flexbox align="center" gap={4}>
                  <Text>💻</Text>
                  <Text>电脑</Text>
                </Flexbox>
              ),
              value: 'desktop',
            },
            {
              label: (
                <Flexbox align="center" gap={4}>
                  <Text>⌚</Text>
                  <Text>手表</Text>
                </Flexbox>
              ),
              value: 'watch',
            },
          ]}
        />
      </Flexbox>
    </Flexbox>
  );
};
