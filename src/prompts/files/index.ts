import { ChatFileItem, ChatImageItem } from '@/types/message';

import { filePrompts } from './file';
import { imagesPrompts } from './image';

export const filesPrompts = ({
  imageList,
  fileList,
}: {
  fileList?: ChatFileItem[];
  imageList: ChatImageItem[];
}) => {
  if (imageList.length === 0 && (fileList || []).length === 0) return '';

  const prompt = `<files_info>
${imagesPrompts(imageList)}
${fileList ? filePrompts(fileList) : ''}
</files_info>`;

  return prompt.trim();
};
