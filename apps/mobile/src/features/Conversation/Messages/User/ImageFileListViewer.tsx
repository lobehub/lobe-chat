import { Flexbox, Image } from '@lobehub/ui-rn';
import { memo, useMemo } from 'react';
import { useWindowDimensions } from 'react-native';

interface ImageFileItem {
  alt?: string;
  id: string;
  loading?: boolean;
  url: string;
}

interface ImageFileListViewerProps {
  items: ImageFileItem[];
}

/**
 * ImageFileListViewer - 图片列表查看器
 *
 * 展示消息中的图片列表，支持网格布局和点击预览
 * 使用 Image.PreviewGroup 实现图片画廊功能
 */
const ImageFileListViewer = memo<ImageFileListViewerProps>(({ items }) => {
  const { width } = useWindowDimensions();

  // 计算图片网格配置
  const gridConfig = useMemo(() => {
    const maxWidth = Math.min(width - 80, 240);
    const count = items.length;

    // 单张图片：宽度撑满，高度自适应
    if (count === 1) {
      return {
        gap: 0,
        imageSize: maxWidth,
        isSingle: true,
        perRow: 1,
      };
    }

    // 多张图片：网格布局（固定正方形）
    const gap = 4;
    const perRow = count === 2 ? 2 : 3;
    const imageSize = (maxWidth - gap * (perRow - 1)) / perRow;

    return {
      gap,
      imageSize,
      isSingle: false,
      perRow,
    };
  }, [items.length, width]);

  if (!items || items.length === 0) return null;

  // 单张图片：宽度撑满，高度自适应
  if (gridConfig.isSingle) {
    const item = items[0];
    return (
      <Image
        key={item.id}
        maxWidth={gridConfig.imageSize}
        source={{ uri: item.url }}
        style={{
          marginBottom: 8,
        }}
      />
    );
  }

  // 多张图片：网格布局
  return (
    <Image.PreviewGroup>
      <Flexbox
        gap={gridConfig.gap}
        horizontal
        style={{
          marginBottom: 8,
        }}
        width={gridConfig.imageSize * gridConfig.perRow + gridConfig.gap * (gridConfig.perRow - 1)}
        wrap="wrap"
      >
        {items.map((item) => (
          <Image
            autoSize={false}
            cachePolicy="memory-disk"
            contentFit="cover"
            height={gridConfig.imageSize}
            key={item.id}
            source={{ uri: item.url }}
            width={gridConfig.imageSize}
          />
        ))}
      </Flexbox>
    </Image.PreviewGroup>
  );
});

ImageFileListViewer.displayName = 'ImageFileListViewer';

export default ImageFileListViewer;
