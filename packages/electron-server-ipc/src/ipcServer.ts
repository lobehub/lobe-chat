import fs from 'node:fs';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';

import { SOCK_FILE, SOCK_INFO_FILE, WINDOW_PIPE_FILE } from './const';
import { ServerDispatchEventKey } from './events';
import { ElectronIPCEventHandler } from './types';

export class ElectronIPCServer {
  private server: net.Server;
  private socketPath: string;
  private eventHandler: ElectronIPCEventHandler;

  constructor(eventHandler: ElectronIPCEventHandler) {
    const isWindows = process.platform === 'win32';
    // 创建唯一的套接字路径，避免冲突
    this.socketPath = isWindows ? WINDOW_PIPE_FILE : path.join(os.tmpdir(), SOCK_FILE);

    // 如果是 Unix 套接字，确保文件不存在
    if (!isWindows && fs.existsSync(this.socketPath)) {
      fs.unlinkSync(this.socketPath);
    }

    // 创建服务器
    this.server = net.createServer(this.handleConnection.bind(this));

    this.eventHandler = eventHandler;
  }

  // 启动服务器
  public start(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.server.on('error', (err) => {
        console.error('IPC Server error:', err);
        reject(err);
      });

      this.server.listen(this.socketPath, () => {
        console.log(`[ElectronIPCServer] Electron IPC server listening on ${this.socketPath}`);

        // 将套接字路径写入临时文件，供 Next.js 服务端读取
        const tempDir = os.tmpdir();
        const socketInfoPath = path.join(tempDir, SOCK_INFO_FILE);
        fs.writeFileSync(socketInfoPath, JSON.stringify({ socketPath: this.socketPath }), 'utf8');

        resolve();
      });
    });
  }

  // 处理客户端连接
  private handleConnection(socket: net.Socket): void {
    let dataBuffer = '';

    socket.on('data', (data) => {
      dataBuffer += data.toString();

      try {
        // 尝试解析 JSON 消息
        const message = JSON.parse(dataBuffer);
        dataBuffer = ''; // 重置缓冲区

        // 处理请求
        this.handleRequest(socket, message);
      } catch {
        // 如果不是有效的 JSON，可能是消息不完整，继续等待
      }
    });

    socket.on('error', (err) => {
      console.error('Socket error:', err);
    });
  }

  // 处理客户端请求
  private handleRequest = async (socket: net.Socket, request: any) => {
    const { id, method, params } = request;

    // 根据请求方法执行相应的操作
    const eventHandler = this.eventHandler[method as ServerDispatchEventKey];
    if (!eventHandler) return;

    try {
      const data = await eventHandler(params, { id, method, socket });

      this.sendResult(socket, id, data);
    } catch (err) {
      this.sendError(socket, id, `Failed to handle method(${method}): ${(err as Error).message}`);
    }
  };

  // 发送结果
  private sendResult(socket: net.Socket, id: string, result: any): void {
    socket.write(JSON.stringify({ id, result }) + '\n');
  }

  // 发送错误
  private sendError(socket: net.Socket, id: string, error: string): void {
    socket.write(JSON.stringify({ error, id }) + '\n');
  }

  // 关闭服务器
  public close(): Promise<void> {
    return new Promise((resolve) => {
      this.server.close(() => {
        console.log('Electron IPC server closed');

        // 删除套接字文件（Unix 平台）
        if (process.platform !== 'win32' && fs.existsSync(this.socketPath)) {
          fs.unlinkSync(this.socketPath);
        }

        resolve();
      });
    });
  }
}
