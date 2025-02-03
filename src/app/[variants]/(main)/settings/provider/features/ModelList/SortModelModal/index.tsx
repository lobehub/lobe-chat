import { Modal, SortableList } from '@lobehub/ui';
import { App, Button } from 'antd';
import { createStyles } from 'antd-style';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useAiInfraStore } from '@/store/aiInfra';
import { AiProviderModelListItem } from '@/types/aiModel';

import ListItem from './ListItem';

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

interface SortModelModalProps {
  defaultItems: AiProviderModelListItem[];
  onCancel: () => void;
  open: boolean;
}
const SortModelModal = memo<SortModelModalProps>(({ open, onCancel, defaultItems }) => {
  const { t } = useTranslation('modelProvider');
  const { styles } = useStyles();
  const [providerId, updateAiModelsSort] = useAiInfraStore((s) => [
    s.activeAiProvider,
    s.updateAiModelsSort,
  ]);
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
          onChange={async (items: AiProviderModelListItem[]) => {
            setItems(items);
          }}
          renderItem={(item: AiProviderModelListItem) => (
            <SortableList.Item
              align={'center'}
              className={styles.container}
              gap={4}
              horizontal
              id={item.id}
              justify={'space-between'}
            >
              <ListItem {...item} />
            </SortableList.Item>
          )}
        />
        <Button
          block
          loading={loading}
          onClick={async () => {
            if (!providerId) return;

            const sortMap = items.map((item, index) => ({
              id: item.id,
              sort: index,
            }));

            setLoading(true);
            await updateAiModelsSort(providerId, sortMap);
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

export default SortModelModal;
