import { RuntimeImageGenParams } from '@/libs/standard-parameters/index';

export type CreateImagePayload = {
  model: string;
  params: RuntimeImageGenParams;
};

export type CreateImageResponse = {
  /**
   * 图片的高度
   */
  height?: number;

  /**
   * 一般是 provider 家的 cdn 地址，多数一段时间后就会失效，需要重新请求
   */
  imageUrl: string;
  // 为什么返回宽高？
  // 1. 你给的配置宽度和真正最后生成的宽度可能并不一致，这个需要存储到 generation 的 asset 中
  // 2. 我需要图片宽高用于计算是否需要生成缩略图，很多 provider 一般都会返回宽高，这样也许我可以省去一些计算
  /**
   * 图片的宽度
   */
  width?: number;
};
