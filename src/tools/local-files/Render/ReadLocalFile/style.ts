import { createStyles } from 'antd-style';

export const useStyles = createStyles(({ css, token }) => ({
  container: css`
    overflow: hidden;

    max-width: 100%;
    padding: 12px;
    border: 1px solid ${token.colorBorderSecondary};
    border-radius: ${token.borderRadius}px;
  `,
  fileName: css`
    color: ${token.colorTextSecondary};
  `,
  meta: css`
    font-size: 10px;
    color: ${token.colorTextSecondary};
  `,
  metaItem: css`
    white-space: nowrap;
  `,
  path: css`
    font-size: 12px;
    line-height: 1;
  `,
  previewBox: css`
    padding-block: 8px;
    padding-inline: 12px;
    border-radius: ${token.borderRadiusSM}px;
    background: ${token.colorFillTertiary};
  `,
  previewText: css`
    font-family: ${token.fontFamilyCode};
    font-size: 12px;
    color: ${token.colorTextSecondary};
  `,
}));
