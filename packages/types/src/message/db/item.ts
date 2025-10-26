import { GroundingSearch } from '../../search';
import { MessageMetadata, ModelReasoning } from '../common';

export interface DBMessageItem {
  agentId: string | null;
  clientId: string | null;
  content: string | null;
  createdAt: Date;
  error: any | null;
  favorite: boolean | null;
  id: string;
  metadata?: MessageMetadata | null;
  model: string | null;
  observationId: string | null;
  parentId: string | null;
  provider: string | null;
  quotaId: string | null;
  reasoning: ModelReasoning | null;
  role: string;
  search: GroundingSearch | null;
  sessionId: string | null;
  threadId: string | null;
  tools: any | null;
  topicId: string | null;
  // jsonb type
  traceId: string | null;
  updatedAt: Date;
  userId: string;
}
