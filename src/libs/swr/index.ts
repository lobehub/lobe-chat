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
