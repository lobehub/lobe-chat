import { createStyles } from 'antd-style';

export const useStyles = createStyles(({ css, token }) => ({
  active: css`
    color: ${token.colorText};

    > img {
      box-shadow: 0 0 0 1px ${token.colorTextDescription};
    }
  `,
  container: css`
    cursor: pointer;
    color: ${token.colorTextDescription};

    > img {
      overflow: hidden;
      border-radius: ${token.borderRadius}px;
      box-shadow: 0 0 0 1px ${token.colorBorder};
      transition: all 100ms ${token.motionEaseOut};

      &:hover {
        border-color: ${token.colorText};
        box-shadow: 0 0 0 2px ${token.colorText};
      }
    }
  `,
}));
