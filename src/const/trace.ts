export const LOBE_CHAT_TRACE_HEADER = 'X-lobe-trace';
export const LOBE_CHAT_TRACE_ID = 'X-chat-completion-trace-id';

export enum TraceNameMap {
  ConnectivityChecker = 'Connectivity Checker',
  Conversation = 'Conversation',
  EmojiPicker = 'Emoji Picker',
  InvokePlugin = 'Invoke Plugin',
  LanguageDetect = 'Language Detect',
  SummaryAgentDescription = 'Summary Agent Description',
  SummaryAgentTags = 'Summary Agent Tags',
  SummaryAgentTitle = 'Summary Agent Title',
  SummaryTopicTitle = 'Summary Topic Title',
  Translator = 'Translator',
}

export enum TraceTopicType {
  AgentSettings = 'Agent Settings',
}

export enum TraceTagType {
  Chat = 'Chat Competition',
  SystemChain = 'System Chain',
  ToolCalling = 'Tool Calling',
  ToolsCall = 'Tools Call',
}

export interface TracePayload {
  /**
   * chat session: agentId or groupId
   */
  sessionId?: string;
  tags?: string[];
  /**
   * chat topicId
   */
  topicId?: string;
  traceId?: string;
  traceName?: TraceNameMap;
  /**
   * user uuid
   */
  userId?: string;
}
