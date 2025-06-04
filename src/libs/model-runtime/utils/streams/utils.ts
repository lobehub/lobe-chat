export const createReadableStream = <T>(chunks: T[]) =>
  new ReadableStream({
    start(controller) {
      chunks.forEach((chunk) => controller.enqueue(chunk));

      controller.close();
    },
  });
