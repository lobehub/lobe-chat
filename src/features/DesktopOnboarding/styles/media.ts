import { createStyles } from 'antd-style';

// 媒体元素相关的通用样式
export const useMediaStyles = createStyles(({ css }) => ({
  // 响应式图片 - 保持宽高比
  responsiveImage: css`
    object-fit: contain;
    max-width: 100%;
    height: auto;
  `,

  // 覆盖式图片 - 填充容器
  coverImage: css`
    object-fit: cover;
    width: 100%;
    height: 100%;
  `,

  // 响应式视频
  responsiveVideo: css`
    object-fit: cover;
    width: 100%;
    height: 100%;
  `,

  // 圆形图片
  circleImage: css`
    border-radius: 50%;
    object-fit: cover;
  `,

  // 图片容器
  imageContainer: css`
    position: relative;
    overflow: hidden;
  `,
}));