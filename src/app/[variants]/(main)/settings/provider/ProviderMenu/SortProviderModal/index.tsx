import { Button, Modal, SortableList } from '@lobehub/ui';
import { App } from 'antd';
import { createStyles } from 'antd-style';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useAiInfraStore } from '@/store/aiInfra';
import { AiProviderListItem } from '@/types/aiProvider';

import GroupItem from './GroupItem';

const useStyles = createStyles(({ css, token }) => ({
  container: css`
    height: 36px;
    padding-inline: 8px;
    border-radius: ${token.borderRadius}px;
    transition: background 0.2s ease-in-out;

    &:hover {
      background: ${token.colorFillTertiary};
    }
  `,
}));

interface ConfigGroupModalProps {
  defaultItems: AiProviderListItem[];
  onCancel: () => void;
  open: boolean;
}
const ConfigGroupModal = memo<ConfigGroupModalProps>(({ open, onCancel, defaultItems }) => {
  const { t } = useTranslation('modelProvider');
  const { styles } = useStyles();
  const updateAiProviderSort = useAiInfraStore((s) => s.updateAiProviderSort);
  const [loading, setLoading] = useState(false);
  const { message } = App.useApp();

  const [items, setItems] = useState(defaultItems);
  return (
    <Modal
      allowFullscreen
      footer={null}
      onCancel={onCancel}
      open={open}
      title={t('sortModal.title')}
      width={400}
    >
      <Flexbox gap={16}>
        <SortableList
          items={items}
          onChange={async (items: AiProviderListItem[]) => {
            setItems(items);
          }}
          renderItem={(item: AiProviderListItem) => (
            <SortableList.Item
              align={'center'}
              className={styles.container}
              gap={4}
              horizontal
              id={item.id}
              justify={'space-between'}
            >
              <GroupItem {...item} />
            </SortableList.Item>
          )}
        />
        <Button
          block
          loading={loading}
          onClick={async () => {
            const sortMap = items.map((item, index) => ({
              id: item.id,
              sort: index,
            }));
            setLoading(true);
            await updateAiProviderSort(sortMap);
            setLoading(false);
            message.success(t('sortModal.success'));
            onCancel();
          }}
          type={'primary'}
        >
          {t('sortModal.update')}
        </Button>
      </Flexbox>
    </Modal>
  );
});

export default ConfigGroupModal;
