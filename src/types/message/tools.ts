export interface ChatPluginPayload {
  apiName: string;
  arguments: string;
  identifier: string;
  type: 'standalone' | 'default' | 'builtin';
}
