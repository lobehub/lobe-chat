import useSWR, { SWRHook } from 'swr';

/**
 * 这一类请求方法是比较「死」的请求模式，只会在第一次请求时触发。不会自动刷新，刷新需要搭配 refreshXXX 这样的方法实现，
 * 适用于 messages、topics、sessions 等由用户在客户端交互产生的数据。
 */
// @ts-ignore
export const useClientDataSWR: SWRHook = (key, fetch, config) =>
  useSWR(key, fetch, {
    // default is 2000ms ,it makes the user's quick switch don't work correctly.
    // Cause issue like this: https://github.com/lobehub/lobe-chat/issues/532
    // we need to set it to 0.
    dedupingInterval: 0,
    refreshWhenOffline: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    ...config,
  });

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

export interface SWRRefreshParams<T, A = (...args: any[]) => any> {
  action: A;
  optimisticData?: (data: T | undefined) => T;
}

export type SWRefreshMethod<T> = <A extends (...args: any[]) => Promise<any>>(
  params?: SWRRefreshParams<T, A>,
) => ReturnType<A>;
