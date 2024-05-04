import { createStyles } from 'antd-style';

export const useStyles = createStyles(({ css, token, isDarkMode }) => ({
  bannerBox: css`
    position: relative;

    overflow: hidden;
    flex: none;

    width: 100%;
    height: 100px;

    background: ${token.colorFill};
  `,
  bannerImg: css`
    position: absolute;
    scale: 8;
    filter: blur(6px) saturate(2);
  `,
  info: css`
    position: relative;

    margin-top: ${-token.borderRadiusLG}px;

    background: ${isDarkMode ? token.colorBgLayout : token.colorBgContainer};
    border-top-left-radius: ${token.borderRadiusLG}px;
    border-top-right-radius: ${token.borderRadiusLG}px;
  `,
}));
