import { useChatStore } from '@/store/chat';
import { portalThreadSelectors } from '@/store/chat/selectors';

export const useEnable = () => useChatStore(portalThreadSelectors.showThread);

export const onClose = () => {
  useChatStore.setState({ portalThreadId: undefined });
};
