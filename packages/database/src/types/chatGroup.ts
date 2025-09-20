export interface ChatGroupConfig {
  allowDM?: boolean;
  enableSupervisor?: boolean;
  maxResponseInRow?: number;
  orchestratorModel?: string;
  orchestratorProvider?: string;
  responseOrder?: 'sequential' | 'natural';
  responseSpeed?: 'slow' | 'medium' | 'fast';
  revealDM?: boolean;
  scene: 'casual' | 'productive';
  systemPrompt?: string;
}
