/**
 * 远程服务器配置相关的事件
 */
export interface RemoteServerConfig {
  active: boolean;
  isSelfHosted: boolean;
  remoteServerUrl?: string;
}
