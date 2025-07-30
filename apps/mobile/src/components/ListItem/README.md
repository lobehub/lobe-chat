# ListItem 组件

一个功能丰富的 React Native 列表项组件，支持头像、描述、额外内容显示和路由导航。

## 特性

- ✅ **灵活头像** - 支持图片 URL、emoji、自定义 React 组件
- ✅ **内容丰富** - 支持标题、描述、额外内容显示
- ✅ **路由集成** - 与 Expo Router 深度集成，支持导航跳转
- ✅ **交互响应** - 支持点击事件和触摸反馈
- ✅ **响应式布局** - 自适应内容长度和屏幕尺寸
- ✅ **暗色主题** - 现代化的暗色设计风格
- ✅ **TypeScript** - 完整的 TypeScript 类型支持
- ✅ **高性能** - 优化的渲染性能和内存使用
- ✅ **自定义样式** - 灵活的样式配置选项
- ✅ **文本截断** - 自动处理长文本的显示

## 安装

ListItem 组件依赖以下包：

```bash
# 必需依赖
npm install expo-router
# 如果使用网络图片
npm install react-native-fast-image # 可选，用于更好的图片性能
```

## 基本用法

### 简单列表项

```jsx
import ListItem from '@/components/ListItem';

export default function BasicExample() {
  return (
    <ListItem
      title="用户名"
      avatar="👤"
      description="这是用户的描述信息"
      onPress={() => console.log('点击了列表项')}
    />
  );
}
```

### 网络图片头像

```jsx
import ListItem from '@/components/ListItem';

export default function ImageAvatarExample() {
  return (
    <ListItem
      title="John Doe"
      avatar="https://example.com/avatar.jpg"
      description="软件工程师"
      extra="在线"
      onPress={() => console.log('点击了用户')}
    />
  );
}
```

### 路由导航

```jsx
import ListItem from '@/components/ListItem';

export default function NavigationExample() {
  return <ListItem title="设置" avatar="⚙️" description="应用程序设置" href="/settings" />;
}
```

## API 参考

### Props

| 属性 | 类型 | 默认值 | 描述 |
| --- | --- | --- | --- |
| `title` | `string` | - | **必需** - 列表项的主标题 |
| `avatar` | `string \| React.ReactNode` | - | **必需** - 头像，可以是图片 URL、emoji 或 React 组件 |
| `description` | `string` | - | 描述文本，显示在标题下方 |
| `extra` | `React.ReactNode` | - | 额外内容，显示在右侧 |
| `href` | `Href` | - | 路由地址，使用 Expo Router 进行导航 |
| `onPress` | `() => void` | - | 点击事件回调函数 |

### 头像类型说明

#### 图片 URL

当`avatar`为字符串且符合 URL 格式时，将显示为网络图片：

```jsx
<ListItem title="用户名" avatar="https://example.com/avatar.jpg" />
```

#### Emoji 字符

当`avatar`为普通字符串时，将显示为 emoji 或文本：

```jsx
<ListItem title="设置" avatar="⚙️" />
```

## 使用场景

### 用户列表

```jsx
const users = [
  {
    id: 1,
    name: 'Alice Johnson',
    avatar: 'https://example.com/alice.jpg',
    status: '在线',
    description: '产品经理',
  },
  {
    id: 2,
    name: 'Bob Smith',
    avatar: '👨‍💻',
    status: '忙碌',
    description: '前端开发者',
  },
];

export default function UserList() {
  return (
    <View>
      {users.map((user) => (
        <ListItem
          key={user.id}
          title={user.name}
          avatar={user.avatar}
          description={user.description}
          extra={user.status}
          href={`/users/${user.id}`}
        />
      ))}
    </View>
  );
}
```

### 设置菜单

```jsx
const settingsItems = [
  {
    title: '账户设置',
    avatar: '👤',
    description: '管理您的账户信息',
    href: '/settings/account',
  },
  {
    title: '隐私设置',
    avatar: '🔒',
    description: '控制您的隐私选项',
    href: '/settings/privacy',
  },
  {
    title: '通知设置',
    avatar: '🔔',
    description: '管理通知偏好',
    href: '/settings/notifications',
  },
];

export default function SettingsMenu() {
  return (
    <View>
      {settingsItems.map((item, index) => (
        <ListItem
          key={index}
          title={item.title}
          avatar={item.avatar}
          description={item.description}
          href={item.href}
        />
      ))}
    </View>
  );
}
```

### 聊天会话列表

```jsx
export default function ChatList() {
  const [sessions, setSessions] = useState([
    {
      id: 1,
      name: 'AI助手',
      avatar: '🤖',
      lastMessage: '有什么我可以帮助您的吗？',
      time: '10:30',
      unread: 2,
    },
    {
      id: 2,
      name: '工作群聊',
      avatar: '💼',
      lastMessage: '明天的会议取消了',
      time: '昨天',
      unread: 0,
    },
  ]);

  return (
    <View>
      {sessions.map((session) => (
        <ListItem
          key={session.id}
          title={session.name}
          avatar={session.avatar}
          description={session.lastMessage}
          extra={
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{ fontSize: 12, color: '#8E8E93' }}>{session.time}</Text>
              {session.unread > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{session.unread}</Text>
                </View>
              )}
            </View>
          }
          href={`/chat/${session.id}`}
        />
      ))}
    </View>
  );
}
```

## 样式定制

### 默认样式

组件使用以下默认样式配置：

```javascript
const styles = StyleSheet.create({
  sessionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 4,
    backgroundColor: '#1C1C1E',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#8E8E93',
  },
});
```

### 自定义样式

如果需要修改样式，可以通过以下方式：

#### 1. 修改组件样式文件

直接编辑`components/ListItem/index.tsx`中的样式定义：

```javascript
const styles = StyleSheet.create({
  sessionItem: {
    // 自定义容器样式
    backgroundColor: '#2C2C2E', // 修改背景色
    padding: 16, // 修改内边距
    borderRadius: 12, // 修改圆角
  },
  title: {
    // 自定义标题样式
    fontSize: 18, // 修改字体大小
    fontWeight: 'bold', // 修改字体粗细
    color: '#007AFF', // 修改颜色
  },
});
```

#### 2. 创建样式变体

创建不同的样式变体以适应不同场景：

```jsx
// 紧凑模式
const compactStyles = StyleSheet.create({
  sessionItem: {
    padding: 8,
    marginBottom: 2,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  title: {
    fontSize: 14,
  },
});

// 卡片模式
const cardStyles = StyleSheet.create({
  sessionItem: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    margin: 8,
  },
});
```

## 性能优化

### 图片加载优化

对于大量网络图片的场景，建议使用图片缓存：

```jsx
import FastImage from 'react-native-fast-image';

// 在组件中替换Image组件
{isUrl ? (
  <FastImage
    source={{ uri: avatar, priority: FastImage.priority.high }}
    style={styles.avatar}
    resizeMode={FastImage.resizeMode.cover}
  />
) : (
  // ... emoji渲染
)}
```

### 长列表优化

对于长列表，建议使用 FlatList 或 SectionList：

```jsx
import { FlatList } from 'react-native';

export default function OptimizedList({ data }) {
  const renderItem = ({ item }) => (
    <ListItem
      title={item.title}
      avatar={item.avatar}
      description={item.description}
      href={item.href}
    />
  );

  return (
    <FlatList
      data={data}
      renderItem={renderItem}
      keyExtractor={(item) => item.id.toString()}
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      windowSize={10}
    />
  );
}
```

### 内存管理

- 避免在 render 方法中创建匿名函数
- 使用 useCallback 缓存回调函数
- 合理使用 memo 优化重渲染

```jsx
import { useCallback, memo } from 'react';

const OptimizedListItem = memo(({ item, onPress }) => {
  const handlePress = useCallback(() => {
    onPress(item.id);
  }, [item.id, onPress]);

  return (
    <ListItem
      title={item.title}
      avatar={item.avatar}
      description={item.description}
      onPress={handlePress}
    />
  );
});
```

## 无障碍性支持

### 基础无障碍性

组件自动支持基础的无障碍性功能：

```jsx
<ListItem
  title="设置"
  avatar="⚙️"
  description="应用程序设置"
  // 自动添加无障碍标签
  accessibilityLabel="设置, 应用程序设置"
  accessibilityRole="button"
  accessibilityHint="点击进入设置页面"
/>
```

### 高级无障碍性配置

```jsx
<ListItem
  title="用户资料"
  avatar="👤"
  description="查看和编辑个人信息"
  accessibilityLabel="用户资料"
  accessibilityHint="双击查看和编辑个人信息"
  accessibilityRole="button"
  accessibilityState={{ selected: isSelected }}
/>
```

## 测试

### 单元测试示例

```jsx
import { render, fireEvent } from '@testing-library/react-native';
import ListItem from '../index';

describe('ListItem', () => {
  it('renders title correctly', () => {
    const { getByText } = render(<ListItem title="Test Title" avatar="👤" />);
    expect(getByText('Test Title')).toBeTruthy();
  });

  it('handles press events', () => {
    const onPress = jest.fn();
    const { getByRole } = render(<ListItem title="Test" avatar="👤" onPress={onPress} />);

    fireEvent.press(getByRole('button'));
    expect(onPress).toHaveBeenCalled();
  });

  it('renders network images', () => {
    const { getByRole } = render(<ListItem title="Test" avatar="https://example.com/image.jpg" />);
    expect(getByRole('image')).toBeTruthy();
  });
});
```

## 故障排除

### 常见问题

1. **图片不显示**
   - 检查图片 URL 是否有效
   - 确认网络权限配置
   - 验证图片格式是否支持

2. **导航不工作**
   - 确保正确安装了 expo-router
   - 检查路由配置是否正确
   - 验证 href 路径是否存在

3. **样式异常**
   - 检查是否有样式冲突
   - 确认容器组件的样式设置
   - 验证主题配置

4. **性能问题**
   - 使用 FlatList 替代 ScrollView
   - 启用图片缓存
   - 优化重渲染逻辑

### 调试建议

1. 使用 React DevTools 查看组件状态
2. 检查 console 中的错误信息
3. 验证 props 传递是否正确
4. 测试不同设备上的显示效果

## 最佳实践

1. **内容设计**
   - 标题简洁明了
   - 描述提供有用信息
   - 合理使用额外内容区域

2. **交互设计**
   - 提供清晰的视觉反馈
   - 保持交互的一致性
   - 考虑用户的操作习惯

3. **性能优化**
   - 避免过度渲染
   - 合理使用图片缓存
   - 优化长列表性能

4. **用户体验**
   - 支持无障碍性访问
   - 保持视觉一致性

## 示例代码

查看`demos/`目录下的完整示例：

- `basic.tsx` - 基础用法示例
- `avatars.tsx` - 不同头像类型示例
- `navigation.tsx` - 导航和交互示例
- `advanced.tsx` - 高级功能和样式示例
