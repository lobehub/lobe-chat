import { createStyles } from 'antd-style';

// 间距相关的通用样式
export const useSpacingStyles = createStyles(({ token, css }) => ({
  // Gap (for flex/grid)
  gap: css`
    gap: ${token.margin}px;
  `,

  gapLG: css`
    gap: ${token.marginLG}px;
  `,

  gapSM: css`
    gap: ${token.marginSM}px;
  `,

  // Margin
  marginBottom: css`
    margin-bottom: ${token.margin}px;
  `,

  marginBottomLG: css`
    margin-bottom: ${token.marginLG}px;
  `,

  marginBottomSM: css`
    margin-bottom: ${token.marginSM}px;
  `,

  marginTop: css`
    margin-top: ${token.margin}px;
  `,

  marginTopLG: css`
  margin-top: ${token.marginLG}px;
  `,

  marginTopSM: css`
    margin-top: ${token.marginSM}px;
  `,

  // Padding
  padding: css`
    padding: ${token.padding}px;
  `,

  paddingLG: css`
    padding: ${token.paddingLG}px;
  `,

  paddingSM: css`
    padding: ${token.paddingSM}px;
  `,
}));
