import { createStyles } from 'antd-style';

export const useStyles = createStyles(({ css, token, isDarkMode }) => ({
  close: css`
    position: absolute;
    top: 8px;
    right: 8px;
  `,
  container: css`
    position: relative;

    overflow: hidden;

    background: linear-gradient(
      to bottom,
      ${isDarkMode ? token.colorBgElevated : token.colorBgLayout},
      ${token.colorBgContainer}
    );
    border: 1px solid ${token.colorBorderSecondary};
    border-radius: ${token.borderRadius}px;
  `,
  content: css`
    padding: 0 16px 16px;
  `,
  desc: css`
    color: ${token.colorTextDescription};
  `,
  image: css`
    align-self: center;
  `,
}));
