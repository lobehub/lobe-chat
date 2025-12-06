import { createStyles } from 'antd-style';

export const useConfigPanelStyles = createStyles(({ css, token }) => ({
  dragOver: css`
    transform: scale(1.02);
    border-color: ${token.colorPrimary} !important;
    box-shadow: 0 0 0 2px ${token.colorPrimary}20;
    transition: transform 0.2s ease;
  `,

  dragTransition: css`
    transition:
      transform 0.2s ease,
      border-color 0.2s ease,
      box-shadow 0.2s ease;
  `,
}));
