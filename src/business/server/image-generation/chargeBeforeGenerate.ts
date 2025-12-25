import type { CreateImageServicePayload } from '@/server/routers/lambda/image';

interface ChargeParams {
  generationParams: CreateImageServicePayload['params'];
  generationTopicId?: string;
  imageNum: number;
  model: string;
  provider: string;
  userId: string;
}

export async function chargeBeforeGenerate(
  // eslint-disable-next-line unused-imports/no-unused-vars, @typescript-eslint/no-unused-vars
  params: ChargeParams,
): Promise<void> {}
