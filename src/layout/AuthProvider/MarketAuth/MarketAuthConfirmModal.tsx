'use client';

import { Modal } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

const useStyles = createStyles(({ css, token }) => ({
  content: css`
    .ant-modal-content {
      overflow: hidden;
      padding: 0;
    }

    .ant-modal-header {
      margin-block-end: 0;
      padding: 0;
      border-block-end: none;
    }

    .ant-modal-body {
      padding: 0;
    }

    .ant-modal-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;

      margin-block-start: 0;
      padding-block: 16px;
      padding-inline: 24px;
      border-block-start: 1px solid ${token.colorBorder};

      background: ${token.colorBgContainer};

      .ant-btn {
        margin: 0;
      }
    }
  `,
  description: css`
    font-size: 14px;
    line-height: 1.5;
    color: ${token.colorTextSecondary};
    text-align: center;

    a {
      color: ${token.colorPrimary};
      text-decoration: none;

      &:hover {
        text-decoration: underline;
      }
    }

    .highlight {
      font-weight: 500;
      color: ${token.colorText};
    }
  `,
  header: css`
    padding-block: 24px 16px;
    padding-inline: 24px;
    text-align: center;
  `,
  iconWrapper: css`
    display: flex;
    flex-direction: column;
    align-items: center;

    padding-block: 32px 0;
    padding-inline: 0;
  `,
  okButton: css`
    display: flex;
    gap: 8px;
    align-items: center;
  `,
  shieldIcon: css`
    display: flex;
    align-items: center;
    justify-content: center;

    width: 64px;
    height: 64px;
    border-radius: 50%;

    background: ${token.colorPrimaryBg};

    svg {
      width: 36px;
      height: 36px;
      color: ${token.colorPrimary};
    }
  `,
  title: css`
    margin-block-end: 24px;
    font-size: 18px;
    font-weight: 600;
    color: ${token.colorText};
  `,
}));

interface MarketAuthConfirmModalProps {
  onCancel: () => void;
  onConfirm: () => void;
  open: boolean;
}

const MarketAuthConfirmModal = memo<MarketAuthConfirmModalProps>(
  ({ open, onConfirm, onCancel }) => {
    const { t } = useTranslation('marketAuth');
    const { styles } = useStyles();

    return (
      <Modal
        cancelText={t('authorize.cancel')}
        className={styles.content}
        okButtonProps={{
          className: styles.okButton,
          icon: <ArrowRight size={16} />,
        }}
        okText={t('authorize.confirm')}
        onCancel={onCancel}
        onOk={onConfirm}
        open={open}
        title={null}
        width={440}
      >
        <div className={styles.iconWrapper}>
          <div className={styles.shieldIcon}>
            <ShieldCheck />
          </div>
        </div>

        <div className={styles.header}>
          <div className={styles.title}>{t('authorize.title')}</div>
          <div className={styles.description}>
            {t('authorize.description.prefix')} <span className="highlight">LobeHub</span>{' '}
            <a href="https://lobehub.com/terms" rel="noopener noreferrer" target="_blank">
              {t('authorize.description.terms')}
            </a>{' '}
            {t('authorize.description.and')}{' '}
            <a href="https://lobehub.com/privacy" rel="noopener noreferrer" target="_blank">
              {t('authorize.description.privacy')}
            </a>
          </div>
        </div>
      </Modal>
    );
  },
);

MarketAuthConfirmModal.displayName = 'MarketAuthConfirmModal';

export default MarketAuthConfirmModal;
