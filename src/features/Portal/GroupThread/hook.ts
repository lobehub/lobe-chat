import { useChatStore } from '@/store/chat';
import { useChatGroupStore } from '@/store/chatGroup';

export const useEnable = () => useChatGroupStore((s) => !!s.activeThreadAgentId);

export const onClose = () => {
  useChatGroupStore.setState({ activeThreadAgentId: '' });
  useChatStore.getState().togglePortal(false);
};
