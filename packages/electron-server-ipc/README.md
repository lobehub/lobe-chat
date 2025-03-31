# @lobechat/electron-server-ipc

LobeHub 的 Electron 应用与服务端之间的 IPC（进程间通信）模块，提供可靠的跨进程通信能力。

## 📝 简介

`@lobechat/electron-server-ipc` 是 LobeHub 桌面应用的核心组件，负责处理 Electron 进程与 nextjs 服务端之间的通信。它提供了一套简单而健壮的 API，用于在不同进程间传递数据和执行远程方法调用。

## 🛠️ 核心功能

- **可靠的 IPC 通信**: 基于 Socket 的通信机制，确保跨进程通信的稳定性和可靠性
- **自动重连机制**: 客户端具备断线重连功能，提高应用稳定性
- **类型安全**: 使用 TypeScript 提供完整的类型定义，确保 API 调用的类型安全
- **跨平台支持**: 同时支持 Windows、macOS 和 Linux 平台

## 🧩 核心组件

### IPC 服务端 (ElectronIPCServer)

负责监听客户端请求并响应，通常运行在 Electron 的主进程中：

```typescript
import { ElectronIPCEventHandler, ElectronIPCServer } from '@lobechat/electron-server-ipc';

// 定义处理函数
const eventHandler: ElectronIPCEventHandler = {
  getDatabasePath: async () => {
    return '/path/to/database';
  },
  // 其他处理函数...
};

// 创建并启动服务器
const server = new ElectronIPCServer(eventHandler);
server.start();
```

### IPC 客户端 (ElectronIpcClient)

负责连接到服务端并发送请求，通常在服务端（如 Next.js 服务）中使用：

```typescript
import { ElectronIPCMethods, ElectronIpcClient } from '@lobechat/electron-server-ipc';

// 创建客户端
const client = new ElectronIpcClient();

// 发送请求
const dbPath = await client.sendRequest(ElectronIPCMethods.getDatabasePath);
```

## 📌 说明

这是 LobeHub 的内部模块 (`"private": true`)，专为 LobeHub 桌面应用设计，不作为独立包发布。
