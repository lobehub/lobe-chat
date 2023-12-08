import { LobeChatPluginManifest } from '@lobehub/chat-plugin-sdk';

import { CustomPluginParams } from './plugin';

export type LobeToolType = 'builtin' | 'customPlugin' | 'plugin';

export interface LobeTool {
  customParams?: CustomPluginParams;
  identifier: string;
  manifest?: LobeChatPluginManifest;
  settings?: any;
  type: LobeToolType;
}
