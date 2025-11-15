'use client';

import {
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  FolderOpenOutlined,
} from '@ant-design/icons';
import { Button, Result } from 'antd';
import { memo } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

interface StatusPageProps {
  status: 'unpublished' | 'archived' | 'deprecated';
}

const StatusPage = memo<StatusPageProps>(({ status }) => {
  const navigate = useNavigate();
  const { t } = useTranslation('discover');

  const handleBackToMarket = () => {
    navigate('/discover/assistant');
  };

  // 审核中状态
  if (status === 'unpublished') {
    return (
      <div
        style={{
          alignItems: 'center',
          display: 'flex',
          flex: 1,
          justifyContent: 'center',
          minHeight: '60vh',
          padding: '20px',
        }}
      >
        <Result
          extra={
            <Button onClick={handleBackToMarket} type="primary">
              {t('assistants.status.backToMarket')}
            </Button>
          }
          icon={<ClockCircleOutlined style={{ color: '#faad14' }} />}
          subTitle={
            <div style={{ color: '#666', lineHeight: 1.6 }}>
              <Trans i18nKey="assistants.status.unpublished.subtitle" ns="discover">
                当前访问的助手正在进行版本审核中，如果有疑问复制链接发送问题到{' '}
                <a href="mailto:support@lobehub.com" style={{ color: '#1890ff' }}>
                  support@lobehub.com
                </a>{' '}
                进行咨询。
              </Trans>
            </div>
          }
          title={t('assistants.status.unpublished.title')}
        />
      </div>
    );
  }

  // 归档/拒绝状态
  const isArchived = status === 'archived';
  const statusKey = isArchived ? 'archived' : 'deprecated';
  const statusIcon = isArchived ? (
    <FolderOpenOutlined style={{ color: '#8c8c8c' }} />
  ) : (
    <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />
  );

  return (
    <div
      style={{
        alignItems: 'center',
        display: 'flex',
        flex: 1,
        justifyContent: 'center',
        minHeight: '60vh',
        padding: '20px',
      }}
    >
      <Result
        extra={
          <Button onClick={handleBackToMarket} type="primary">
            {t('assistants.status.backToMarket')}
          </Button>
        }
        icon={statusIcon}
        subTitle={
          <div style={{ color: '#666', lineHeight: 1.6 }}>
            <p>{t(`assistants.status.${statusKey}.subtitle`)}</p>
            <ul style={{ margin: '16px 0', paddingLeft: '20px', textAlign: 'left' }}>
              <li>{t(`assistants.status.${statusKey}.reasons.owner`)}</li>
              <li>{t(`assistants.status.${statusKey}.reasons.official`)}</li>
            </ul>
            <p>
              <Trans i18nKey="assistants.status.support" ns="discover">
                有各种问题请复制链接发送到{' '}
                <a href="mailto:support@lobehub.com" style={{ color: '#1890ff' }}>
                  support@lobehub.com
                </a>{' '}
                进行咨询。
              </Trans>
            </p>
          </div>
        }
        title={t(`assistants.status.${statusKey}.title`)}
      />
    </div>
  );
});

export default StatusPage;
