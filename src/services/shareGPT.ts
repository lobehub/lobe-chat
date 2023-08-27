import { ShareGPTConversation } from '@/types/share';

const SHAREGPT_URL = 'https://sharegpt.com/api/conversations';

export const genShareGPTUrl = async (conversation: ShareGPTConversation) => {
  const res = await fetch(SHAREGPT_URL, {
    body: JSON.stringify(conversation),
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
  });

  const { id } = await res.json();

  // short link to the ShareGPT post
  return `https://shareg.pt/${id}`;
};
