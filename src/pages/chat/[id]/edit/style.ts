import { createStyles } from 'antd-style';

export const useStyles = createStyles(({ css, token }) => ({
  collapseHeader: css`
    .ant-collapse-header {
      align-items: center !important;
    }
  `,
  footer: css`
    position: sticky;
    bottom: 0;
    border-top: 1px solid ${token.colorBorder};
  `,
  form: css`
    overflow-y: auto;
  `,
  header: css`
    background: ${token.colorBgContainer};
    border-bottom: 1px solid ${token.colorSplit};
  `,
  profile: css`
    font-size: 20px;
    font-weight: bold;
    color: ${token.colorText};
  `,
  prompt: css`
    padding: 12px;
    background: ${token.colorFillTertiary};
  `,
  title: css`
    font-size: 16px;
    font-weight: 500;

    .ant-collapse-header {
      padding: 0 !important;
    }

    .ant-collapse-content-box {
      padding: 0 !important;
    }
  `,
}));
