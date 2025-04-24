import debug from 'debug';
import fs from 'node:fs';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';

import { SOCK_FILE, SOCK_INFO_FILE, WINDOW_PIPE_FILE } from './const';
import { ServerDispatchEventKey } from './events';

const log = debug('electron-server-ipc:client');

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
  private readonly appId: string;

  constructor(appId: string) {
    log('Initializing client', appId);
    this.appId = appId;
    this.initialize();
  }

  // 初始化客户端
  private initialize() {
    try {
      const tempDir = os.tmpdir();

      // Windows 平台强制使用命名管道
      if (process.platform === 'win32') {
        this.socketPath = WINDOW_PIPE_FILE(this.appId);
        log('Using named pipe for Windows: %s', this.socketPath);
        return;
      }

      // 其他平台尝试读取 sock info 文件
      const socketInfoPath = path.join(tempDir, SOCK_INFO_FILE(this.appId));

      log('Looking for socket info at: %s', socketInfoPath);
      if (fs.existsSync(socketInfoPath)) {
        const socketInfo = JSON.parse(fs.readFileSync(socketInfoPath, 'utf8'));
        this.socketPath = socketInfo.socketPath;
        log('Found socket path: %s', this.socketPath);
      } else {
        // 如果找不到套接字信息，使用默认 sock 文件路径
        this.socketPath = path.join(tempDir, SOCK_FILE(this.appId));
        log('Socket info not found, using default sock path: %s', this.socketPath);
      }
    } catch (err) {
      console.error('Failed to initialize IPC client:', err);
      this.socketPath = null;
    }
  }

  // 连接到 Electron IPC 服务器
  private connect(): Promise<void> {
    if (this.connected || !this.socketPath) {
      log('Connection skipped: Connected=%s, SocketPath=%s', this.connected, !!this.socketPath);
      return Promise.resolve();
    }

    log('Attempting to connect to socket: %s', this.socketPath);
    return new Promise((resolve, reject) => {
      try {
        this.socket = net.createConnection(this.socketPath!, () => {
          this.connected = true;
          this.connectionAttempts = 0;
          log('Connected to Electron IPC server');
          resolve();
        });

        this.socket.on('data', (data) => {
          const dataStr = data.toString();
          log('Received data: %s', dataStr.length > 100 ? `${dataStr.slice(0, 100)}...` : dataStr);

          // 将新数据添加到缓冲区
          this.dataBuffer += dataStr;

          // 按换行符分割消息
          const messages = this.dataBuffer.split('\n');

          // 最后一个元素可能是不完整的消息，保留在缓冲区
          this.dataBuffer = messages.pop() || '';
          log('Buffer remainder: %d bytes', this.dataBuffer.length);

          for (const message of messages) {
            if (!message.trim()) continue; // 跳过空消息

            try {
              const response = JSON.parse(message);
              const { id, result, error } = response;
              log('Parsed response for request ID: %s, has error: %s', id, !!error);

              const pending = this.requestQueue.get(id);
              if (pending) {
                log('Found pending request for ID: %s', id);
                this.requestQueue.delete(id);
                if (error) {
                  console.error('Error in response for ID %s: %s', id, error);
                  pending.reject(new Error(error));
                } else {
                  log('Resolving request ID: %s', id);
                  pending.resolve(result);
                }
              } else {
                log('No pending request found for ID: %s', id);
              }
            } catch (err) {
              console.error('Failed to parse response: %o, message: %s', err, message);
            }
          }
        });

        this.socket.on('error', (err) => {
          console.error('Socket error: %o', err);
          this.connected = false;
          this.handleDisconnect();
          reject(err);
        });

        this.socket.on('close', () => {
          log('Socket closed');
          this.connected = false;
          this.handleDisconnect();
        });
      } catch (err) {
        console.error('Failed to connect to IPC server: %o', err);
        this.handleDisconnect();
        reject(err);
      }
    });
  }

  // 处理断开连接
  private handleDisconnect() {
    log('Handling disconnect, connection attempts: %d', this.connectionAttempts);
    // 清除重连定时器
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
      log('Cleared reconnect timeout');
    }

    // 清空数据缓冲区
    this.dataBuffer = '';

    // 拒绝所有待处理的请求
    const pendingCount = this.requestQueue.size;
    log('Rejecting %d pending requests', pendingCount);
    for (const [id, { reject }] of this.requestQueue) {
      log('Rejecting request ID: %s', id);
      reject(new Error('Connection to Electron IPC server lost'));
    }
    this.requestQueue.clear();

    // 尝试重新连接
    if (this.connectionAttempts < this.maxConnectionAttempts) {
      this.connectionAttempts++;
      const delay = Math.min(1000 * Math.pow(2, this.connectionAttempts - 1), 30_000);
      log('Scheduling reconnection attempt %d in %dms', this.connectionAttempts, delay);

      this.reconnectTimeout = setTimeout(() => {
        log('Attempting reconnection #%d', this.connectionAttempts);
        this.connect().catch((err) => {
          console.error('Reconnection attempt %d failed: %o', this.connectionAttempts, err);
        });
      }, delay);
    } else {
      log('Reached maximum connection attempts, giving up');
    }
  }

  // 发送请求到 Electron IPC 服务器
  public async sendRequest<T>(method: ServerDispatchEventKey, params: any = {}): Promise<T> {
    if (!this.socketPath) {
      console.error('Cannot send request: Electron IPC connection not available');
      throw new Error('Electron IPC connection not available');
    }

    // 如果未连接，先连接
    if (!this.connected) {
      log('Not connected, connecting before sending request');
      await this.connect();
    }

    log('Sending request: %s %o', method, params);
    return new Promise<T>((resolve, reject) => {
      try {
        const id = Math.random().toString(36).slice(2, 15);
        const request = { id, method, params };
        log('Created request with ID: %s', id);

        // 将请求添加到队列
        this.requestQueue.set(id, { reject, resolve });
        log('Added request to queue, current queue size: %d', this.requestQueue.size);

        // 设置超时
        const timeout = setTimeout(() => {
          this.requestQueue.delete(id);
          const errorMsg = `Request timed out, method: ${method}`;
          console.error('Request timed out, ID: %s, method: %s', id, method);
          reject(new Error(errorMsg));
        }, 5000);

        // 发送请求
        const requestJson = JSON.stringify(request);
        log('Writing request to socket, size: %d bytes', requestJson.length);
        this.socket!.write(requestJson, (err) => {
          if (err) {
            clearTimeout(timeout);
            this.requestQueue.delete(id);
            console.error('Failed to write request to socket: %o', err);
            reject(err);
          } else {
            log('Request successfully written to socket, ID: %s', id);
          }
        });
      } catch (err) {
        console.error('Error sending request: %o', err);
        reject(err);
      }
    });
  }

  // 关闭连接
  public close() {
    log('Closing client connection');
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
      log('Cleared reconnect timeout');
    }

    if (this.socket) {
      log('Ending socket connection');
      this.socket.end();
      this.socket = null;
    }

    this.connected = false;
    log('Client connection closed');
  }
}
