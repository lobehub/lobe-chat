import debug from 'debug';

const log = debug('model-runtime:prependInitialChunkToStream');

export const prependInitialChunkToStream = (
  inputStream: ReadableStream<Uint8Array>,
  initialChunk: Uint8Array,
): ReadableStream<Uint8Array> => {
  const reader = inputStream.getReader();

  return new ReadableStream<Uint8Array>({
    async cancel(reason) {
      log('Heartbeat stream cancelled:', reason);
      await reader.cancel(reason);
    },
    async start(controller) {
      // 1. Enqueue the initial placeholder chunk immediately
      controller.enqueue(initialChunk);

      // 2. Then, start pulling from the original AI stream
      try {
        // eslint-disable-next-line no-constant-condition
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            controller.close();
            break;
          }
          controller.enqueue(value);
        }
      } catch (error) {
        console.error('Error reading from original AI stream:', error);
        controller.error(error);
      }
    },
  });
};
