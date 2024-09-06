export enum ImageType {
  JPG = 'jpg',
  PNG = 'png',
  SVG = 'svg',
  WEBP = 'webp',
}

export type FieldType = {
  imageType: ImageType;
  withBackground: boolean;
  withFooter: boolean;
  withPluginInfo: boolean;
  withSystemRole: boolean;
};
