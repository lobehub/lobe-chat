import { createStyles } from 'antd-style';

export const useStyles = createStyles(({ css, token }) => ({
  imageContainer: css`
    position: relative;
    overflow: hidden;
    width: 100%;
    border-radius: ${token.borderRadius}px;

    &:hover .generation-action-button {
      opacity: 1;
    }
  `,
  // 图片操作按钮的公共样式
  generationActionButton: css`
    position: absolute;
    inset-inline-end: 8px;

    border: 1px solid ${token.colorBorderSecondary};

    opacity: 0;
    background: ${token.colorBgContainer} !important;
    box-shadow: ${token.boxShadow};

    transition: opacity ${token.motionDurationMid} ${token.motionEaseInOut};

    &:hover {
      background: ${token.colorBgContainer} !important;
    }
  `,
  generationDelete: css`
    inset-block-start: 8px;
  `,
  generationDownload: css`
    inset-block-start: 40px;
  `,
  generationCopySeed: css`
    inset-block-start: 72px;
  `,
  placeholderContainer: css`
    position: relative;

    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;

    width: 100%;
    border: 1px solid ${token.colorBorder};
    border-radius: ${token.borderRadius}px;

    background: ${token.colorFillSecondary};

    &:hover .generation-action-button {
      opacity: 1;
    }
  `,
  loadingContent: css`
    display: flex;
    flex-direction: column;
    gap: 8px;
    align-items: center;
    justify-content: center;

    font-size: 12px;
    color: ${token.colorTextTertiary};
  `,
  errorContent: css`
    display: flex;
    flex-direction: column;
    gap: 8px;
    align-items: center;
    justify-content: center;

    padding: 8px;

    font-size: 12px;
    color: ${token.colorError};
    text-align: center;
  `,
  spinIcon: css`
    color: ${token.colorPrimary};
  `,
  errorIcon: css`
    color: ${token.colorError};
  `,
  errorText: css`
    cursor: pointer;

    margin: 0 !important;

    font-size: 10px;
    color: ${token.colorError} !important;

    opacity: 0.8;

    transition: opacity 0.2s ease;

    &:hover {
      opacity: 1;
    }
  `,
}));
