import { LobeToolRenderType } from '@/types/tool';

import { V4ChatPluginPayload } from './v4';

interface ChatToolPayload {
  apiName: string;
  arguments: string;
  id: string;
  identifier: string;
  type: LobeToolRenderType;
}

export interface V5Message {
  content: string;
  createdAt: number;
  id: string;
  parentId?: string;
  plugin?: V4ChatPluginPayload;
  role: 'user' | 'system' | 'assistant' | 'tool';
  tool_call_id?: string;
  tools?: ChatToolPayload[];
  updatedAt: number;
}

export interface V5ConfigState {
  messages: V5Message[];
}
