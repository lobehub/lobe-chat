import { ActionIcon, EditableText, Icon } from '@lobehub/ui';
import { App, Dropdown, type MenuProps, Typography } from 'antd';
import { createStyles } from 'antd-style';
import {
  LucideCopy,
  LucideLoader2,
  MoreVertical,
  PencilLine,
  Star,
  Trash,
  Wand2,
} from 'lucide-react';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useChatStore } from '@/store/chat';

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
  showMore?: boolean;
  title: string;
}

const TopicContent = memo<TopicContentProps>(({ id, title, fav, showMore }) => {
  const { t } = useTranslation('common');

  const [
    editing,
    favoriteTopic,
    updateTopicTitle,
    removeTopic,
    autoRenameTopicTitle,
    duplicateTopic,
    isLoading,
  ] = useChatStore((s) => [
    s.topicRenamingId === id,
    s.favoriteTopic,
    s.updateTopicTitle,
    s.removeTopic,
    s.autoRenameTopicTitle,
    s.duplicateTopic,
    s.topicLoadingIds.includes(id),
  ]);
  const { styles, theme } = useStyles();

  const toggleEditing = (visible?: boolean) => {
    useChatStore.setState({ topicRenamingId: visible ? id : '' });
  };

  const { modal } = App.useApp();

  const items = useMemo<MenuProps['items']>(
    () => [
      {
        icon: <Icon icon={Wand2} />,
        key: 'autoRename',
        label: t('topic.actions.autoRename', { ns: 'chat' }),
        onClick: () => {
          autoRenameTopicTitle(id);
        },
      },
      {
        icon: <Icon icon={PencilLine} />,
        key: 'rename',
        label: t('rename'),
        onClick: () => {
          toggleEditing(true);
        },
      },
      {
        type: 'divider',
      },
      {
        icon: <Icon icon={LucideCopy} />,
        key: 'duplicate',
        label: t('topic.actions.duplicate', { ns: 'chat' }),
        onClick: () => {
          duplicateTopic(id);
        },
      },
      // {
      //   icon: <Icon icon={LucideDownload} />,
      //   key: 'export',
      //   label: t('topic.actions.export', { ns: 'chat' }),
      //   onClick: () => {
      //     configService.exportSingleTopic(sessionId, id);
      //   },
      // },
      {
        type: 'divider',
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
            onOk: async () => {
              await removeTopic(id);
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
        color={fav && !isLoading ? theme.colorWarning : undefined}
        fill={fav && !isLoading ? theme.colorWarning : 'transparent'}
        icon={isLoading ? LucideLoader2 : Star}
        onClick={(e) => {
          e.stopPropagation();
          if (!id) return;
          favoriteTopic(id, !fav);
        }}
        size={'small'}
        spin={isLoading}
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
              updateTopicTitle(id, v);
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
      {showMore && !editing && (
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
