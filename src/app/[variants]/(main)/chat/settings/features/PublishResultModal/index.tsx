'use client';

import { CheckCircleOutlined } from '@ant-design/icons';
import { Button, Modal, Space } from 'antd';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

interface PublishResultModalProps {
  identifier?: string;
  onCancel: () => void;
  open: boolean;
}

const PublishResultModal = memo<PublishResultModalProps>(({ identifier, onCancel, open }) => {
  const navigate = useNavigate();
  const { t } = useTranslation('setting');
  const { t: tCommon } = useTranslation('common');

  const handleGoToMarket = () => {
    if (identifier) {
      navigate(`/discover/assistant/${identifier}`);
    }
    onCancel();
  };

  const successContent = (
    <div style={{ padding: '20px 0', textAlign: 'center' }}>
      <CheckCircleOutlined
        style={{
          color: '#52c41a',
          display: 'block',
          fontSize: '48px',
          marginBottom: '16px',
        }}
      />
      <div style={{ fontSize: '16px', marginBottom: '24px' }}>
        {t('marketPublish.resultModal.message')}
      </div>
      <Space>
        <Button onClick={onCancel}>{tCommon('cancel')}</Button>
        <Button onClick={handleGoToMarket} type="primary">
          {t('marketPublish.resultModal.view')}
        </Button>
      </Space>
    </div>
  );

  return (
    <Modal
      centered
      closable={false}
      footer={null}
      onCancel={onCancel}
      open={open}
      title={null}
      width={480}
    >
      {successContent}
    </Modal>
  );
});

export default PublishResultModal;
