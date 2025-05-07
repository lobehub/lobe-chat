export const LOBE_CHAT_TRACE_HEADER = 'X-lobe-trace';
export const LOBE_CHAT_TRACE_ID = 'X-lobe-chat-trace-id';
export const LOBE_CHAT_OBSERVATION_ID = 'X-lobe-observation-id';

export enum TraceNameMap {
  ConnectivityChecker = 'Connectivity Checker',
  Conversation = 'Conversation',
  EmojiPicker = 'Emoji Picker',
  FetchPluginAPI = 'Fetch Plugin API',
  LanguageDetect = 'Language Detect',
  SearchIntentRecognition = 'Search Intent Recognition',
  SummaryAgentDescription = 'Summary Agent Description',
  SummaryAgentTags = 'Summary Agent Tags',
  SummaryAgentTitle = 'Summary Agent Title',
  SummaryHistoryMessages = 'Summary History Messages',
  SummaryTopicTitle = 'Summary Topic Title',
  Translator = 'Translator',
}

export enum TraceEventType {
  CopyMessage = 'Copy Message',
  DeleteAndRegenerateMessage = 'Delete And Regenerate Message',
  ModifyMessage = 'Modify Message',
  RegenerateMessage = 'Regenerate Message',
}

export enum TraceTopicType {
  AgentSettings = 'Agent Settings',
}

export enum TraceTagMap {
  Chat = 'Chat Competition',
  SystemChain = 'System Chain',
  ToolCalling = 'Tool Calling',
  ToolsCalling = 'Tools Calling',
}

export interface TracePayload {
  /**
   * if user allow to trace
   */
  enabled?: boolean;
  observationId?: string;
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
