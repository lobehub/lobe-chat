import { createStyles } from 'antd-style';
import { rgba } from 'polished';

export const MIN_IMAGE_SIZE = 64;

export const useStyles = createStyles(({ css, cx, token, prefixCls }, editable?: boolean) => {
  const IMAGE_SIZE = editable ? `${MIN_IMAGE_SIZE}px` : '100%';

  const closeIcon = cx(css`
    cursor: pointer;

    position: absolute;
    top: 0;
    right: 0;

    width: 24px;
    height: 24px;

    opacity: 0;
  `);

  return {
    alwaysShowClose: css`
      opacity: 1 !important;
    `,
    closeIcon,
    container: css`
      cursor: pointer;

      position: relative;

      width: ${IMAGE_SIZE};
      min-width: ${MIN_IMAGE_SIZE};
      height: ${IMAGE_SIZE};
      min-height: ${MIN_IMAGE_SIZE};

      &:hover {
        .${closeIcon} {
          opacity: 1;
        }
      }

      .${prefixCls}-image-mask-info {
        display: flex;
        flex-direction: column;
        align-items: center;
        font-size: 12px;

        svg {
          font-size: 16px;
        }
      }
    `,
    image: css`
      width: inherit;
      height: inherit;
      border-radius: 0;

      img {
        width: ${IMAGE_SIZE} !important;
        height: ${IMAGE_SIZE} !important;
        object-fit: contain;
      }
    `,

    imageWrapper: css`
      overflow: hidden;

      width: inherit;
      height: inherit;

      background: ${rgba(token.colorBgLayout, 0.25)};
      border-radius: ${token.borderRadius}px;
      box-shadow: 0 0 0 1px ${token.colorFillTertiary};
    `,
    notFound: css`
      color: ${token.colorTextSecondary};
      background: ${token.colorFillTertiary};
      border-radius: ${token.borderRadius}px;
    `,
  };
});
