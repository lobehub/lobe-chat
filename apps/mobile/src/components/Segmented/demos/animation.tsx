import { Flexbox, Segmented, Text } from '@lobehub/ui-rn';
import React, { useEffect, useState } from 'react';

export default () => {
  const [value1, setValue1] = useState<string | number>('tab1');
  const [value2, setValue2] = useState<string | number>(1);

  // 自动切换演示动画效果
  useEffect(() => {
    const interval = setInterval(() => {
      setValue2((prev) => {
        const current = typeof prev === 'number' ? prev : 1;
        const next = current + 1;
        return next > 5 ? 1 : next;
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Flexbox gap={16}>
      <Flexbox gap={8}>
        <Text type="secondary">手动切换查看滑动动画</Text>
        <Segmented
          onChange={(v) => setValue1(v as string)}
          options={['Tab 1', 'Tab 2', 'Tab 3', 'Tab 4']}
          value={value1}
        />
      </Flexbox>

      <Flexbox gap={8}>
        <Text type="secondary">自动切换演示（每 2 秒）</Text>
        <Segmented
          onChange={setValue2}
          options={[
            { label: '1️⃣', value: 1 },
            { label: '2️⃣', value: 2 },
            { label: '3️⃣', value: 3 },
            { label: '4️⃣', value: 4 },
            { label: '5️⃣', value: 5 },
          ]}
          shape="round"
          value={value2}
        />
      </Flexbox>

      <Flexbox gap={8}>
        <Text type="secondary">长短选项混合</Text>
        <Segmented defaultValue="中等长度" options={['短', '中等长度', '非常非常长的选项']} />
      </Flexbox>
    </Flexbox>
  );
};
