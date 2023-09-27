import { ShareGPTConversation } from '@/types/share';
import { parseMarkdown } from '@/utils/parseMarkdown';

const SHAREGPT_URL = 'https://sharegpt.com/api/conversations';

export const genShareGPTUrl = async (conversation: ShareGPTConversation) => {
  const items = [];

  for (const item of conversation.items) {
    items.push({
      from: item.from,
      value: item.from === 'gpt' ? await parseMarkdown(item.value) : item.value,
    });
  }

  const res = await fetch(SHAREGPT_URL, {
    body: JSON.stringify({ ...conversation, items }),
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
  });

  const { id } = await res.json();

  // short link to the ShareGPT post
  return `https://shareg.pt/${id}`;
};
