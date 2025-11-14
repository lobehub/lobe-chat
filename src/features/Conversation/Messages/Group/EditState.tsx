import { MessageInput } from '@lobehub/ui/chat';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useChatStore } from '@/store/chat';

export interface EditStateProps {
  content: string;
  id: string;
}

const EditState = memo<EditStateProps>(({ id, content }) => {
  const { t } = useTranslation('common');

  const text = useMemo(
    () => ({
      cancel: t('cancel'),
      confirm: t('ok'),
      edit: t('edit'),
    }),
    [],
  );

  const [toggleMessageEditing, updateMessageContent] = useChatStore((s) => [
    s.toggleMessageEditing,
    s.modifyMessageContent,
  ]);

  const onEditingChange = (value: string) => {
    updateMessageContent(id, value);
    toggleMessageEditing(id, false);
  };

  return (
    <Flexbox paddingBlock={'0 8px'}>
      <MessageInput
        defaultValue={content ? String(content) : ''}
        editButtonSize={'small'}
        onCancel={() => {
          toggleMessageEditing(id, false);
        }}
        onConfirm={onEditingChange}
        text={text}
        variant={'outlined'}
      />
    </Flexbox>
  );
});

export default EditState;
