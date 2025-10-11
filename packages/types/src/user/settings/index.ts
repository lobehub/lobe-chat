import type { LobeAgentSettings } from '../../session';
import { UserGeneralConfig } from './general';
import { UserHotkeyConfig } from './hotkey';
import { UserImageConfig } from './image';
import { UserKeyVaults } from './keyVaults';
import { UserModelProviderConfig } from './modelProvider';
import { UserSystemAgentConfig } from './systemAgent';
import { UserToolConfig } from './tool';
import { UserTTSConfig } from './tts';

export type UserDefaultAgent = LobeAgentSettings;

export * from './filesConfig';
export * from './general';
export * from './hotkey';
export * from './image';
export * from './keyVaults';
export * from './modelProvider';
export * from './sync';
export * from './systemAgent';
export * from './tts';

/**
 * 配置设置
 */
export interface UserSettings {
  defaultAgent: UserDefaultAgent;
  general: UserGeneralConfig;
  hotkey: UserHotkeyConfig;
  image: UserImageConfig;
  keyVaults: UserKeyVaults;
  languageModel: UserModelProviderConfig;
  systemAgent: UserSystemAgentConfig;
  tool: UserToolConfig;
  tts: UserTTSConfig;
}
