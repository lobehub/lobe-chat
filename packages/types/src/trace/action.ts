import { TraceEventType } from '@/const/trace';

export interface TraceEventBasePayload {
  content: string;
  eventType: TraceEventType;
  observationId?: string;
  traceId: string;
}

export interface TraceEventModifyMessage {
  eventType: TraceEventType.ModifyMessage;
  nextContent: string;
}

export interface TraceEventDeleteAndRegenerateMessage {
  eventType: TraceEventType.DeleteAndRegenerateMessage;
}

export interface TraceEventCopyMessage {
  eventType: TraceEventType.CopyMessage;
}

export interface TraceEventRegenerateMessage {
  eventType: TraceEventType.RegenerateMessage;
}

export type TraceEventPayloads =
  | TraceEventCopyMessage
  | TraceEventModifyMessage
  | TraceEventDeleteAndRegenerateMessage
  | TraceEventRegenerateMessage;
