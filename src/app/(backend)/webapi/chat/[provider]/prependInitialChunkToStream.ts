import debug from 'debug';

const log = debug('model-runtime:prependInitialChunkToStream');

export const prependInitialChunkToStream = (inputStream: ReadableStream): ReadableStream => {
  const reader = inputStream.getReader();

  return new ReadableStream({
    async cancel(reason) {
      log('Heartbeat stream cancelled:', reason);
      await reader.cancel(reason);
    },
    async start(controller) {
      // 1. Enqueue the initial placeholder chunk immediately
      controller.enqueue('id: start\n');
      controller.enqueue('event: init\n');

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
