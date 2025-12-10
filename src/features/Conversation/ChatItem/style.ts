import { createStyles } from 'antd-style';

export const useStyles = createStyles(({ css, token }) => {
  return {
    container: css`
      position: relative;
      max-width: 100%;

      time,
      div[role='menubar'] {
        pointer-events: none;
        opacity: 0;
        transition: opacity 200ms ${token.motionEaseOut};
      }

      time {
        display: inline-block;
        white-space: nowrap;
      }

      div[role='menubar'] {
        display: flex;
      }

      &:hover {
        time,
        div[role='menubar'] {
          pointer-events: unset;
          opacity: 1;
        }
      }
    `,
    errorContainer: css`
      position: relative;
      overflow: hidden;
      width: 100%;
    `,
    loading: css`
      position: absolute;
      inset-block-end: 0;
      inset-inline-start: -4px;
      inset-inline-end: unset;

      width: 16px;
      height: 16px;
      border-radius: 50%;

      color: ${token.colorBgLayout};

      background: ${token.colorPrimary};
    `,
  };
});
