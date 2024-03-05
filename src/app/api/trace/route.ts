import { TraceEventType } from '@/const/trace';
import { TraceClient } from '@/libs/traces';
import { TraceEventBasePayload, TraceEventPayloads } from '@/types/trace';

export const runtime = 'edge';

export const POST = async (req: Request) => {
  type RequestData = TraceEventPayloads & TraceEventBasePayload;
  const data = (await req.json()) as RequestData;
  const { traceId, eventType } = data;

  const traceClient = new TraceClient();

  const eventClient = traceClient.createEvent(traceId);

  switch (eventType) {
    case TraceEventType.ModifyMessage: {
      eventClient?.modifyMessage(data);
      break;
    }

    case TraceEventType.DeleteAndRegenerateMessage: {
      eventClient?.deleteAndRegenerateMessage(data);
      break;
    }

    case TraceEventType.RegenerateMessage: {
      eventClient?.regenerateMessage(data);
      break;
    }

    case TraceEventType.CopyMessage: {
      eventClient?.copyMessage(data);
      break;
    }
  }

  await traceClient.shutdownAsync();
  return new Response(undefined, { status: 201 });
};
