/**
 * 通用重试函数，支持指数回退 + 最大延时限制
 * @param fn - 要执行的异步函数 (返回 Promise)
 * @param retries - 最大重试次数
 * @param delay - 初始延时（单位：毫秒）
 * @param backoffFactor - 指数退避的倍数
 * @param maxDelay - 最大延时（单位：毫秒），默认为无限制
 * @param isRetryable - 可选函数，判断是否应当重试特定错误
 * @returns - Promise<T>
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  retries: number = 3,
  delay: number = 1000,
  backoffFactor: number = 2,
  maxDelay: number = Infinity, // 默认无限制
  isRetryable: (error: any) => boolean = () => true, // 默认所有错误都重试
): Promise<T> {
  let attempt = 0;
  let currentDelay = delay;

  // 封装一个 `sleep` 函数，避免 `no-promise-executor-return`
  const sleep = (ms: number): Promise<void> =>
    new Promise((resolve) => {
      setTimeout(() => resolve(), ms);
    });

  // 用 while 循环进行重试
  while (attempt < retries) {
    try {
      return await fn(); // 尝试调用主函数
    } catch (error) {
      attempt++;

      // 如果达到最大重试次数，或者错误不可重试，则抛出错误
      if (attempt >= retries || !isRetryable(error)) {
        console.error(`Operation failed after ${attempt} attempts. Error: ${error}`);
        throw error;
      }

      // 打印日志并等待一段时间
      console.warn(`Attempt ${attempt} failed. Retrying in ${currentDelay}ms... ${error}`);
      await sleep(currentDelay); // 等待当前的延时时间
      currentDelay = Math.min(currentDelay * backoffFactor, maxDelay); // 计算下一次的延时时间（最大不超过 maxDelay）
    }
  }

  throw new Error('Unexpected state: Should have either returned or thrown.');
}
