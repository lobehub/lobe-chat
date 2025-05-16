/**
 * 将异步迭代器转换为 JSON 格式的 ReadableStream
 */
export const createModelPullStream = <
  T extends { completed?: number; digest?: string; status: string; total?: number },
>(
  iterable: AsyncIterable<T>,
  model: string,
  {
    onCancel, // 新增：取消时调用的回调函数
  }: {
    onCancel?: (reason?: any) => void; // 回调函数签名
  } = {},
): ReadableStream => {
  let iterator: AsyncIterator<T>; // 在外部跟踪迭代器以便取消时可以调用 return

  return new ReadableStream({
    // 实现 cancel 方法
    cancel(reason) {
      // 调用传入的 onCancel 回调，执行外部的清理逻辑（如 client.abort()）
      if (onCancel) {
        onCancel(reason);
      }

      // 尝试优雅地终止迭代器
      // 注意：这依赖于 AsyncIterable 的实现是否支持 return/throw
      if (iterator && typeof iterator.return === 'function') {
        // 不需要 await，让它在后台执行清理
        iterator.return().catch();
      }
    },
    async start(controller) {
      iterator = iterable[Symbol.asyncIterator](); // 获取迭代器

      const encoder = new TextEncoder();

      try {
        // eslint-disable-next-line no-constant-condition
        while (true) {
          // 等待下一个数据块或迭代完成
          const { value: progress, done } = await iterator.next();

          // 如果迭代完成，跳出循环
          if (done) {
            break;
          }

          // 忽略 'pulling manifest' 状态，因为它不包含进度
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

        // 如果错误是由于中止操作引起的，则静默处理或记录日志，然后尝试关闭流
        if (error instanceof DOMException && error.name === 'AbortError') {
          // 不需要再 enqueue 错误信息，因为连接可能已断开
          // 尝试正常关闭，如果已经取消，controller 可能已关闭或出错
          try {
            controller.enqueue(new TextEncoder().encode(JSON.stringify({ status: 'cancelled' })));
            controller.close();
          } catch {
            // 忽略关闭错误，可能流已经被取消机制处理了
          }
        } else {
          console.error('[createModelPullStream] model download stream error:', error);
          // 对于其他错误，尝试将错误信息发送给客户端
          const errorMessage = error instanceof Error ? error.message : String(error);
          const errorData =
            JSON.stringify({
              error: errorMessage,
              model,
              status: 'error',
            }) + '\n';

          try {
            // 只有在流还期望数据时才尝试 enqueue
            if (controller.desiredSize !== null && controller.desiredSize > 0) {
              controller.enqueue(encoder.encode(errorData));
            }
          } catch (enqueueError) {
            console.error('[createModelPullStream] Error enqueueing error message:', enqueueError);
            // 如果这里也失败，很可能连接已断开
          }

          // 尝试关闭流或标记为错误状态
          try {
            controller.close(); // 尝试正常关闭
          } catch {
            controller.error(error); // 如果关闭失败，则将流置于错误状态
          }
        }
      }
    },
  });
};
