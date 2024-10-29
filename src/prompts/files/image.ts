import { ChatImageItem } from '@/types/message';

const imagePrompt = (item: ChatImageItem) => `<image name="${item.alt}" url="${item.url}"></image>`;

export const imagesPrompts = (imageList: ChatImageItem[]) => {
  if (imageList.length === 0) return '';

  const prompt = `<images>
${imageList.map((item) => imagePrompt(item)).join('\n')}
</images>`;

  return prompt.trim();
};
