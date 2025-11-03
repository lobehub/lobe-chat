import { Flexbox, MaterialFileTypeIcon, Text } from '@lobehub/ui-rn';
import React from 'react';

export default () => {
  return (
    <Flexbox gap={24}>
      <Flexbox gap={12}>
        <Text as="h4">不同文件类型</Text>
        <Flexbox gap={16} horizontal wrap="wrap">
          <Flexbox align="center" gap={8}>
            <MaterialFileTypeIcon filename="app.tsx" type="file" />
            <Text fontSize={12} type="secondary">
              TypeScript
            </Text>
          </Flexbox>
          <Flexbox align="center" gap={8}>
            <MaterialFileTypeIcon filename="styles.css" type="file" />
            <Text fontSize={12} type="secondary">
              CSS
            </Text>
          </Flexbox>
          <Flexbox align="center" gap={8}>
            <MaterialFileTypeIcon filename="app.py" type="file" />
            <Text fontSize={12} type="secondary">
              Python
            </Text>
          </Flexbox>
          <Flexbox align="center" gap={8}>
            <MaterialFileTypeIcon filename="main.go" type="file" />
            <Text fontSize={12} type="secondary">
              Go
            </Text>
          </Flexbox>
        </Flexbox>
      </Flexbox>

      <Flexbox gap={12}>
        <Text as="h4">文件夹类型</Text>
        <Flexbox gap={16} horizontal>
          <Flexbox align="center" gap={8}>
            <MaterialFileTypeIcon filename="node_modules" type="folder" />
            <Text fontSize={12} type="secondary">
              node_modules
            </Text>
          </Flexbox>
          <Flexbox align="center" gap={8}>
            <MaterialFileTypeIcon filename=".git" type="folder" />
            <Text fontSize={12} type="secondary">
              .git
            </Text>
          </Flexbox>
          <Flexbox align="center" gap={8}>
            <MaterialFileTypeIcon filename="src" type="folder" />
            <Text fontSize={12} type="secondary">
              src
            </Text>
          </Flexbox>
        </Flexbox>
      </Flexbox>
    </Flexbox>
  );
};
