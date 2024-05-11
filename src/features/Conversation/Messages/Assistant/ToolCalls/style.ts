import { createStyles } from 'antd-style';

export const useStyles = createStyles(({ css, token }) => ({
  container: css`
    cursor: pointer;

    width: fit-content;
    padding-inline: 4px 6px;

    color: ${token.colorText};

    background: ${token.colorFillTertiary};
    border-radius: 8px;

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
}));
