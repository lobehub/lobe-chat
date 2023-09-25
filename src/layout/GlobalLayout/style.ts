import { createStyles } from 'antd-style';

export const useStyles = createStyles(({ css, token }) => ({
  bg: css`
    overflow-y: scroll;
    display: flex;
    flex-direction: column;
    align-items: center;

    height: 100%;

    background: ${token.colorBgLayout};

    :has(#ChatLayout, #FlowLayout) {
      overflow: hidden;
    }
  `,
}));
