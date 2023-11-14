import { createStyles } from 'antd-style';

export const IMAGE_SIZE = 64;
const imageBorderRaidus = 8;

export const useStyles = createStyles(({ css, cx, token, isDarkMode }) => {
  const closeIcon = cx(css`
    cursor: pointer;

    position: absolute;
    top: -6px;
    right: -6px;

    width: 16px;
    height: 16px;

    color: ${isDarkMode ? token.colorTextQuaternary : token.colorTextTertiary};

    opacity: 0;
    background: ${isDarkMode ? token.colorTextSecondary : token.colorBgContainer};
    border-radius: 50%;

    transition: all 0.2s ease-in;

    &:hover {
      scale: 1.2;
    }
  `);

  return {
    closeIcon,
    container: css`
      cursor: pointer;

      position: relative;

      width: ${IMAGE_SIZE}px;
      height: ${IMAGE_SIZE}px;

      border-radius: ${imageBorderRaidus}px;

      &:hover {
        .${closeIcon} {
          opacity: 1;
        }
      }
    `,
    image: css`
      opacity: ${isDarkMode ? 0.6 : 1};
      object-fit: cover;
      border-radius: 8px;
      animation: fade-in 0.3s ease-in;

      @keyframes fade-in {
        from {
          scale: 1.2;
          opacity: 1;
        }

        to {
          scale: 1;
          opacity: 1;
        }
      }
    `,
    imageCtn: css`
      position: relative;
    `,
    imageWrapper: css`
      overflow: hidden;
      width: ${IMAGE_SIZE}px;
      height: ${IMAGE_SIZE}px;
      border-radius: ${imageBorderRaidus}px;
    `,
    notFound: css`
      color: ${token.colorTextSecondary};
      background: ${token.colorFillTertiary};
      border-radius: ${imageBorderRaidus}px;
    `,
  };
});
