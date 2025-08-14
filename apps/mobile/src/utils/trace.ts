import { LOBE_CHAT_TRACE_HEADER, LOBE_CHAT_TRACE_ID, TracePayload } from '@/const/trace';

export const getTracePayload = (req: Request): TracePayload | undefined => {
  const header = req.headers.get(LOBE_CHAT_TRACE_HEADER);
  if (!header) return;

  // Use atob for base64 decoding in React Native environment
  return JSON.parse(atob(header));
};

export const getTraceId = (res: Response) => res.headers.get(LOBE_CHAT_TRACE_ID);

const createTracePayload = (data: TracePayload) => {
  // Use btoa for base64 encoding in React Native environment
  return btoa(JSON.stringify(data));
};

export const createTraceHeader = (data: TracePayload) => {
  return { [LOBE_CHAT_TRACE_HEADER]: createTracePayload(data) };
};
