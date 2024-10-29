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
  const prompt = `<files_info>
${imagesPrompts(imageList)}
${fileList ? filePrompts(fileList) : ''}
</files_info>`;

  return prompt.trim();
};
