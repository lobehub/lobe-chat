import fs from 'node:fs';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';

import { SOCK_FILE, SOCK_INFO_FILE, WINDOW_PIPE_FILE } from './const';
import { ServerDispatchEventKey } from './events';

export class ElectronIpcClient {
  private socketPath: string | null = null;
  private connected: boolean = false;
  private socket: net.Socket | null = null;
  // eslint-disable-next-line @typescript-eslint/ban-types
  private requestQueue: Map<string, { reject: Function; resolve: Function }> = new Map();
  // eslint-disable-next-line no-undef
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private connectionAttempts: number = 0;
  private maxConnectionAttempts: number = 5;
  private dataBuffer: string = '';

  constructor() {
    this.initialize();
  }

  // 初始化客户端
  private initialize() {
    try {
      // 从临时文件读取套接字路径
      const tempDir = os.tmpdir();
      const socketInfoPath = path.join(tempDir, SOCK_INFO_FILE);

      if (fs.existsSync(socketInfoPath)) {
        const socketInfo = JSON.parse(fs.readFileSync(socketInfoPath, 'utf8'));
        this.socketPath = socketInfo.socketPath;
      } else {
        // 如果找不到套接字信息，使用默认路径
        this.socketPath =
          process.platform === 'win32' ? WINDOW_PIPE_FILE : path.join(os.tmpdir(), SOCK_FILE);
      }
    } catch (err) {
      console.error('Failed to initialize IPC client:', err);
      this.socketPath = null;
    }
  }

  // 连接到 Electron IPC 服务器
  private connect(): Promise<void> {
    if (this.connected || !this.socketPath) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      try {
        this.socket = net.createConnection(this.socketPath!, () => {
          this.connected = true;
          this.connectionAttempts = 0;
          console.log('[ElectronIpcClient] Connected to Electron IPC server');
          resolve();
        });

        this.socket.on('data', (data) => {
          const dataStr = data.toString();
          console.log('output:', dataStr);

          // 将新数据添加到缓冲区
          this.dataBuffer += dataStr;

          // 按换行符分割消息
          const messages = this.dataBuffer.split('\n');

          // 最后一个元素可能是不完整的消息，保留在缓冲区
          this.dataBuffer = messages.pop() || '';

          for (const message of messages) {
            if (!message.trim()) continue; // 跳过空消息

            try {
              const response = JSON.parse(message);
              const { id, result, error } = response;

              const pending = this.requestQueue.get(id);
              if (pending) {
                this.requestQueue.delete(id);
                if (error) {
                  pending.reject(new Error(error));
                } else {
                  pending.resolve(result);
                }
              }
            } catch (err) {
              console.error(
                '[ElectronIpcClient] Failed to parse response:',
                err,
                'message:',
                message,
              );
            }
          }
        });

        this.socket.on('error', (err) => {
          console.error('[ElectronIpcClient] Socket error:', err);
          this.connected = false;
          this.handleDisconnect();
          reject(err);
        });

        this.socket.on('close', () => {
          console.log('[ElectronIpcClient] Socket closed');
          this.connected = false;
          this.handleDisconnect();
        });
      } catch (err) {
        console.error('[ElectronIpcClient] Failed to connect to IPC server:', err);
        this.handleDisconnect();
        reject(err);
      }
    });
  }

  // 处理断开连接
  private handleDisconnect() {
    // 清除重连定时器
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    // 清空数据缓冲区
    this.dataBuffer = '';

    // 拒绝所有待处理的请求
    for (const [, { reject }] of this.requestQueue) {
      reject(new Error('[ElectronIpcClient] Connection to Electron IPC server lost'));
    }
    this.requestQueue.clear();

    // 尝试重新连接
    if (this.connectionAttempts < this.maxConnectionAttempts) {
      this.connectionAttempts++;
      const delay = Math.min(1000 * Math.pow(2, this.connectionAttempts - 1), 30_000);

      this.reconnectTimeout = setTimeout(() => {
        this.connect().catch((err) => {
          console.error(
            `[ElectronIpcClient] Reconnection attempt ${this.connectionAttempts} failed:`,
            err,
          );
        });
      }, delay);
    }
  }

  // 发送请求到 Electron IPC 服务器
  public async sendRequest<T>(method: ServerDispatchEventKey, params: any = {}): Promise<T> {
    if (!this.socketPath) {
      throw new Error('[ElectronIpcClient] Electron IPC connection not available');
    }

    // 如果未连接，先连接
    if (!this.connected) {
      await this.connect();
    }

    return new Promise<T>((resolve, reject) => {
      try {
        const id = Math.random().toString(36).slice(2, 15);
        const request = { id, method, params };

        // 将请求添加到队列
        this.requestQueue.set(id, { reject, resolve });

        // 设置超时
        const timeout = setTimeout(() => {
          this.requestQueue.delete(id);
          reject(new Error(`[ElectronIpcClient] Request timed out, method: ${method}`));
        }, 5000);

        // 发送请求
        this.socket!.write(JSON.stringify(request), (err) => {
          if (err) {
            clearTimeout(timeout);
            this.requestQueue.delete(id);
            reject(err);
          }
        });
      } catch (err) {
        reject(err);
      }
    });
  }

  // 关闭连接
  public close() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.socket) {
      this.socket.end();
      this.socket = null;
    }

    this.connected = false;
  }
}
