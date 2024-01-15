import { Input, Modal, type ModalProps } from '@lobehub/ui';
import { message } from 'antd';
import isEqual from 'fast-deep-equal';
import { memo, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useGlobalStore } from '@/store/global';
import { preferenceSelectors } from '@/store/global/selectors';
import { useSessionStore } from '@/store/session';

interface CreateGroupModalProps extends ModalProps {
  id: string;
}

const CreateGroupModal = memo<CreateGroupModalProps>(
  ({ id, open, onCancel }: CreateGroupModalProps) => {
    const { t } = useTranslation('common');
    const sessionCustomGroups = useGlobalStore(preferenceSelectors.sessionCustomGroups, isEqual);
    const addCustomGroup = useGlobalStore((s) => s.addCustomGroup);
    const updateSessionGroup = useSessionStore((s) => s.updateSessionGroup);
    const [input, setInput] = useState('');

    const handleSubmit = useCallback(
      (e: any) => {
        if (!input) return;
        if (input.length === 0 || input.length > 20) return message.warning(t('group.tooLong'));

        const groupId = addCustomGroup(input);
        updateSessionGroup(id, groupId);
        message.success(t('group.createSuccess'));
        onCancel?.(e);
      },
      [id, input, sessionCustomGroups],
    );

    return (
      <Modal
        allowFullscreen
        cancelText={t('cancel')}
        okText={t('ok')}
        onCancel={onCancel}
        onOk={handleSubmit}
        open={open}
        title={t('group.createGroup')}
        width={400}
      >
        <Input
          autoFocus
          onChange={(e) => setInput(e.target.value)}
          placeholder={t('group.inputPlaceholder')}
          value={input}
        />
      </Modal>
    );
  },
);

export default CreateGroupModal;
