import { ChatMessage } from '@/types/message';

export interface FieldType {
  includeTool: boolean;
  includeUser: boolean;
  withRole: boolean;
  withSystemRole: boolean;
}

export interface ShareContentProps {
  messages: ChatMessage[];
  systemRole?: string;
}
