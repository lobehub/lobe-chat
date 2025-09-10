import { estimatedEncodeAsync } from './estimated';

export const clientEncodeAsync = async (str: string): Promise<number> => {
  return estimatedEncodeAsync(str);
};
