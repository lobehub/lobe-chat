import { Input, Modal, type ModalProps } from '@lobehub/ui';
import { App } from 'antd';
import { MouseEvent, memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useGlobalStore } from '@/store/global';
import { useSessionStore } from '@/store/session';

interface CreateGroupModalProps extends ModalProps {
  id: string;
}

const CreateGroupModal = memo<CreateGroupModalProps>(
  ({ id, open, onCancel }: CreateGroupModalProps) => {
    const { t } = useTranslation('chat');

    const toggleExpandSessionGroup = useGlobalStore((s) => s.toggleExpandSessionGroup);
    const { message } = App.useApp();
    const [updateSessionGroup, addCustomGroup] = useSessionStore((s) => [
      s.updateSessionGroupId,
      s.addSessionGroup,
    ]);
    const [input, setInput] = useState('');

    return (
      <div onClick={(e) => e.stopPropagation()}>
        <Modal
          allowFullscreen
          onCancel={onCancel}
          onOk={async (e: MouseEvent<HTMLButtonElement>) => {
            if (!input) return;

            if (input.length === 0 || input.length > 20)
              return message.warning(t('sessionGroup.tooLong'));

            const groupId = await addCustomGroup(input);
            await updateSessionGroup(id, groupId);
            toggleExpandSessionGroup(groupId, true);

            message.success(t('sessionGroup.createSuccess'));
            onCancel?.(e);
          }}
          open={open}
          title={t('sessionGroup.createGroup')}
          width={400}
        >
          <Flexbox paddingBlock={16}>
            <Input
              autoFocus
              onChange={(e) => setInput(e.target.value)}
              placeholder={t('sessionGroup.inputPlaceholder')}
              value={input}
            />
          </Flexbox>
        </Modal>
      </div>
    );
  },
);

export default CreateGroupModal;
