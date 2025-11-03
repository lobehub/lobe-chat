import { Flexbox, MaterialFileTypeIcon, Text } from '@lobehub/ui-rn';
import React from 'react';

export default () => {
  return (
    <Flexbox gap={16}>
      <Text as="h4">不同尺寸</Text>
      <Flexbox align="flex-start" gap={24} horizontal>
        <Flexbox align="center" gap={8}>
          <MaterialFileTypeIcon filename="app.tsx" size={24} type="file" />
          <Text fontSize={12} type="secondary">
            24px
          </Text>
        </Flexbox>
        <Flexbox align="center" gap={8}>
          <MaterialFileTypeIcon filename="app.tsx" size={32} type="file" />
          <Text fontSize={12} type="secondary">
            32px
          </Text>
        </Flexbox>
        <Flexbox align="center" gap={8}>
          <MaterialFileTypeIcon filename="app.tsx" size={48} type="file" />
          <Text fontSize={12} type="secondary">
            48px (默认)
          </Text>
        </Flexbox>
        <Flexbox align="center" gap={8}>
          <MaterialFileTypeIcon filename="app.tsx" size={64} type="file" />
          <Text fontSize={12} type="secondary">
            64px
          </Text>
        </Flexbox>
        <Flexbox align="center" gap={8}>
          <MaterialFileTypeIcon filename="app.tsx" size={96} type="file" />
          <Text fontSize={12} type="secondary">
            96px
          </Text>
        </Flexbox>
      </Flexbox>
    </Flexbox>
  );
};
