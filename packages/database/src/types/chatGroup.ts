export interface ChatGroupConfig {
  maxResponseInRow?: number;
  orchestratorModel?: string;
  orchestratorProvider?: string;
  responseOrder?: 'sequential' | 'natural';
  responseSpeed?: 'slow' | 'medium' | 'fast';
  revealDM?: boolean;
  systemPrompt?: string;
}