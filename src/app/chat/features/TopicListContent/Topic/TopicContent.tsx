import { ActionIcon, EditableText, Icon } from '@lobehub/ui';
import { App, Dropdown, type MenuProps, Typography } from 'antd';
import { createStyles } from 'antd-style';
import { MoreVertical, PencilLine, Star, Trash } from 'lucide-react';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useSessionStore } from '@/store/session';

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
const { Paragraph } = Typography;

interface TopicContentProps {
  fav?: boolean;
  id: string;
  title: string;
}

const TopicContent = memo<TopicContentProps>(({ id, title, fav }) => {
  const { t } = useTranslation('common');

  const [editing, dispatchTopic, removeTopic] = useSessionStore((s) => [
    s.renameTopicId === id,
    s.dispatchTopic,
    s.removeTopic,
  ]);
  const { styles, theme } = useStyles();

  const toggleEditing = (visible?: boolean) => {
    useSessionStore.setState({ renameTopicId: visible ? id : '' });
  };

  const { modal } = App.useApp();

  const items = useMemo<MenuProps['items']>(
    () => [
      {
        icon: <Icon icon={PencilLine} />,
        key: 'rename',
        label: t('rename'),
        onClick: () => {
          toggleEditing(true);
        },
      },
      // {
      //   icon: <Icon icon={Share2} />,
      //   key: 'share',
      //   label: t('share'),
      // },
      {
        danger: true,
        icon: <Icon icon={Trash} />,
        key: 'delete',
        label: t('delete'),
        onClick: () => {
          if (!id) return;

          modal.confirm({
            centered: true,
            okButtonProps: { danger: true },
            onOk: () => {
              removeTopic(id);
            },
            title: t('topic.confirmRemoveTopic', { ns: 'chat' }),
          });
        },
      },
    ],
    [],
  );

  return (
    <Flexbox
      align={'center'}
      gap={8}
      horizontal
      justify={'space-between'}
      onDoubleClick={(e) => {
        if (!id) return;
        if (e.altKey) toggleEditing(true);
      }}
    >
      <ActionIcon
        color={fav ? theme.colorWarning : undefined}
        fill={fav ? theme.colorWarning : 'transparent'}
        icon={Star}
        onClick={() => {
          if (!id) return;
          dispatchTopic({ favorite: !fav, id, type: 'favorChatTopic' });
        }}
        size={'small'}
      />
      {!editing ? (
        <Paragraph
          className={styles.title}
          ellipsis={{ rows: 1, tooltip: { placement: 'left', title } }}
          style={{ margin: 0 }}
        >
          {title}
        </Paragraph>
      ) : (
        <EditableText
          editing={editing}
          onChangeEnd={(v) => {
            if (title !== v) {
              dispatchTopic({ id, key: 'title', type: 'updateChatTopic', value: v });
            }
            toggleEditing(false);
          }}
          onEditingChange={toggleEditing}
          showEditIcon={false}
          size={'small'}
          style={{
            height: 28,
          }}
          type={'pure'}
          value={title}
        />
      )}
      {!editing && (
        <Dropdown
          arrow={false}
          menu={{
            items: items,
            onClick: ({ domEvent }) => {
              domEvent.stopPropagation();
            },
          }}
          trigger={['click']}
        >
          <ActionIcon
            className="topic-more"
            icon={MoreVertical}
            onClick={(e) => {
              e.stopPropagation();
            }}
            size={'small'}
          />
        </Dropdown>
      )}
    </Flexbox>
  );
});

export default TopicContent;
