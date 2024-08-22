import { createStyles } from 'antd-style';
import { lighten } from 'polished';

export const useStyles = createStyles(({ css, token, isDarkMode }) => ({
  container: css`
    cursor: pointer;

    width: fit-content;
    padding-block: 6px;
    padding-inline: 8px;
    padding-inline-end: 12px;

    color: ${token.colorText};

    background: ${lighten(0.1, token.colorBgElevated)};
    border-radius: 8px;
    box-shadow: ${token.boxShadowTertiary};

    transition: all 0.2s;

    &:hover {
      background: ${isDarkMode ? lighten(0.15, token.colorBgElevated) : ''};
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
  mobile: css`
    width: 100%;
  `,
}));
