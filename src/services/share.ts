import { ShareGPTConversation } from '@/types/share';
import { parseMarkdown } from '@/utils/parseMarkdown';

export const SHARE_GPT_URL = 'https://sharegpt.com/api/conversations';

class ShareGPTService {
  public async createShareGPTUrl(conversation: ShareGPTConversation) {
    const items = [];

    for (const item of conversation.items) {
      items.push({
        from: item.from,
        value: item.from === 'gpt' ? await parseMarkdown(item.value) : item.value,
      });
    }

    const res = await fetch(SHARE_GPT_URL, {
      body: JSON.stringify({ ...conversation, items }),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
    });

    const { id } = await res.json();

    if (!id) throw new Error('Failed to create ShareGPT URL');

    // short link to the ShareGPT post
    return `https://shareg.pt/${id}`;
  }
}

export const shareGPTService = new ShareGPTService();
