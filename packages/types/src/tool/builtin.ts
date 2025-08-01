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
  hidden?: boolean;
  identifier: string;
  manifest: BuiltinToolManifest;
  type: 'builtin';
}

export interface BuiltinRenderProps<Content = any, Arguments = any, State = any> {
  apiName?: string;
  args: Arguments;
  content: Content;
  identifier?: string;
  messageId: string;
  pluginError?: any;
  pluginState?: State;
}

export type BuiltinRender = <T = any>(props: BuiltinRenderProps<T>) => ReactNode;

export interface BuiltinPortalProps<Arguments = Record<string, any>, State = any> {
  apiName?: string;
  arguments: Arguments;
  identifier: string;
  messageId: string;
  state: State;
}

export type BuiltinPortal = <T = any>(props: BuiltinPortalProps<T>) => ReactNode;
