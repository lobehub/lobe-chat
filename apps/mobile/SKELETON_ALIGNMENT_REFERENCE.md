# Skeleton 组件尺寸对齐参考表

## Button 尺寸对照表

| 尺寸   | Token 基础值          | 实际高度 (×1.25) | 默认圆角 (÷2.5) | 圆形圆角 (×2) |
| ------ | --------------------- | ---------------- | --------------- | ------------- |
| Small  | controlHeightSM: 32px | 40px             | 16px            | 80px          |
| Middle | controlHeight: 38px   | 47.5px           | 19px            | 95px          |
| Large  | controlHeightLG: 44px | 55px             | 22px            | 110px         |

### 计算公式

```typescript
// 高度
const baseHeight = token.controlHeight;
const actualHeight = baseHeight * 1.25;

// 圆角
const defaultBorderRadius = actualHeight / 2.5;
const circleBorderRadius = actualHeight * 2;
```

### 示例代码

```tsx
// Small 按钮
<Skeleton.Button size="small" width={100} />
<Button size="small">Small</Button>

// Middle 按钮 (默认)
<Skeleton.Button size="middle" width={120} />
<Button size="middle">Middle</Button>

// Large 按钮
<Skeleton.Button size="large" width={140} />
<Button size="large">Large</Button>

// 圆形按钮
<Skeleton.Button shape="circle" size="middle" />
<Button shape="circle" size="middle">M</Button>

// Block 按钮
<Skeleton.Button block />
<Button block>Block Button</Button>
```

## Avatar 尺寸对照表

| 属性     | Skeleton.Avatar | Avatar 组件 | 对齐状态  |
| -------- | --------------- | ----------- | --------- |
| 默认尺寸 | 36px            | 32px        | ⚠️ 需注意 |
| 圆形圆角 | size / 2        | size / 2    | ✅ 对齐   |
| 方形圆角 | borderRadiusLG  | -           | N/A       |

> **注意**: Skeleton.Avatar 的默认尺寸是 36px，而 Avatar 组件的默认尺寸是 32px。\
> 建议显式指定 `size={32}` 以确保完全对齐。

### 示例代码

```tsx
// 推荐：显式指定尺寸
<Skeleton.Avatar size={32} />
<Avatar size={32} avatar="👤" />

// 不同尺寸
<Skeleton.Avatar size={24} />
<Avatar size={24} avatar="👤" />

<Skeleton.Avatar size={48} />
<Avatar size={48} avatar="👤" />

<Skeleton.Avatar size={64} />
<Avatar size={64} avatar="👤" />
```

## 实际应用场景

### 用户列表项

```tsx
const UserListItem = ({ loading, user }) => {
  if (loading) {
    return (
      <Flexbox horizontal align="center" gap={12} padding={16}>
        <Skeleton.Avatar size={40} />
        <Flexbox flex={1} gap={4}>
          <Skeleton.Title width="60%" />
          <Skeleton.Paragraph rows={1} width="40%" />
        </Flexbox>
      </Flexbox>
    );
  }

  return (
    <Flexbox horizontal align="center" gap={12} padding={16}>
      <Avatar size={40} avatar={user.avatar} />
      <Flexbox flex={1} gap={4}>
        <Text strong>{user.name}</Text>
        <Text type="secondary">{user.role}</Text>
      </Flexbox>
    </Flexbox>
  );
};
```

### 卡片内容

```tsx
const ContentCard = ({ loading, content }) => {
  if (loading) {
    return (
      <Block variant="filled" padding={16} gap={12}>
        <Skeleton.Title width="80%" />
        <Skeleton.Paragraph rows={3} />
        <Skeleton.Button width={100} />
      </Block>
    );
  }

  return (
    <Block variant="filled" padding={16} gap={12}>
      <Text as="h3">{content.title}</Text>
      <Text>{content.description}</Text>
      <Button onPress={content.onPress}>{content.buttonText}</Button>
    </Block>
  );
};
```

### Profile 页面

```tsx
const ProfilePage = ({ loading, profile }) => {
  if (loading) {
    return (
      <Flexbox gap={24} padding={16}>
        <Center>
          <Skeleton.Avatar size={80} />
        </Center>
        <Flexbox gap={8}>
          <Skeleton.Title width="60%" />
          <Skeleton.Paragraph rows={2} />
        </Flexbox>
        <Flexbox horizontal gap={12}>
          <Skeleton.Button block size="large" />
          <Skeleton.Button block size="large" />
        </Flexbox>
      </Flexbox>
    );
  }

  return (
    <Flexbox gap={24} padding={16}>
      <Center>
        <Avatar size={80} avatar={profile.avatar} />
      </Center>
      <Flexbox gap={8}>
        <Text as="h2" align="center">
          {profile.name}
        </Text>
        <Text type="secondary" align="center">
          {profile.bio}
        </Text>
      </Flexbox>
      <Flexbox horizontal gap={12}>
        <Button block size="large" onPress={profile.onFollow}>
          关注
        </Button>
        <Button block size="large" variant="outlined" onPress={profile.onMessage}>
          消息
        </Button>
      </Flexbox>
    </Flexbox>
  );
};
```

## 对齐验证清单

在使用 Skeleton 组件时，请确认：

- [ ] **Button**: 使用相同的 `size` prop (small/middle/large)
- [ ] **Button**: 使用相同的 `shape` prop (default/circle)
- [ ] **Button**: 如果是 block 按钮，设置 `block={true}`
- [ ] **Avatar**: 显式指定相同的 `size` 值
- [ ] **Avatar**: 注意默认尺寸差异（Skeleton: 36px, Avatar: 32px）
- [ ] **布局**: Skeleton 和实际内容使用相同的容器和间距

## 常见问题

### Q: 为什么 Skeleton.Button 看起来比之前大了？

A: 修复前的 Skeleton.Button 高度计算不正确。修复后，高度与实际 Button 组件对齐（应用了 1.25 倍率），这样加载完成时不会出现布局跳动。

### Q: Skeleton.Avatar 的默认尺寸为什么是 36px？

A: 这是历史遗留设置。建议显式指定 `size={32}` 来匹配 Avatar 组件的默认尺寸。

### Q: 如何确保 Skeleton 和实际内容完全对齐？

A:

1. 使用相同的 props（size, shape, block 等）
2. 使用相同的布局容器和间距
3. 在 Playground 的 "尺寸对齐" demo 中验证效果

### Q: 为什么圆形按钮的圆角是 `height * 2`？

A: 这是为了创建完全圆形的效果。`borderRadius` 大于或等于宽 / 高的情况下会变成圆形，使用 `height * 2` 可以确保在所有情况下都是圆形。

## 相关文件

- 实现: `src/components/Skeleton/Button.tsx`
- 实现: `src/components/Skeleton/Avatar.tsx`
- 文档: `src/components/Skeleton/index.md`
- Demo: `src/components/Skeleton/demos/alignment.tsx`
- 对比: `src/components/Button/Button.tsx`
- 对比: `src/components/Avatar/Avatar.tsx`
