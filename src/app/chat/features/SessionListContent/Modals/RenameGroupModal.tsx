import { Input, Modal, type ModalProps } from '@lobehub/ui';
import { message } from 'antd';
import isEqual from 'fast-deep-equal';
import { memo, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useGlobalStore } from '@/store/global';
import { groupHelpers } from '@/store/global/helpers';
import { settingsSelectors } from '@/store/global/selectors';

interface RenameGroupModalProps extends ModalProps {
  id: string;
}

const RenameGroupModal = memo<RenameGroupModalProps>(({ id, open, onCancel }) => {
  const { t } = useTranslation('common');
  const sessionCustomGroups = useGlobalStore(settingsSelectors.sessionCustomGroups, isEqual);
  const updateCustomGroup = useGlobalStore((s) => s.updateCustomGroup);
  const group = groupHelpers.getGroupById(id, sessionCustomGroups);
  const [input, setInput] = useState<string>();

  const handleSubmit = useCallback(
    (e: any) => {
      if (!input) return;
      if (input.length === 0 || input.length > 20) return message.warning(t('group.tooLong'));
      updateCustomGroup(groupHelpers.renameGroup(id, input, sessionCustomGroups));
      message.success(t('group.renameSuccess'));
      onCancel?.(e);
    },
    [id, input, sessionCustomGroups],
  );

  return (
    <Modal
      allowFullscreen
      cancelText={t('cancel')}
      destroyOnClose={true}
      okText={t('ok')}
      onCancel={onCancel}
      onOk={handleSubmit}
      open={open}
      title={t('group.rename')}
      width={400}
    >
      <Input
        autoFocus
        defaultValue={group?.name}
        onChange={(e) => setInput(e.target.value)}
        placeholder={t('group.inputPlaceholder')}
        value={input}
      />
    </Modal>
  );
});

export default RenameGroupModal;
