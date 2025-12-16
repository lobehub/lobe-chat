import { createStyles } from 'antd-style';

// 间距相关的通用样式
export const useSpacingStyles = createStyles(({ token, css }) => ({
  // Margin
  marginTop: css`
    margin-top: ${token.margin}px;
  `,
  
  marginTopSM: css`
    margin-top: ${token.marginSM}px;
  `,
  
  marginTopLG: css`
    margin-top: ${token.marginLG}px;
  `,
  
  marginBottom: css`
    margin-bottom: ${token.margin}px;
  `,
  
  marginBottomSM: css`
    margin-bottom: ${token.marginSM}px;
  `,
  
  marginBottomLG: css`
    margin-bottom: ${token.marginLG}px;
  `,

  // Padding
  padding: css`
    padding: ${token.padding}px;
  `,
  
  paddingSM: css`
    padding: ${token.paddingSM}px;
  `,
  
  paddingLG: css`
    padding: ${token.paddingLG}px;
  `,

  // Gap (for flex/grid)
  gap: css`
    gap: ${token.margin}px;
  `,
  
  gapSM: css`
    gap: ${token.marginSM}px;
  `,
  
  gapLG: css`
    gap: ${token.marginLG}px;
  `,
}));