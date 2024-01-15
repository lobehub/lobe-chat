import { ActionIcon, EditableText } from '@lobehub/ui';
import { Popconfirm, Typography, message } from 'antd';
import { createStyles } from 'antd-style';
import isEqual from 'fast-deep-equal';
import { PencilLine, Trash } from 'lucide-react';
import { memo, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useGlobalStore } from '@/store/global';
import { groupHelpers } from '@/store/global/slices/common/helpers';
import { preferenceSelectors } from '@/store/global/slices/common/selectors';
import { SessionGroupItem } from '@/types/session';

const useStyles = createStyles(({ css, token }) => ({
  container: css`
    height: 36px;
    padding-right: 8px;
    padding-left: 12px;

    border-radius: ${token.borderRadius}px;

    transition: background 0.2s ease-in-out;

    &:hover {
      background: ${token.colorFillTertiary};
    }
  `,
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
const { Paragraph } = Typography;

const GroupItem = memo<SessionGroupItem>(({ id, name }) => {
  const [editing, setEditing] = useState(false);
  const sessionCustomGroups = useGlobalStore(preferenceSelectors.sessionCustomGroups, isEqual);
  const updateCustomGroup = useGlobalStore((s) => s.updateCustomGroup);
  const { t } = useTranslation('common');
  const { styles } = useStyles();

  const handleRename = useCallback(
    (input: string) => {
      if (!input) return;
      if (input.length === 0 || input.length > 20) return message.warning(t('group.tooLong'));
      updateCustomGroup(groupHelpers.renameGroup(id, input, sessionCustomGroups));
      message.success(t('group.renameSuccess'));
    },
    [id, sessionCustomGroups],
  );

  return (
    <Flexbox
      align={'center'}
      className={styles.container}
      gap={4}
      horizontal
      justify={'space-between'}
    >
      {!editing ? (
        <>
          <Paragraph className={styles.title} style={{ margin: 0 }}>
            {name}
          </Paragraph>
          <ActionIcon icon={PencilLine} onClick={() => setEditing(true)} size={'small'} />
          <Popconfirm
            arrow={false}
            cancelText={t('cancel')}
            okButtonProps={{
              danger: true,
              type: 'primary',
            }}
            okText={t('ok')}
            onConfirm={() => {
              updateCustomGroup(groupHelpers.removeGroup(id, sessionCustomGroups));
            }}
            title={t('group.confirmRemoveGroupAlert')}
          >
            <ActionIcon icon={Trash} size={'small'} />
          </Popconfirm>
        </>
      ) : (
        <EditableText
          editing={editing}
          onChangeEnd={(v) => {
            if (name !== v) handleRename(v);
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
    </Flexbox>
  );
});

export default GroupItem;
