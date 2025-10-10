import useSWR, { SWRHook } from 'swr';

/**
 * 这一类请求方法用于做操作触发，必须使用 mutute 来触发请求操作，好处是自带了 loading / error 状态。
 * 可以很简单地完成 loading / error 态的交互处理，同时，相同 swr key 的请求会自动共享 loading态（例如新建助手按钮和右上角的 + 号）
 * 非常适用于新建等操作。
 */
// @ts-ignore
export const useActionSWR: SWRHook = (key, fetch, config) =>
  useSWR(key, fetch, {
    refreshWhenHidden: false,
    refreshWhenOffline: false,
    revalidateOnFocus: false,
    revalidateOnMount: false,
    revalidateOnReconnect: false,
    ...config,
  });
