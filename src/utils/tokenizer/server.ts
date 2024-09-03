import { edgeClient } from '@/libs/trpc/client';

export const serverEncodeAsync = async (str: string): Promise<number> => {
  // console.log('serverEncodeAsync:', data);
  return await edgeClient.tokenizer.countTokenLength.mutate({ str });
};
