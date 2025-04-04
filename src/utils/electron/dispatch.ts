import { DispatchInvoke } from '@lobechat/electron-client-ipc';

/**
 * client 端请求 sketch 端 event 数据的方法
 */
export const dispatch: DispatchInvoke = async (event, ...data) => {
  if (!window.electronAPI) throw new Error('electronAPI not found');

  return window.electronAPI.invoke(event, ...data);
};
