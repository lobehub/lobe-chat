import { createStyles } from 'antd-style';

export const useStyles = createStyles(({ css, token }) => ({
  apiName: css`
    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;

    font-size: 12px;
    text-overflow: ellipsis;

    -webkit-line-clamp: 1;
  `,
  container: css`
    cursor: pointer;

    width: fit-content;
    padding-block: 6px;
    padding-inline: 8px;
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
