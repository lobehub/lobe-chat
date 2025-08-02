export interface ShareGPTConversation {
  avatarUrl?: string | null;
  items: Array<{
    from: 'human' | 'gpt';
    value: any;
  }>;
}
