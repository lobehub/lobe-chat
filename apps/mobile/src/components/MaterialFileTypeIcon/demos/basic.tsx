import { Flexbox, MaterialFileTypeIcon, Text } from '@lobehub/ui-rn';
import React from 'react';

export default () => {
  return (
    <Flexbox gap={24}>
      {/* 文件类型示例 */}
      <Flexbox gap={12}>
        <Text as="h4">常见文件类型</Text>
        <Flexbox gap={16} horizontal wrap="wrap">
          <Flexbox align="center" gap={8}>
            <MaterialFileTypeIcon filename="index.tsx" type="file" />
            <Text fontSize={12} type="secondary">
              TypeScript
            </Text>
          </Flexbox>
          <Flexbox align="center" gap={8}>
            <MaterialFileTypeIcon filename="package.json" type="file" />
            <Text fontSize={12} type="secondary">
              JSON
            </Text>
          </Flexbox>
          <Flexbox align="center" gap={8}>
            <MaterialFileTypeIcon filename="README.md" type="file" />
            <Text fontSize={12} type="secondary">
              Markdown
            </Text>
          </Flexbox>
          <Flexbox align="center" gap={8}>
            <MaterialFileTypeIcon filename="app.py" type="file" />
            <Text fontSize={12} type="secondary">
              Python
            </Text>
          </Flexbox>
          <Flexbox align="center" gap={8}>
            <MaterialFileTypeIcon filename="styles.css" type="file" />
            <Text fontSize={12} type="secondary">
              CSS
            </Text>
          </Flexbox>
        </Flexbox>
      </Flexbox>

      {/* 文件夹示例 */}
      <Flexbox gap={12}>
        <Text as="h4">文件夹</Text>
        <Flexbox gap={16} horizontal>
          <Flexbox align="center" gap={8}>
            <MaterialFileTypeIcon filename="node_modules" type="folder" />
            <Text fontSize={12} type="secondary">
              关闭状态
            </Text>
          </Flexbox>
          <Flexbox align="center" gap={8}>
            <MaterialFileTypeIcon filename="node_modules" open type="folder" />
            <Text fontSize={12} type="secondary">
              展开状态
            </Text>
          </Flexbox>
        </Flexbox>
      </Flexbox>
    </Flexbox>
  );
};
