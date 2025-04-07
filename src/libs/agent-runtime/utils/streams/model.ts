/**
 * 将异步迭代器转换为 JSON 格式的 ReadableStream
 */
export const createModelPullStream = <
  T extends { completed?: number; digest?: string; status: string; total?: number },
>(
  iterable: AsyncIterable<T>,
  model: string,
  {
    onInit,
    signal,
    onAbort,
  }: {
    onAbort?: () => void;
    onInit?: (controller: ReadableStreamDefaultController) => void;
    signal?: AbortSignal;
  } = {},
): ReadableStream => {
  return new ReadableStream({
    async start(controller) {
      const abort = () => {
        onAbort?.();
        signal?.removeEventListener('abort', abort);

        controller.enqueue(new TextEncoder().encode(JSON.stringify({ status: 'cancelled' })));
        controller.close();
      };

      onInit?.(controller);
      signal?.addEventListener('abort', abort);

      try {
        const encoder = new TextEncoder();

        // 处理迭代器中的每个进度更新
        for await (const progress of iterable) {
          if (progress.status === 'pulling manifest') continue;

          // 格式化为标准格式并写入流
          const progressData =
            JSON.stringify({
              completed: progress.completed,
              digest: progress.digest,
              model,
              status: progress.status,
              total: progress.total,
            }) + '\n';

          controller.enqueue(encoder.encode(progressData));
        }

        // 正常完成
        controller.close();
      } catch (error) {
        // 处理错误
        console.error('[createModelPullStream] model download stream error:', error);

        // 发送错误信息
        const errorMessage = error instanceof Error ? error.message : String(error);
        const errorData =
          JSON.stringify({
            error: errorMessage,
            model,
            status: 'error',
          }) + '\n';

        try {
          controller.enqueue(new TextEncoder().encode(errorData));
          controller.close();
        } catch {
          controller.error(error);
        }
      }
    },
  });
};
