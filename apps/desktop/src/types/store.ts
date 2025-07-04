// apps/desktop/src/types/store.ts
import { ConfigData } from '@lobechat/common';
import { ShortCutConfig } from '@/shortcuts';
import { KnowledgeBaseSettings } from './settings'; // Import the new settings type

/**
 * 应用程序的配置状态
 * @export
 * @interface ElectronMainStore
 */
export interface ElectronMainStore extends ConfigData {
  /**
   * 是否同意分析
   * @deprecated
   */
  allowAnalytics?: boolean;
  /**
   * 客户端数据库迁移备份
   */
  backup?: any;
  /**
   * 数据同步配置
   */
  dataSyncConfig: {
    remoteServerUrl?: string;
    storageMode: 'local' | 'selfHost';
    syncConfigOnMac?: boolean;
    syncConfigOnStart?: boolean;
    syncProfileOnMac?: boolean;
    syncProfileOnStart?: boolean;
  };
  /**
   * 加密的 token
   */
  encryptedTokens: Record<string, string>;
  /**
   * 用户选择的语言
   */
  locale: string;
  /**
   * 用户设置的快捷键
   */
  shortcuts: ShortCutConfig;
  /**
   * 用户设置的存储路径
   */
  storagePath: string;
  /**
   * 用户界面主题
   * @deprecated
   */
  themeMode?: string; // deprecated

  /**
   * Knowledge Base specific settings.
   */
  knowledgeBaseSettings?: KnowledgeBaseSettings;
}
