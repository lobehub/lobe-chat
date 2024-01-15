import { Icon, Modal, type ModalProps, SortableList } from '@lobehub/ui';
import { Button } from 'antd';
import { createStyles } from 'antd-style';
import isEqual from 'fast-deep-equal';
import { Plus } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useGlobalStore } from '@/store/global';
import { preferenceSelectors } from '@/store/global/selectors';
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
  const { t } = useTranslation('common');
  const { styles } = useStyles();
  const sessionCustomGroups = useGlobalStore(preferenceSelectors.sessionCustomGroups, isEqual);
  const [addCustomGroup, updateCustomGroup] = useGlobalStore((s) => [
    s.addCustomGroup,
    s.updateCustomGroup,
  ]);

  return (
    <Modal
      allowFullscreen
      footer={null}
      onCancel={onCancel}
      open={open}
      title={t('group.config')}
      width={400}
    >
      <Flexbox>
        <SortableList
          items={sessionCustomGroups}
          onChange={(item: SessionGroupItem[]) => updateCustomGroup(item)}
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
          onClick={() => addCustomGroup(t('group.newGroup'))}
        >
          {t('group.createGroup')}
        </Button>
      </Flexbox>
    </Modal>
  );
});

export default ConfigGroupModal;
