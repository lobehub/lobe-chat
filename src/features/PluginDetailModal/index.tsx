import { Modal, TabsNav } from '@lobehub/ui';
import { Divider } from 'antd';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Center } from 'react-layout-kit';
import useMergeState from 'use-merge-value';

import MobilePadding from '@/components/MobilePadding';
import PluginSettingsConfig from '@/features/PluginSettings';

import APIs from './APIs';
import Meta from './Meta';

interface PluginDetailModalProps {
  id: string;
  onClose: () => void;
  onTabChange?: (key: string) => void;
  open?: boolean;
  schema: any;
  tab?: string;
}

const PluginDetailModal = memo<PluginDetailModalProps>(
  ({ schema, onClose, id, onTabChange, open, tab }) => {
    const [tabKey, setTabKey] = useMergeState('info', {
      onChange: onTabChange,
      value: tab,
    });
    const { t } = useTranslation('plugin');

    return (
      <Modal
        cancelText={t('cancel', { ns: 'common' })}
        okText={t('ok', { ns: 'common' })}
        onCancel={onClose}
        onOk={() => {
          onClose();
        }}
        open={open}
        title={t('detailModal.title')}
        width={650}
      >
        <MobilePadding>
          <Center gap={16}>
            <Meta id={id} />
            <Divider style={{ marginBottom: 0, marginTop: 8 }} />
            <TabsNav
              activeKey={tabKey}
              items={[
                {
                  key: 'info',
                  label: t('detailModal.tabs.info'),
                },
                schema && {
                  key: 'settings',
                  label: t('detailModal.tabs.settings'),
                },
              ]}
              onChange={setTabKey}
            />
            {tabKey === 'settings' ? (
              schema && <PluginSettingsConfig id={id} schema={schema} />
            ) : (
              <APIs id={id} />
            )}
          </Center>
        </MobilePadding>
      </Modal>
    );
  },
);

export default PluginDetailModal;
