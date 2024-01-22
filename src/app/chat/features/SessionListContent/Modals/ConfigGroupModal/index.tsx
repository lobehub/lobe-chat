import { Icon, Modal, type ModalProps, SortableList } from '@lobehub/ui';
import { Button } from 'antd';
import { createStyles } from 'antd-style';
import isEqual from 'fast-deep-equal';
import { Plus } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useSessionStore } from '@/store/session';
import { sessionGroupSelectors } from '@/store/session/selectors';
import { SessionGroupItem } from '@/types/session';

import GroupItem from './GroupItem';

const useStyles = createStyles(({ css, token, stylish }) => ({
  container: css`
    height: 36px;
    padding-inline: 8px;
    border-radius: ${token.borderRadius}px;
    transition: background 0.2s ease-in-out;

    &:hover {
      ${stylish.blur};
      background: ${token.colorFillTertiary};
    }
  `,
}));

const ConfigGroupModal = memo<ModalProps>(({ open, onCancel }) => {
  const { t } = useTranslation('chat');
  const { styles } = useStyles();
  const sessionGroupItems = useSessionStore(sessionGroupSelectors.sessionGroupItems, isEqual);
  const [addSessionGroup, updateSessionGroupSort] = useSessionStore((s) => [
    s.addSessionGroup,
    s.updateSessionGroupSort,
  ]);

  return (
    <Modal
      allowFullscreen
      footer={null}
      onCancel={onCancel}
      open={open}
      title={t('sessionGroup.config')}
      width={400}
    >
      <Flexbox>
        <SortableList
          items={sessionGroupItems}
          onChange={(items: SessionGroupItem[]) => {
            updateSessionGroupSort(items);
          }}
          renderItem={(item: SessionGroupItem) => (
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
          icon={<Icon icon={Plus} />}
          onClick={() => addSessionGroup(t('sessionGroup.newGroup'))}
        >
          {t('sessionGroup.createGroup')}
        </Button>
      </Flexbox>
    </Modal>
  );
});

export default ConfigGroupModal;
