import createDebug from 'debug';

import { CreateImagePayload, CreateImageResponse } from '../types/image';
import { AgentRuntimeError } from '../utils/createError';
import { CreateImageOptions } from '../utils/openaiCompatibleFactory';

const log = createDebug('lobe-image:qwen');

interface QwenImageTaskResponse {
  output: {
    error_message?: string;
    results?: Array<{
      url: string;
    }>;
    task_id: string;
    task_status: 'PENDING' | 'RUNNING' | 'SUCCEEDED' | 'FAILED';
  };
  request_id: string;
}

const QwenText2ImageModels = [
  'wan2.2-t2i',
  'wanx2.1-t2i',
  'wanx2.0-t2i',
  'wanx-v1',
  'flux',
  'stable-diffusion'
];

const getModelType = (model: string): string => {
  // 可以添加其他模型类型的判断
  // if (QwenImage2ImageModels.some(prefix => model.startsWith(prefix))) {
  //   return 'image2image';
  // }

  if (QwenText2ImageModels.some(prefix => model.startsWith(prefix))) {
    return 'text2image';
  }

  throw new Error(`Unsupported model: ${model}`);
}

/**
 * Create an image generation task with Qwen API
 */
async function createImageTask(payload: CreateImagePayload, apiKey: string): Promise<string> {
  const { model, params } = payload;
  // I can only say that the design of Alibaba Cloud's API is really bad; each model has a different endpoint path.
  const modelType = getModelType(model);
  const endpoint = `https://dashscope.aliyuncs.com/api/v1/services/aigc/${modelType}/image-synthesis`
  if (!endpoint) {
    throw new Error(`No endpoint configured for model type: ${modelType}`);
  }
  log('Creating image task with model: %s, endpoint: %s', model, endpoint);

  const response = await fetch(endpoint, {
    body: JSON.stringify({
      input: {
        prompt: params.prompt,
        // negativePrompt is not part of standard parameters
        // but can be supported by extending the params type if needed
      },
      model,
      parameters: {
        n: 1,
        ...(typeof params.seed === 'number' ? { seed: params.seed } : {}),
        ...(params.width && params.height
          ? { size: `${params.width}*${params.height}` }
          : params.size 
            ? { size: params.size.replaceAll('x', '*') }
            : { size: '1024*1024' }),
      },
    }),
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'X-DashScope-Async': 'enable',
    },
    method: 'POST',
  });

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch {
      // Failed to parse JSON error response
    }
    throw new Error(
      `Failed to create image task (${response.status}): ${errorData?.message || response.statusText}`,
    );
  }

  const data: QwenImageTaskResponse = await response.json();
  log('Task created with ID: %s', data.output.task_id);

  return data.output.task_id;
}

/**
 * Query the status of an image generation task
 */
async function queryTaskStatus(taskId: string, apiKey: string): Promise<QwenImageTaskResponse> {
  const endpoint = `https://dashscope.aliyuncs.com/api/v1/tasks/${taskId}`;

  log('Querying task status for: %s', taskId);

  const response = await fetch(endpoint, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch {
      // Failed to parse JSON error response
    }
    throw new Error(
      `Failed to query task status (${response.status}): ${errorData?.message || response.statusText}`,
    );
  }

  return response.json();
}

/**
 * Create image using Qwen Wanxiang API
 * This implementation uses async task creation and polling
 */
export async function createQwenImage(
  payload: CreateImagePayload,
  options: CreateImageOptions,
): Promise<CreateImageResponse> {
  const { apiKey, provider } = options;
  try {
    // 1. Create image generation task
    const taskId = await createImageTask(payload, apiKey);

    // 2. Poll task status until completion
    let taskStatus: QwenImageTaskResponse | null = null;
    let retries = 0;
    let consecutiveFailures = 0;
    const maxConsecutiveFailures = 3; // Allow up to 3 consecutive query failures
    // Using Infinity for maxRetries is safe because:
    // 1. Vercel runtime has execution time limits
    // 2. Qwen's API will eventually return FAILED status for timed-out tasks
    // 3. Our exponential backoff ensures reasonable retry intervals
    const maxRetries = Infinity;
    const initialRetryInterval = 500; // 500ms initial interval
    const maxRetryInterval = 5000; // 5 seconds max interval
    const backoffMultiplier = 1.5; // exponential backoff multiplier

    while (retries < maxRetries) {
      try {
        taskStatus = await queryTaskStatus(taskId, apiKey);
        consecutiveFailures = 0; // Reset consecutive failures on success
      } catch (error) {
        consecutiveFailures++;
        log(
          'Failed to query task status (attempt %d/%d, consecutive failures: %d/%d): %O',
          retries + 1,
          maxRetries,
          consecutiveFailures,
          maxConsecutiveFailures,
          error,
        );

        // If we've failed too many times in a row, give up
        if (consecutiveFailures >= maxConsecutiveFailures) {
          throw new Error(
            `Failed to query task status after ${consecutiveFailures} consecutive attempts: ${error}`,
          );
        }

        // Wait before retrying
        const currentRetryInterval = Math.min(
          initialRetryInterval * Math.pow(backoffMultiplier, retries),
          maxRetryInterval,
        );
        await new Promise((resolve) => {
          setTimeout(resolve, currentRetryInterval);
        });
        retries++;
        continue; // Skip the rest of the loop and retry
      }

      // At this point, taskStatus should not be null since we just got it successfully
      log(
        'Task %s status: %s (attempt %d/%d)',
        taskId,
        taskStatus!.output.task_status,
        retries + 1,
        maxRetries,
      );

      if (taskStatus!.output.task_status === 'SUCCEEDED') {
        if (!taskStatus!.output.results || taskStatus!.output.results.length === 0) {
          throw new Error('Task succeeded but no images generated');
        }

        // Return the first generated image
        const imageUrl = taskStatus!.output.results[0].url;
        log('Image generated successfully: %s', imageUrl);

        return { imageUrl };
      } else if (taskStatus!.output.task_status === 'FAILED') {
        throw new Error(taskStatus!.output.error_message || 'Image generation task failed');
      }

      // Calculate dynamic retry interval with exponential backoff
      const currentRetryInterval = Math.min(
        initialRetryInterval * Math.pow(backoffMultiplier, retries),
        maxRetryInterval,
      );

      log('Waiting %dms before next retry', currentRetryInterval);

      // Wait before retrying
      await new Promise((resolve) => {
        setTimeout(resolve, currentRetryInterval);
      });
      retries++;
    }

    throw new Error(`Image generation timeout after ${maxRetries} attempts`);
  } catch (error) {
    log('Error in createQwenImage: %O', error);

    throw AgentRuntimeError.createImage({
      error: error as any,
      errorType: 'ProviderBizError',
      provider,
    });
  }
}
