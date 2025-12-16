import { createStyles } from 'antd-style';

import { getThemeToken } from './theme';

const colorToken = getThemeToken();
// 文字排版相关的通用样式
export const useTypographyStyles = createStyles(({ token, css }) => ({
  badge: css`
    display: inline-block;
    background-color: ${colorToken.colorHighlight};
    border-radius: 100px;
    padding: ${token.paddingXS}px ${token.paddingMD}px;
    font-size: ${token.fontSize}px;
    font-weight: 500;
    color: #000;
  `,

  // 正文文本 - 用于主要内容
  body: css`
    font-size: ${token.fontSizeLG}px;
    color: ${colorToken.colorTextSecondary};
    text-align: center;
    max-width: 672px;
    line-height: ${token.lineHeight};
    margin: 0;
    padding: 0 ${token.paddingLG}px;
  `,

  // 加粗文本
  bold: css`
    font-weight: 600;
  `,

  // 描述文本 - 用于次要说明
  description: css`
    font-size: ${token.fontSize}px;
    color: ${colorToken.colorTextSecondary};
    text-align: center;
    max-width: 576px;
    line-height: ${token.lineHeight};
    margin: 0;
  `,

  // 主标题 - 用于页面主要标题
  heroTitle: css`
    font-size: 80px;
    font-family: ${token.fontFamily};
    font-weight: 900;
    font-style: italic;
    text-align: center;
    letter-spacing: -5px;
    line-height: 0.9;
    color: ${colorToken.colorTextBase};
  `,

  // 小号文本
  small: css`
    font-size: ${token.fontSizeSM}px;
    color: ${colorToken.colorTextSecondary};
  `,

  // 副标题 - 用于次级标题
  subtitle: css`
    font-size: 48px;
    font-family: ${token.fontFamily};
    font-weight: 700;
    font-style: italic;
    text-align: center;
    color: ${colorToken.colorTextBase};
    margin: ${token.marginXS}px 0;
  `,

  // 文本对齐
  textCenter: css`
    text-align: center;
  `,

  textLeft: css`
    text-align: left;
  `,

  textRight: css`
    text-align: right;
  `,
}));
