export interface TaskResult<T> {
  data?: T;
  error?: any;
  status: 'pending' | 'success' | 'failed';
}

export interface PollingErrorContext {
  consecutiveFailures: number;
  error: any;
  retries: number;
}

export interface PollingErrorResult {
  error?: any;
  isContinuePolling: boolean; // If provided, will replace the original error when thrown
}

export interface AsyncifyPollingOptions<T, R> {
  // Default 5000ms
  backoffMultiplier?: number;

  // Status check function to determine task result
  checkStatus: (result: T) => TaskResult<R>;

  // Retry configuration
  initialInterval?: number; 
  // Optional logger
  logger?: {
    debug?: (...args: any[]) => void;
    error?: (...args: any[]) => void;
  }; 
  // Default 1.5
  maxConsecutiveFailures?: number; 
  // Default 500ms
  maxInterval?: number; // Default 3
  maxRetries?: number; // Default Infinity

  // Optional custom error handler for polling query failures
  onPollingError?: (context: PollingErrorContext) => PollingErrorResult;

  // The polling function to execute repeatedly
  pollingQuery: () => Promise<T>;
}

/**
 * Convert polling pattern to async/await pattern
 *
 * @param options Polling configuration options
 * @returns Promise<R> The data returned when task completes
 * @throws Error When task fails or times out
 */
export async function asyncifyPolling<T, R>(options: AsyncifyPollingOptions<T, R>): Promise<R> {
  const {
    pollingQuery,
    checkStatus,
    initialInterval = 500,
    maxInterval = 5000,
    backoffMultiplier = 1.5,
    maxConsecutiveFailures = 3,
    maxRetries = Infinity,
    onPollingError,
    logger,
  } = options;

  let retries = 0;
  let consecutiveFailures = 0;

  while (retries < maxRetries) {
    let pollingResult: T;

    try {
      // Execute polling function
      pollingResult = await pollingQuery();

      // Reset consecutive failures counter on successful execution
      consecutiveFailures = 0;
    } catch (error) {
      // Polling function execution failed (network error, etc.)
      consecutiveFailures++;

      logger?.error?.(
        `Failed to execute polling function (attempt ${retries + 1}/${maxRetries === Infinity ? '∞' : maxRetries}, consecutive failures: ${consecutiveFailures}/${maxConsecutiveFailures}):`,
        error,
      );

      // Handle custom error processing if provided
      if (onPollingError) {
        const errorResult = onPollingError({
          consecutiveFailures,
          error,
          retries,
        });

        if (!errorResult.isContinuePolling) {
          // Custom error handler decided to stop polling
          throw errorResult.error || error;
        }

        // Custom error handler decided to continue polling
        logger?.debug?.('Custom error handler decided to continue polling');
      } else {
        // Default behavior: check if maximum consecutive failures reached
        if (consecutiveFailures >= maxConsecutiveFailures) {
          throw new Error(
            `Failed to execute polling function after ${consecutiveFailures} consecutive attempts: ${error}`,
          );
        }
      }

      // Wait before retry and continue to next loop iteration
      if (retries < maxRetries - 1) {
        const currentInterval = Math.min(
          initialInterval * Math.pow(backoffMultiplier, retries),
          maxInterval,
        );

        logger?.debug?.(`Waiting ${currentInterval}ms before next retry`);

        await new Promise((resolve) => {
          setTimeout(resolve, currentInterval);
        });
      }

      retries++;
      continue;
    }

    // Check task status
    const statusResult = checkStatus(pollingResult);

    logger?.debug?.(`Task status: ${statusResult.status} (attempt ${retries + 1})`);

    switch (statusResult.status) {
      case 'success': {
        return statusResult.data as R;
      }

      case 'failed': {
        // Task logic failed, throw error immediately (not counted as consecutive failure)
        throw statusResult.error || new Error('Task failed');
      }

      case 'pending': {
        // Continue polling
        break;
      }

      default: {
        // Unknown status, treat as pending
        break;
      }
    }

    // Wait before next retry if not the last attempt
    if (retries < maxRetries - 1) {
      // Calculate dynamic retry interval with exponential backoff
      const currentInterval = Math.min(
        initialInterval * Math.pow(backoffMultiplier, retries),
        maxInterval,
      );

      logger?.debug?.(`Waiting ${currentInterval}ms before next retry`);

      // Wait for retry interval
      await new Promise((resolve) => {
        setTimeout(resolve, currentInterval);
      });
    }

    retries++;
  }

  // Maximum retries reached
  throw new Error(`Task timeout after ${maxRetries} attempts`);
}
