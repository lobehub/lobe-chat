import { Form, Input, Modal } from '@lobehub/ui';
import { Alert } from 'antd';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import MobilePadding from '@/components/MobilePadding';
import { PLUGINS_INDEX_URL } from '@/const/url';

interface MarketSettingModalProps {
  onOpenChange: (open: boolean) => void;
  open?: boolean;
}

const MarketSettingModal = memo<MarketSettingModalProps>(({ open, onOpenChange }) => {
  const { t } = useTranslation('plugin');

  return (
    <Modal footer={null} onCancel={() => onOpenChange(false)} open={open} title={t('setting')}>
      <Flexbox gap={16}>
        <MobilePadding bottom={0} gap={16}>
          <Alert message={t('settings.indexUrl.tooltip')} showIcon type={'warning'} />
        </MobilePadding>
        <Form
          items={[
            {
              children: [
                {
                  children: (
                    <Input
                      defaultValue={PLUGINS_INDEX_URL}
                      disabled
                      placeholder={PLUGINS_INDEX_URL}
                      style={{ width: '100%' }}
                    />
                  ),
                  desc: t('settings.modalDesc'),
                  label: t('settings.indexUrl.title'),
                },
              ],
              title: t('settings.title'),
            },
          ]}
        />
      </Flexbox>
    </Modal>
  );
});

export default MarketSettingModal;
