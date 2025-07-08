import { Modal, type ModalProps, SortableList } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import isEqual from 'fast-deep-equal';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useSessionStore } from '@/store/session';
import { sessionSelectors } from '@/store/session/selectors';
import { LobeAgentSession } from '@/types/session';
import Item from './Item';

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

const ListModal = memo<ModalProps>(({ open, onCancel }) => {
  const { t } = useTranslation('chat');
  const { styles } = useStyles();
  const list = useSessionStore(sessionSelectors.pinnedSessions, isEqual);

  return (
    <Modal
      allowFullscreen
      footer={null}
      onCancel={onCancel}
      open={open}
      // title={t('sessionGroup.config')}
      width={400}
    >
      <Flexbox>
        <SortableList
          items={list}
          onChange={(items: LobeAgentSession[]) => {
            // updateSessionGroupSort(items);
            console.log('onChange', items);
          }}
          renderItem={(item: LobeAgentSession) => (
            <SortableList.Item
              align={'center'}
              className={styles.container}
              gap={4}
              horizontal
              id={item.id}
              justify={'space-between'}
            >
              <Item {...item} />
            </SortableList.Item>
          )}
        />
      </Flexbox>
    </Modal>
  );
});

export default ListModal;
