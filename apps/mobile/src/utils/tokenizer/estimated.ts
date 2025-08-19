import { approximateTokenSize } from 'tokenx';

export const estimatedEncodeAsync = async (str: string): Promise<number> =>
  approximateTokenSize(str);
