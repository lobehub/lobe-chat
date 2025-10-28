export interface ImageGalleryProps {
  /**
   * 图片 URL 数组
   */
  images: string[];

  /**
   * 初始显示的图片索引
   * @default 0
   */
  initialIndex?: number;

  /**
   * 关闭回调
   */
  onClose: () => void;
}
