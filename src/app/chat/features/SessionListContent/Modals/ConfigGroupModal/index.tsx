import { Icon, Modal, type ModalProps } from '@lobehub/ui';
import { Button } from 'antd';
import isEqual from 'fast-deep-equal';
import { Plus } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useGlobalStore } from '@/store/global';
import { preferenceSelectors } from '@/store/global/slices/common/selectors';

import GroupItem from './GroupItem';

const ConfigGroupModal = memo<ModalProps>(({ open, onCancel }) => {
  const { t } = useTranslation('common');
  const sessionCustomGroups = useGlobalStore(preferenceSelectors.sessionCustomGroups, isEqual);
  const addCustomGroup = useGlobalStore((s) => s.addCustomGroup);

  return (
    <Modal
      allowFullscreen
      footer={null}
      onCancel={onCancel}
      open={open}
      title={t('group.config')}
      width={400}
    >
      <Flexbox gap={16}>
        <Flexbox gap={4}>
          {sessionCustomGroups.map((group) => (
            <GroupItem key={group.id} {...group} />
          ))}
        </Flexbox>
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
