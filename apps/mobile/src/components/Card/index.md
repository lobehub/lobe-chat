---
group: Layout
title: Card
description: General-purpose container for displaying grouped information, supporting title and extra action bar, optional cover, and all Block variant properties.
---

## Features

- ✅ Title and extra actions share a single row layout
- ✅ Optional cover area with automatic rounded corner clipping
- ✅ Content slot accepts any React Node
- ✅ Supports optional dividers, background variants, shadows, and other Block capabilities
- ✅ Complete TypeScript types

## Basic Usage

```tsx
import { Button, Card, Space, Tag } from '@lobehub/ui-rn';
import { Text } from 'react-native';

export default () => (
  <Card extra={<Tag color="processing">Beta</Tag>} title="Custom Server">
    <Text>
      Self-hosted servers allow syncing conversations and model settings to private environments.
    </Text>
    <Space size="small">
      <Button size="small" type="default">
        Cancel
      </Button>
      <Button size="small" type="primary">
        Apply
      </Button>
    </Space>
  </Card>
);
```

## Divider Control

The divider is enabled by default and can be turned off with a boolean value.

```tsx
<Card divider={false} title="No Divider">
  <Text>No divider will be rendered between title and content.</Text>
</Card>
```

## With Cover

```tsx
<Card cover={<Image source={{ uri: '...' }} style={{ height: 160 }} />} title="Card with Cover" />
```

The cover area is automatically clipped into rounded corners, making it more suitable for image and text cards.
