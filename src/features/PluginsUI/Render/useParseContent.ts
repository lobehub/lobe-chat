import { useMemo } from 'react';

export const useParseContent = (content: string) => {
  let isJSON = true;

  try {
    JSON.parse(content);
  } catch {
    isJSON = false;
  }

  const data = isJSON ? JSON.parse(content) : content;

  return useMemo(() => ({ data, isJSON }), [content]);
};
