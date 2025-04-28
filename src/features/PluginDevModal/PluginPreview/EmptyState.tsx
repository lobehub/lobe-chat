import { Icon } from '@lobehub/ui';
import { Space, Typography } from 'antd';
import { createStyles } from 'antd-style';
import { Puzzle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const { Title, Paragraph } = Typography;

// Create styles using antd-style
const useStyles = createStyles(({ token, css }) => ({
  container: css`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    width: 100%;
    height: 100%;
    padding: ${token.paddingLG}px;
  `,
  description: css`
    max-width: 320px;
    color: ${token.colorTextSecondary};
    text-align: center;
  `,
  iconWrapper: css`
    display: flex;
    align-items: center;
    justify-content: center;

    width: 64px;
    height: 64px;
    margin-block-end: ${token.marginMD}px;
    border-radius: 50%;

    background-color: ${token.colorPrimaryBg};
  `,
  line: css`
    height: 6px;
    border-radius: 3px;
    background: ${token.colorBorderSecondary};
  `,
  placeholderLine: css`
    height: 6px;
    margin-block: ${token.marginXS}px;
    margin-inline: 0;
    border-radius: ${token.borderRadiusLG}px;

    background-color: ${token.colorBorderSecondary};
  `,
  title: css`
    margin-block-end: ${token.marginXS}px;
    font-size: ${token.fontSizeLG}px;
    font-weight: 500;
  `,
}));

export default function PluginEmptyState() {
  const { styles } = useStyles();
  const { t } = useTranslation('plugin');

  return (
    <div className={styles.container}>
      <div className={styles.iconWrapper}>
        <Icon icon={Puzzle} size={32} />
      </div>
      <Title className={styles.title} level={4}>
        {t('dev.preview.empty.title')}
      </Title>
      <Paragraph className={styles.description}>{t('dev.preview.empty.desc')}</Paragraph>
      <Space align="center" direction="vertical" style={{ marginTop: 24 }}>
        <div className={styles.line} style={{ width: 128 }} />
        <div className={styles.line} style={{ width: 96 }} />
        <div className={styles.line} style={{ width: 48 }} />
      </Space>
    </div>
  );
}
