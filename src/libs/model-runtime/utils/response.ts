export const StreamingResponse = (
  stream: ReadableStream,
  options?: { headers?: Record<string, string> },
) => {
  return new Response(stream, {
    headers: {
      'Cache-Control': 'no-cache',
      'Content-Type': 'text/event-stream',
      ...options?.headers,
    },
  });
};
