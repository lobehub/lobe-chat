import { createStyles } from 'antd-style';
import chroma from 'chroma-js';

export const useStyles = createStyles(({ css, token, prefixCls }) => ({
  avatar: css`
    border-radius: 50%;
    transition:
      scale 400ms ${token.motionEaseOut},
      box-shadow 100ms ${token.motionEaseOut};

    &:hover {
      box-shadow: 0 0 0 3px ${token.colorText};
    }

    &:active {
      scale: 0.8;
    }
  `,
  picker: css`
    em-emoji-picker {
      --rgb-accent: ${chroma(token.colorPrimary) .rgb() .join(',')};
      --shadow: none;
    }
  `,
  popover: css`
    .${prefixCls}-popover-inner {
      padding: 0;
    }
  `,
}));
