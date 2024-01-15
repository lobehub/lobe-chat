import { Input, Modal, type ModalProps } from '@lobehub/ui';
import { message } from 'antd';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

type CreateGroupModalProps = ModalProps & {
  onInputOk: (input: string) => void;
};

const CreateGroupModal = ({ open, onCancel, onInputOk }: CreateGroupModalProps) => {
  const { t } = useTranslation('common');

  const [input, setInput] = useState('');
  const [messageApi, contextHolder] = message.useMessage();

  const handleClickOk = (input: string) => {
    if (input.length === 0 || input.length > 10) {
      messageApi.warning(t('group.inputMsg'));
      return;
    }
    onInputOk(input);
  };

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <Modal
        allowFullscreen
        onCancel={onCancel}
        onOk={() => handleClickOk(input)}
        open={open}
        title={t('group.newGroup')}
        width={400}
      >
        <Input
          onChange={(e) => setInput(e.target.value)}
          placeholder={t('group.inputPlaceholder')}
          value={input}
        />
      </Modal>
      {contextHolder}
    </div>
  );
};

export default CreateGroupModal;
