import { createStyles } from 'antd-style';

export const useStyles = createStyles(({ css, token }) => ({
  memberItem: css`
    cursor: pointer;

    display: flex;
    flex-direction: row;
    gap: 4px;
    align-items: center;

    width: 100%;
    min-height: 36px;
    max-height: 36px;
    padding-block: 0 !important;
    padding-inline: 4px !important;
    border-radius: ${token.borderRadius}px;

    transition: all 0.2s ease;

    .show-on-hover {
      opacity: 0;
    }

    &:hover {
      background: ${token.colorFillTertiary};

      .show-on-hover {
        opacity: 1;
      }
    }
  `,
  prompt: css`
    opacity: 0.75;
    transition: opacity 200ms ${token.motionEaseOut};

    &:hover {
      opacity: 1;
    }
  `,
}));
