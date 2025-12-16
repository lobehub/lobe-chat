import { createStyles } from 'antd-style';

// 布局相关的通用样式
export const useLayoutStyles = createStyles(({ css }) => ({
  // 全屏容器 - 用于需要占满整个视口的场景
  fullScreen: css`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    z-index: 10;
  `,

  // 居中容器 - 水平垂直居中的 Flex 容器
  centered: css`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
  `,

  // 绝对定位容器
  absolute: css`
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
  `,

  // 相对定位容器
  relative: css`
    position: relative;
    height: 100%;
  `,

  // 固定底部容器
  fixedBottom: css`
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
  `,

  // 最大宽度容器
  maxWidthContainer: css`
    max-width: 1024px;
    margin: 0 auto;
    width: 100%;
  `,

  // Flex 行布局
  flexRow: css`
    display: flex;
    flex-direction: row;
    align-items: center;
  `,

  // Flex 列布局
  flexColumn: css`
    display: flex;
    flex-direction: column;
  `,

  // 空间分布
  spaceBetween: css`
    display: flex;
    justify-content: space-between;
    align-items: center;
  `,

   // 内容布局
  contentSection: css`
    margin: 0 auto;
    padding: 24px;
    text-align: center;
    width: 100%;
    min-height: 460px;
    max-width: 1152px;
  `,


}));