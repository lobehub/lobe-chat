import { ActionIcon, EditableText, SortableList } from '@lobehub/ui';
import { App, Popconfirm } from 'antd';
import { createStyles } from 'antd-style';
import { PencilLine, Trash } from 'lucide-react';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useSessionStore } from '@/store/session';
import { SessionGroupItem } from '@/types/session';

const useStyles = createStyles(({ css }) => ({
  content: css`
    position: relative;
    overflow: hidden;
    flex: 1;
  `,
  title: css`
    flex: 1;
    height: 28px;
    line-height: 28px;
    text-align: start;
  `,
}));

const GroupItem = memo<SessionGroupItem>(({ id, name }) => {
  const { t } = useTranslation('chat');
  const { styles } = useStyles();
  const { message } = App.useApp();

  const [editing, setEditing] = useState(false);
  const [updateSessionGroupName, removeSessionGroup] = useSessionStore((s) => [
    s.updateSessionGroupName,
    s.removeSessionGroup,
  ]);

  return (
    <>
      <SortableList.DragHandle />
      {!editing ? (
        <>
          <span className={styles.title}>{name}</span>
          <ActionIcon icon={PencilLine} onClick={() => setEditing(true)} size={'small'} />
          <Popconfirm
            arrow={false}
            okButtonProps={{
              danger: true,
              type: 'primary',
            }}
            onConfirm={() => {
              removeSessionGroup(id);
            }}
            title={t('sessionGroup.confirmRemoveGroupAlert')}
          >
            <ActionIcon icon={Trash} size={'small'} />
          </Popconfirm>
        </>
      ) : (
        <EditableText
          editing={editing}
          onChangeEnd={(input) => {
            if (name !== input) {
              if (!input) return;
              if (input.length === 0 || input.length > 20)
                return message.warning(t('sessionGroup.tooLong'));
              updateSessionGroupName(id, input);
              message.success(t('sessionGroup.renameSuccess'));
            }
            setEditing(false);
          }}
          onEditingChange={(e) => setEditing(e)}
          showEditIcon={false}
          size={'small'}
          style={{
            height: 28,
          }}
          type={'pure'}
          value={name}
        />
      )}
    </>
  );
});

export default GroupItem;
