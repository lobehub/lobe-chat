import { createStyles } from 'antd-style';

export const useStyles = createStyles(({ css, token }) => {
  return {
    code: css`
      font-family: ${token.fontFamilyCode};
    `,
  };
});
