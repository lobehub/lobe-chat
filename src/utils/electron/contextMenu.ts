import { isDesktop } from '@/const/version';

/**
 * 显示右键菜单
 * @param type 菜单类型 ('chat', 'editor', 'default')
 * @param data 附加数据
 */
export const showContextMenu = async (type: string, data?: any) => {
  if (!isDesktop) return;

  try {
    const { dispatch } = await import('@lobechat/electron-client-ipc');
    await dispatch('showContextMenu', { data, type });
  } catch (error) {
    console.error('Failed to show context menu:', error);
  }
};
