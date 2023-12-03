export interface V1MetaData {
  avatar?: string;
  backgroundColor?: string;
  description?: string;
  tags?: string[];
  title?: string;
}

export interface V1Chat {
  content: string;
  createAt: number;
  extra?: {
    fromModel: string;
  };
  function_call?: {
    arguments: string;
    name: string;
  };
  id: string;
  meta: V1MetaData;
  // function call name
  name?: string;
  parentId?: string;
  plugin?: {
    apiName: string;
    arguments: string;
    identifier: string;
    type: 'default';
  };
  role: string;
  topicId: string;
  updateAt: number;
}

export interface V1Session {
  chats: Record<string, V1Chat>;
  config: V1Config;
  createAt: number;
  id: string;
  meta: V1MetaData;
  pinned?: boolean;
  topics?: Record<string, V1Topic>;
  type: 'agent';
  updateAt: number;
}

export interface V1Config {
  displayMode: string;
  enableCompressThreshold: boolean;
  enableMaxTokens: boolean;
  historyCount: number;
  inputTemplate: string;
  model: string;
  params: Partial<Params>;
  plugins: string[];
  systemRole: string;
}

export interface Params {
  frequency_penalty: number;
  max_tokens: number;
  presence_penalty: number;
  temperature: number;
  top_p: number;
}

export interface V1Topic {
  createAt: number;
  favorite?: boolean;
  id: string;
  title: string;
  updateAt: number;
}

export interface V1ConfigState {
  inbox?: V1Session;
  sessions?: Record<string, V1Session>;
}
