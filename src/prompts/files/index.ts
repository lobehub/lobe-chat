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
<files_docstring>here are user upload files and images you can refer to</files_docstring>

${imagesPrompts(imageList)}
${fileList ? filePrompts(fileList) : ''}
</files_info>`;

  return prompt.trim();
};
