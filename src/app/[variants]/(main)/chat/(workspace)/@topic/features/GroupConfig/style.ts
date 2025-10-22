import { createStyles } from 'antd-style';

export const useStyles = createStyles(({ css, token }) => ({
  memberItem: css`
    cursor: pointer;

    display: flex;
    flex-direction: row;
    gap: 4px;
    align-items: center;

    width: 100%;
    padding-block: 8px;
    padding-inline: 8px 12px;
    border-radius: ${token.borderRadius}px;

    transition: all 0.2s ease;

    .show-on-hover {
      opacity: 0;
    }

    &:hover {
      background: ${token.colorFillSecondary};

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
