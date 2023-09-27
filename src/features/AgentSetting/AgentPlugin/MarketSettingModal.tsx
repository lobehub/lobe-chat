import { Input, Modal, Tooltip } from '@lobehub/ui';
import { Form } from 'antd';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { PLUGINS_INDEX_URL } from '@/const/url';

interface MarketSettingModalProps {
  onOpenChange: (open: boolean) => void;
  open?: boolean;
}

const MarketSettingModal = memo<MarketSettingModalProps>(({ open, onOpenChange }) => {
  const { t } = useTranslation('plugin');

  return (
    <Modal
      footer={null}
      onCancel={() => onOpenChange(false)}
      open={open}
      title={t('settings.title')}
    >
      <Flexbox gap={12}>
        <Form layout={'vertical'}>
          <Form.Item extra={t('settings.modalDesc')} label={t('settings.indexUrl.title')}>
            <Tooltip title={t('settings.indexUrl.tooltip')}>
              <Input defaultValue={PLUGINS_INDEX_URL} disabled placeholder={'https://xxxxx.com'} />
            </Tooltip>
          </Form.Item>
        </Form>
      </Flexbox>
    </Modal>
  );
});

export default MarketSettingModal;
