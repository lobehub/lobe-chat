import { ChatFileItem } from '@/types/message';

const filePrompt = (item: ChatFileItem, addUrl: boolean) =>
  addUrl
    ? `<file id="${item.id}" name="${item.name}" type="${item.fileType}" size="${item.size}" url="${item.url}"></file>`
    : `<file id="${item.id}" name="${item.name}" type="${item.fileType}" size="${item.size}"></file>`;

export const filePrompts = (fileList: ChatFileItem[], addUrl: boolean) => {
  if (fileList.length === 0) return '';

  const prompt = `<files>
<files_docstring>here are user upload files you can refer to</files_docstring>
${fileList.map((item) => filePrompt(item, addUrl)).join('\n')}
</files>`;

  return prompt.trim();
};
