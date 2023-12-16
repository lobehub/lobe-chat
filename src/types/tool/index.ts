import { LobeChatPluginManifest } from '@lobehub/chat-plugin-sdk';

import { CustomPluginParams } from './plugin';
import { LobeToolType } from './tool';

export interface LobeTool {
  customParams?: CustomPluginParams;
  identifier: string;
  manifest?: LobeChatPluginManifest;
  settings?: any;
  type: LobeToolType;
}
