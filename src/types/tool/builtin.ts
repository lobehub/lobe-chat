import { LobeChatPluginApi, Meta } from '@lobehub/chat-plugin-sdk';
import { ReactNode } from 'react';

export interface BuiltinToolManifest {
  api: LobeChatPluginApi[];

  /**
   * Plugin name
   */
  identifier: string;
  /**
   * metadata
   * @desc Meta data of the plugin
   */
  meta: Meta;
  systemRole: string;
  /**
   * plugin runtime type
   * @default default
   */
  type?: 'builtin';
}

export interface LobeBuiltinTool {
  identifier: string;
  manifest: BuiltinToolManifest;
  type: 'builtin';
}

export interface BuiltinRenderProps<Result = any> {
  content: Result;
  identifier?: string;
  messageId: string;
}

export type BuiltinRender = <T = any>(props: BuiltinRenderProps<T>) => ReactNode;
