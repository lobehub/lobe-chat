import { useChatStore } from '@/store/chat';
import { chatPortalSelectors } from '@/store/chat/selectors';

export const useEnable = () => useChatStore(chatPortalSelectors.showMessageDetail);
