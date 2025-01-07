import { createStyles } from 'antd-style';

export const useStyles = createStyles(({ css, token }) => ({
  container: css`
    cursor: pointer;

    width: 100%;
    padding-block: 10px;
    padding-inline: 8px;
    padding-inline-end: 12px;
    border-radius: 8px;

    color: ${token.colorText};

    background: ${token.colorBgElevated};

    &:hover {
      background: ${token.colorFillSecondary};
    }
  `,
  plugin: css`
    display: flex;
    gap: 4px;
    align-items: center;
    width: fit-content;
  `,
  tag: css`
    cursor: default;

    display: flex;
    align-items: center;
    justify-content: center;

    width: 24px;
    height: 24px;
    border-radius: 4px;
  `,
  tagBlue: css`
    color: ${token.geekblue};
    background: ${token.geekblue1};
  `,
  tagGreen: css`
    color: ${token.green};
    background: ${token.green1};
  `,
}));
