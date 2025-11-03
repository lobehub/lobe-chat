import { Flexbox, Image, Text } from '@lobehub/ui-rn';
import React from 'react';

const INVALID_IMAGE_URL = 'https://invalid-url-that-does-not-exist.example.com/image.jpg';

export default () => {
  return (
    <Flexbox gap={16}>
      <Text type="secondary">加载失败时会显示默认占位图（根据主题自动适配）</Text>

      <Image
        contentFit="cover"
        source={{ uri: INVALID_IMAGE_URL }}
        style={{ borderRadius: 8, height: 200, width: 200 }}
      />

      <Text type="secondary">自定义占位图</Text>

      <Image
        contentFit="cover"
        fallback="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2ZmNjY2NiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjE4IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSI+Q3VzdG9tPC90ZXh0Pjwvc3ZnPg=="
        source={{ uri: INVALID_IMAGE_URL }}
        style={{ borderRadius: 8, height: 200, width: 200 }}
      />
    </Flexbox>
  );
};
