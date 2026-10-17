import type { OpenAIChatMessage } from '@lobechat/types';

/** Replace local image proxy links before remote providers fetch through a WAF. */
export const resolveChatImageUrls = async (
  messages: OpenAIChatMessage[],
  origin: string,
  resolveReadableUrl: (id: string) => Promise<string>,
): Promise<OpenAIChatMessage[]> => {
  // Cache only within this request: future turns must receive fresh signed URLs.
  const pending = new Map<string, Promise<string>>();

  return Promise.all(
    messages.map(async (message) => {
      if (!Array.isArray(message.content)) return message;

      const content = await Promise.all(
        message.content.map(async (part) => {
          if (part.type !== 'image_url') return part;
          let url: URL;
          try {
            url = new URL(part.image_url.url, origin);
          } catch {
            return part;
          }
          const match = /^\/f\/([^/]+)$/.exec(url.pathname);
          if (url.origin !== origin || !match) return part;

          const id = match[1];
          let readableUrl = pending.get(id);
          if (!readableUrl) {
            readableUrl = resolveReadableUrl(id);
            pending.set(id, readableUrl);
          }

          // Authorization failures must stop the request, never fall back to /f.
          return { ...part, image_url: { ...part.image_url, url: await readableUrl } };
        }),
      );
      return { ...message, content };
    }),
  );
};
