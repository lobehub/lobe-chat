import { createStyles } from 'antd-style';

export const useStyles = createStyles(({ css, token }) => ({
  container: css`
    cursor: pointer;

    width: fit-content;
    padding-block: 6px;
    padding-inline: 8px;
    padding-inline-end: 12px;

    color: ${token.colorText};

    background: ${token.colorBgContainer};
    border-radius: 8px;
    box-shadow: ${token.boxShadowTertiary};

    transition: box-shadow 0.2s;

    &:hover {
      box-shadow: ${token.boxShadowSecondary};
    }
  `,
  filename: css`
    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 1;

    font-size: 12px;
    text-overflow: ellipsis;
  `,
}));
