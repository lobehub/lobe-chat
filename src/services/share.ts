import { DeepPartial } from 'utility-types';

import { LOBE_URL_IMPORT_NAME } from '@/const/url';
import { ShareGPTConversation } from '@/types/share';
import { UserSettings } from '@/types/user/settings';
import { withBasePath } from '@/utils/basePath';
import { parseMarkdown } from '@/utils/parseMarkdown';

export const SHARE_GPT_URL = 'https://sharegpt.com/api/conversations';

class ShareService {
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

  /**
   * Creates a share settings URL with the provided settings.
   * @param settings - The settings object to be encoded in the URL.
   * @returns The share settings URL.
   */
  public createShareSettingsUrl(settings: DeepPartial<UserSettings>) {
    return withBasePath(`/?${LOBE_URL_IMPORT_NAME}=${encodeURI(JSON.stringify(settings))}`);
  }

  /**
   * Decode share settings from search params
   * @param settings
   * @returns
   */
  public decodeShareSettings(settings: string) {
    try {
      return { data: JSON.parse(settings) as DeepPartial<UserSettings> };
    } catch (e) {
      return { message: JSON.stringify(e) };
    }
  }
}

export const shareService = new ShareService();
