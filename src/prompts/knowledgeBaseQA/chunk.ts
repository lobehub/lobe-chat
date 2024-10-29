import { ChatSemanticSearchChunk } from '@/types/chunk';

const chunkPrompt = (item: ChatSemanticSearchChunk) =>
  `<chunk id="${item.id}" similarity="${item.similarity}" pageNumber="${item.pageNumber}">${item.text}</chunk>`;

export const chunkPrompts = (fileList: ChatSemanticSearchChunk[]) => {
  if (fileList.length === 0) return '';

  const prompt = `<retrieved_chunks>
<retrieved_chunks_docstring>here are retrived chunks you can refer to:</retrieved_chunks_docstring>
${fileList.map((item) => chunkPrompt(item)).join('\n')}
</retrieved_chunks>`;

  return prompt.trim();
};
