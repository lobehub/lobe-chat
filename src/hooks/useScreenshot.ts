import { BRANDING_NAME } from '@lobechat/business-const';
import { type TabsItem } from '@lobehub/ui/base-ui';
import { snapdom } from '@zumer/snapdom';
import dayjs from 'dayjs';
import { useCallback, useState } from 'react';

export enum ImageType {
  JPG = 'jpg',
  PNG = 'png',
  SVG = 'svg',
  WEBP = 'webp',
}

export const imageTypeOptions: TabsItem[] = [
  { key: ImageType.JPG, label: 'JPG' },
  { key: ImageType.PNG, label: 'PNG' },
  { key: ImageType.SVG, label: 'SVG' },
  { key: ImageType.WEBP, label: 'WEBP' },
];

/**
 * Pre-inline cross-origin images as data URLs before snapdom capture.
 *
 * snapdom re-fetches every `<img>` URL via `fetch()` to convert to a data URL.
 * For cross-origin images, `fetch()` requires the host to return CORS headers.
 * If the fetch fails, snapdom replaces the image with a blank/placeholder,
 * and the `@lobehub/ui` Image wrapper's filled background shows through as gray.
 *
 * To avoid this, we re-load each image with `crossOrigin="anonymous"` and draw
 * it to a canvas to produce a data URL. When snapdom then processes the `<img>`,
 * its `src` is already a `data:` URL, which snapdom handles without re-fetching.
 *
 * Images from hosts that don't support CORS will fail to re-load with
 * `crossOrigin` and are left untouched (snapdom will try and fail, leaving a
 * blank area — better than a gray "img" placeholder).
 */
const inlineImages = async (root: HTMLElement, timeout = 10_000): Promise<void> => {
  const imgs = Array.from(root.querySelectorAll('img'));

  // Convert an image URL to a data URL via fetch → blob → FileReader.
  // Works for same-origin URLs (follows 302 redirects, no CORS needed)
  // and cross-origin URLs that return Access-Control-Allow-Origin.
  const fetchToDataURL = (url: string): Promise<string | null> =>
    new Promise((resolve) => {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeout);
      fetch(url, { signal: controller.signal })
        .then((res) => {
          clearTimeout(timer);
          if (!res.ok) return resolve(null);
          return res.blob().then((blob) => {
            const reader = new FileReader();
            reader.onload = () =>
              typeof reader.result === 'string' ? resolve(reader.result) : resolve(null);
            reader.onerror = () => resolve(null);
            reader.readAsDataURL(blob);
          });
        })
        .catch(() => {
          clearTimeout(timer);
          resolve(null);
        });
    });

  // Convert an image URL to a data URL via Image + canvas.
  // Used as fallback for cross-origin URLs where fetch() fails but the
  // image is already loaded in the browser and the host supports CORS
  // via the Access-Control-Allow-Origin header.
  const canvasToDataURL = (url: string, img: HTMLImageElement): Promise<string | null> =>
    new Promise((resolve) => {
      const loader = new Image();
      loader.crossOrigin = 'anonymous';
      const timer = setTimeout(() => {
        loader.src = '';
        resolve(null);
      }, timeout);
      loader.onload = () => {
        clearTimeout(timer);
        try {
          const canvas = document.createElement('canvas');
          const w = loader.naturalWidth || img.naturalWidth || img.width;
          const h = loader.naturalHeight || img.naturalHeight || img.height;
          if (!w || !h) return resolve(null);
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          if (!ctx) return resolve(null);
          ctx.drawImage(loader, 0, 0, w, h);
          resolve(canvas.toDataURL());
        } catch {
          resolve(null);
        }
      };
      loader.onerror = () => {
        clearTimeout(timer);
        resolve(null);
      };
      loader.src = url;
    });

  await Promise.allSettled(
    imgs.map(async (img) => {
      const src = img.getAttribute('src') || '';

      // Skip data URLs, blob URLs, and empty src — snapdom handles these fine.
      if (!src || src.startsWith('data:') || src.startsWith('blob:')) return;

      // For same-origin URLs, use fetch() which follows 302 redirects to
      // cross-origin CDNs (e.g. R2) without needing CORS on the redirect
      // response. For cross-origin URLs, try fetch() first (works if the host
      // returns CORS headers), then fall back to Image + canvas.
      let isSameOrigin: boolean;
      try {
        isSameOrigin = new URL(src, location.href).origin === location.origin;
      } catch {
        // Invalid URL — skip.
        return;
      }

      const dataUrl = await fetchToDataURL(src);
      if (dataUrl) {
        img.setAttribute('src', dataUrl);
        return;
      }

      // fetch() failed — try Image + canvas as fallback (cross-origin only,
      // same-origin failures are left untouched).
      if (isSameOrigin) return;
      const fallback = await canvasToDataURL(src, img);
      if (fallback) img.setAttribute('src', fallback);
    }),
  );
};

export const getImageUrl = async ({
  imageType,
  id = '#preview',
  width,
}: {
  id?: string;
  imageType: ImageType;
  width?: number;
}) => {
  const dom: HTMLDivElement = document.querySelector(id) as HTMLDivElement;
  let copy: HTMLDivElement = dom;

  if (width) {
    copy = dom.cloneNode(true) as HTMLDivElement;
    copy.style.width = `${width}px`;
    document.body.append(copy);
  }

  // Pre-inline images as data URLs so snapdom doesn't need to re-fetch them.
  // This prevents cross-origin images from becoming gray in the export.
  await inlineImages(width ? copy : dom);

  const baseOptions = {
    scale: 2,
    width,
  };

  let blob: Blob;

  if (imageType === ImageType.SVG) {
    // For SVG, we need to use the full snapdom API to get the raw SVG string
    const result = await snapdom(width ? copy : dom, baseOptions);
    const svgString = result.toRaw();
    blob = new Blob([svgString], { type: 'image/svg+xml' });
  } else {
    // For raster formats, use toBlob directly with type option
    const blobType = (imageType === ImageType.JPG ? 'jpg' : imageType) as 'png' | 'jpg' | 'webp';
    const blobResult = await snapdom.toBlob(width ? copy : dom, {
      type: blobType,
      placeholders: false,
    });

    if (!blobResult) {
      throw new Error('Failed to generate blob from snapdom');
    }

    blob = blobResult;
  }

  if (width && copy) copy?.remove();

  if (!blob) {
    throw new Error('Blob is undefined');
  }

  // Convert blob to data URL using FileReader
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('FileReader result is not a string'));
      }
    });
    reader.addEventListener('error', () =>
      reject(reader.error || new Error('Failed to read blob as data URL')),
    );
    reader.readAsDataURL(blob);
  });
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
