import { ChatFileItem, ChatImageItem } from '@/types/message';

import { filePrompts } from './file';
import { imagesPrompts } from './image';

export const filesPrompts = ({
  imageList,
  fileList,
  addUrl = true,
}: {
  addUrl?: boolean;
  fileList?: ChatFileItem[];
  imageList: ChatImageItem[];
}) => {
  if (imageList.length === 0 && (fileList || []).length === 0) return '';

  const prompt = `<!-- SYSTEM CONTEXT (NOT PART OF USER QUERY) -->
<context.instruction>following part contains context information injected by the system. Please follow these instructions:

1. Always prioritize handling user-visible content.
2. the context is only required when user's queries rely on it.
</context.instruction>
<files_info>
${imagesPrompts(imageList, addUrl)}
${fileList ? filePrompts(fileList, addUrl) : ''}
</files_info>
<!-- END SYSTEM CONTEXT -->`;

  return prompt.trim();
};
