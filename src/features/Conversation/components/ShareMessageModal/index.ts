import { type UIChatMessage } from '@lobechat/types';
import { type ModalInstance } from '@lobehub/ui';

import type { createStore } from '../../store';

// The modal renders a message as an image, text and PDF, so the screenshot
// library and pdf.js come with it. Every surface that lists messages reaches
// this entry through its action bar; load the modal on click, not with the list.
const importShareMessageModal = () => import('./Modal');

let shareMessageModalPromise: ReturnType<typeof importShareMessageModal> | undefined;

export const preloadShareMessageModal = (): ReturnType<typeof importShareMessageModal> =>
  (shareMessageModalPromise ??= importShareMessageModal().catch((error) => {
    shareMessageModalPromise = undefined;
    throw error;
  }));

export const openShareMessageModal = async (
  message: UIChatMessage,
  createConversationStore: () => ReturnType<typeof createStore>,
): Promise<ModalInstance> => {
  const { openShareMessageModal: createShareMessageModal } = await preloadShareMessageModal();

  return createShareMessageModal(message, createConversationStore);
};
