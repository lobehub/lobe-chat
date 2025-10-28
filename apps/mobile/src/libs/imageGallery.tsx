import React from 'react';
import RootSiblings from 'react-native-root-siblings';

import ImageGallery from '@/components/ImageGallery';

class ImageGalleryManager {
  private sibling: RootSiblings | null = null;

  /**
   * 显示图片全屏画廊
   * @param images 图片 URL 数组
   * @param initialIndex 初始显示的图片索引，默认为 0
   */
  show(images: string[], initialIndex: number = 0): void {
    if (this.sibling) {
      this.close();
    }

    this.sibling = new RootSiblings(
      <ImageGallery images={images} initialIndex={initialIndex} onClose={() => this.close()} />,
    );
  }

  /**
   * 关闭图片画廊
   */
  close(): void {
    if (this.sibling) {
      this.sibling.destroy();
      this.sibling = null;
    }
  }
}

// 导出单例
export const imageGallery = new ImageGalleryManager();
