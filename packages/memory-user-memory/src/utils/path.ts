import path from 'node:path';

export const resolvePromptRoot = (): string => {
  return path.resolve(process.cwd(), 'packages/memory-extract/src/prompts');
};
