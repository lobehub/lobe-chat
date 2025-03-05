import { SegmentedProps } from 'antd';
import dayjs from 'dayjs';
import { domToJpeg, domToPng, domToSvg, domToWebp } from 'modern-screenshot';
import { useCallback, useState } from 'react';

import { BRANDING_NAME } from '@/const/branding';

export enum ImageType {
  JPG = 'jpg',
  PNG = 'png',
  SVG = 'svg',
  WEBP = 'webp',
}

export const imageTypeOptions: SegmentedProps['options'] = [
  {
    label: 'JPG',
    value: ImageType.JPG,
  },
  {
    label: 'PNG',
    value: ImageType.PNG,
  },
  {
    label: 'SVG',
    value: ImageType.SVG,
  },
  {
    label: 'WEBP',
    value: ImageType.WEBP,
  },
];

export const getImageUrl = async ({
  imageType,
  id = '#preview',
  width,
}: {
  id?: string;
  imageType: ImageType;
  width?: number;
}) => {
  let screenshotFn: any;
  switch (imageType) {
    case ImageType.JPG: {
      screenshotFn = domToJpeg;
      break;
    }
    case ImageType.PNG: {
      screenshotFn = domToPng;
      break;
    }
    case ImageType.SVG: {
      screenshotFn = domToSvg;
      break;
    }
    case ImageType.WEBP: {
      screenshotFn = domToWebp;
      break;
    }
  }

  const dom: HTMLDivElement = document.querySelector(id) as HTMLDivElement;
  let copy: HTMLDivElement = dom;

  if (width) {
    copy = dom.cloneNode(true) as HTMLDivElement;
    copy.style.width = `${width}px`;
    document.body.append(copy);
  }

  const dataUrl = await screenshotFn(width ? copy : dom, {
    features: {
      // 不启用移除控制符，否则会导致 safari emoji 报错
      removeControlCharacter: false,
    },
    scale: 2,
    width,
  });

  if (width && copy) copy?.remove();

  return dataUrl;
};

export const useScreenshot = ({
  imageType,
  title = 'share',
  id = '#preview',
  width,
}: {
  id?: string;
  imageType: ImageType;
  title?: string;
  width?: number;
}) => {
  const [loading, setLoading] = useState(false);

  const handleDownload = useCallback(async () => {
    setLoading(true);
    try {
      const dataUrl = await getImageUrl({ id, imageType, width });
      const link = document.createElement('a');
      link.download = `${BRANDING_NAME}_${title}_${dayjs().format('YYYY-MM-DD')}.${imageType}`;
      link.href = dataUrl;
      link.click();
      setLoading(false);
    } catch (error) {
      console.error('Failed to download image', error);
      setLoading(false);
    }
  }, [imageType, title]);

  return {
    loading,
    onDownload: handleDownload,
    title,
  };
};
