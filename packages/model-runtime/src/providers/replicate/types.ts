export interface ReplicateModelConfig {
  displayName: string;
  enabled: boolean;
  id: string;
  type: 'text' | 'image' | 'audio' | 'video';
}

export interface ReplicateStreamEvent {
  data: any;
  event: 'output' | 'logs' | 'error' | 'done';
}
