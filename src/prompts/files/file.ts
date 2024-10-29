import { ChatFileItem } from '@/types/message';

const filePrompt = (item: ChatFileItem) =>
  `<file id="${item.id}" name="${item.name}" type="${item.fileType}" size="${item.size}" url="${item.url}"></file>`;

export const filePrompts = (fileList: ChatFileItem[]) => {
  if (fileList.length === 0) return '';

  const prompt = `<images>
${fileList.map((item) => filePrompt(item)).join('\n')}
</images>`;

  return prompt.trim();
};
