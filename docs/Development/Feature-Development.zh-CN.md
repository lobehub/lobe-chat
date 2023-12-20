# 如何开发一个新功能

LobeChat 基于 Next.js 框架构建，使用 TypeScript 作为主要开发语言。在开发新功能时，我们需要遵循一定的开发流程，以确保代码的质量和稳定性。大致的流程分为以下五步：

1. 路由：定义路由 (`src/app`)
2. 数据结构： 定义数据结构 ( `src/types` )
3. 业务功能实现： zustand store (`src/store`)
4. 页面展示：书写静态组件 / 页面 (`src/app/<new-page>/features/<new-feature>.tsx`)
5. 功能绑定：绑定 store 与页面的触发 (`const  [state,function]= useNewStore(s=>[s.state,s.function])`)

我们以 "会话消息" 功能为例，以下是实现这个功能的简要步骤：

#### TOC

- [1. 定义路由](#1-定义路由)
- [2. 定义数据结构](#2-定义数据结构)
- [3. 创建 Zustand Store](#3-创建-zustand-store)
- [4. 创建页面与组件](#4-创建页面与组件)
- [5. 功能绑定](#5-功能绑定)

## 1. 定义路由

在 `src/app` 目录下，我们需要定义一个新的路由来承载 "会话消息" 页面。一般来说，我们会在 `src/app` 下创建一个新的文件夹，例如 `chat`，并且在这个文件夹中创建 `page.tsx`文件，在该文件中导出 React 组件作为页面的主体。

```tsx
// src/app/chat/page.tsx
import ChatPage from './features/chat';

export default ChatPage;
```

## 2. 定义数据结构

在 `src/types` 目录下，我们需要定义 "会话消息" 的数据结构。例如，我们创建一个 `chat.ts` 文件，并在其中定义 `ChatMessage` 类型：

```ts
// src/types/chat.ts

export type ChatMessage = {
  id: string;
  content: string;
  timestamp: number;
  sender: 'user' | 'bot';
};
```

## 3. 创建 Zustand Store

在 `src/store` 目录下，我们需要创建一个新的 Zustand Store 来管理 "会话消息" 的状态。例如，我们创建一个 `chatStore.ts` 文件，并在其中定义一个 Zustand Store：

```ts
// src/store/chatStore.ts
import create from 'zustand';

type ChatState = {
  messages: ChatMessage[];
  addMessage: (message: ChatMessage) => void;
};

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
}));
```

## 4. 创建页面与组件

在 `src/app/<new-page>/features/<new-feature>.tsx` 中，我们需要创建一个新的页面或组件来显示 "会话消息"。在这个文件中，我们可以使用上面创建的 Zustand Store，以及 Ant Design 的组件来构建 UI：

```jsx
// src/features/chat/index.tsx
import { List, Typography } from 'antd';
import { useChatStore } from 'src/store/chatStore';

const ChatPage = () => {
  const messages = useChatStore((state) => state.messages);

  return (
    <List
      dataSource={messages}
      renderItem={(message) => (
        <List.Item>
          <Typography.Text>{message.content}</Typography.Text>
        </List.Item>
      )}
    />
  );
};

export default ChatPage;
```

## 5. 功能绑定

在页面或组件中，我们需要将 Zustand Store 的状态和方法绑定到 UI 上。在上面的示例中，我们已经将 `messages` 状态绑定到了列表的 `dataSource` 属性上。现在，我们还需要一个方法来添加新的消息。我们可以在 Zustand Store 中定义这个方法，然后在页面或组件中使用它：

```jsx
import { Button } from 'antd';

const ChatPage = () => {
  const messages = useChatStore((state) => state.messages);
  const addMessage = useChatStore((state) => state.addMessage);

  const handleSend = () => {
    addMessage({ id: '1', content: 'Hello, world!', timestamp: Date.now(), sender: 'user' });
  };

  return (
    <>
      <List
        dataSource={messages}
        renderItem={(message) => (
          <List.Item>
            <Typography.Text>{message.content}</Typography.Text>
          </List.Item>
        )}
      />
      <Button onClick={handleSend}>Send</Button>
    </>
  );
};

export default ChatPage;
```

以上就是在 LobeChat 中实现 "会话消息" 功能的步骤。当然，在 LobeChat 的实际开发中，真实场景所面临的业务诉求和场景远比上述 demo 复杂，请根据实际情况进行开发。
