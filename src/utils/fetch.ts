// import { notification } from '@/layout';
import { fetchChatModel } from '@/services/chatModel';
import { ChatMessageError } from '@/types/chatMessage';

const codeMessage: Record<number, string> = {
  200: '成功获取数据，服务已响应',
  201: '操作成功，数据已保存',
  202: '您的请求已进入后台排队，请耐心等待异步任务完成',
  204: '数据已成功删除',
  400: '很抱歉，您的请求出错，服务器未执行任何数据的创建或修改操作',
  401: '很抱歉，您的权限不足。请确认用户名或密码是否正确',
  403: '很抱歉，您无权访问此内容',
  404: '很抱歉，您请求的记录不存在，服务器未能执行任何操作',
  406: '很抱歉，服务器不支持该请求格式',
  410: '很抱歉，你所请求的资源已永久删除',
  422: '很抱歉，在创建对象时遇到验证错误，请稍后再试',
  500: '很抱歉，服务器出现了问题，请稍后再试',
  502: '很抱歉，您遇到了网关错误。这可能是由于网络故障或服务器问题导致的。请稍后再试，或联系管理员以获取更多帮助',
  503: '很抱歉，我们的服务器过载或处在维护中，服务暂时不可用',
  504: '很抱歉，网关请求超时，请稍后再试',
};

export interface FetchSSEOptions {
  onErrorHandle?: (error: ChatMessageError) => void;
  onMessageHandle?: (text: string) => void;
}

/**
 * 使用流式方法获取数据
 * @param fetchFn
 * @param options
 */
export const fetchSSE = async (fetchFn: () => Promise<Response>, options: FetchSSEOptions = {}) => {
  const response = await fetchFn();

  // 如果不 ok 说明有连接请求错误
  if (!response.ok) {
    const chatMessageError: ChatMessageError = {
      message: codeMessage[response.status],
      status: response.status,
      type: 'general',
    };

    options.onErrorHandle?.(chatMessageError);
    return;
  }

  const returnRes = response.clone();

  const data = response.body;

  if (!data) return;

  const reader = data.getReader();
  const decoder = new TextDecoder();

  let done = false;

  while (!done) {
    const { value, done: doneReading } = await reader.read();
    done = doneReading;
    const chunkValue = decoder.decode(value);

    options.onMessageHandle?.(chunkValue);
  }

  return returnRes;
};

interface FetchAITaskResultParams<T> {
  abortController?: AbortController;
  /**
   * 错误处理函数
   */
  onError?: (e: Error) => void;
  /**
   * 加载状态变化处理函数
   * @param loading - 是否处于加载状态
   */
  onLoadingChange?: (loading: boolean) => void;
  /**
   * 消息处理函数
   * @param text - 消息内容
   */
  onMessageHandle?: (text: string) => void;

  /**
   * 请求对象
   */
  params: T;
}

export const fetchAIFactory =
  <T>(fetcher: (params: T, options: { signal?: AbortSignal }) => Promise<Response>) =>
  async ({
    params,
    onMessageHandle,
    onError,
    onLoadingChange,
    abortController,
  }: FetchAITaskResultParams<T>) => {
    const errorHandle = (error: Error) => {
      onLoadingChange?.(false);
      if (abortController?.signal.aborted) {
        // notification.primaryInfo({
        //   message: '已中断当前节点的执行任务',
        // });
        return;
      }

      // notification?.error({
      //   message: `请求失败(${error.message})`,
      //   placement: 'bottomRight',
      // });
      onError?.(error);
    };

    onLoadingChange?.(true);

    const data = await fetchSSE(() => fetcher(params, { signal: abortController?.signal }), {
      onErrorHandle: (error) => {
        errorHandle(new Error(error.message));
      },
      onMessageHandle,
    }).catch(errorHandle);

    onLoadingChange?.(false);

    return await data?.text();
  };

export const fetchPresetTaskResult = fetchAIFactory(fetchChatModel);
