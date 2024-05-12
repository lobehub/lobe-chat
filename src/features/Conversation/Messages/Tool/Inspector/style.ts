import { createStyles } from 'antd-style';

export const useStyles = createStyles(({ css, token }) => ({
  container: css`
    cursor: pointer;

    width: fit-content;
    padding: 6px 8px;
    padding-inline-end: 12px;

    color: ${token.colorText};

    border: 1px solid ${token.colorBorder};
    border-radius: 8px;

    &:hover {
      background: ${token.colorFillTertiary};
    }
  `,
  plugin: css`
    display: flex;
    gap: 4px;
    align-items: center;
    width: fit-content;
  `,
}));
