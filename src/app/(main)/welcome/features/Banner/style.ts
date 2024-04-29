import { createStyles } from 'antd-style';
import { rgba } from 'polished';

export const useStyles = createStyles(({ css, token, stylish, cx, prefixCls }) => {
  return {
    buttonGroup: css`
      .${prefixCls}-upload {
        width: 100% !important;
      }
    `,
    container: css`
      z-index: 10;

      display: flex;
      flex-direction: column;
      align-items: center;

      width: 100%;
      margin-bottom: 24px;
    `,
    desc: css`
      font-weight: 400;
      color: ${rgba(token.colorText, 0.8)};
      text-align: center;
    `,
    layout: css`
      background: ${token.colorBgContainer};
    `,
    logo: css`
      position: absolute;
      top: 16px;
      left: 16px;
      fill: ${token.colorText};
    `,
    note: css`
      z-index: 10;
      margin-top: 16px;
      color: ${token.colorTextDescription};
    `,
    skip: css`
      color: ${token.colorTextDescription};
    `,
    templateContainer: css`
      flex-wrap: wrap;
      width: 100%;
      padding: 16px;
    `,
    title: css`
      margin-bottom: 0.25em;
      font-weight: 800;
      line-height: 1.4;
      text-align: center;
    `,
    view: cx(
      stylish.noScrollbar,
      css`
        position: relative;

        overflow: hidden auto;

        max-width: 1024px;
        height: 100%;
        padding: 32px 16px;
      `,
    ),
  };
});

export const genSize = (size: number, minSize: number) => {
  return size < minSize ? minSize : size;
};
