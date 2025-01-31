import { ActionIcon, EditableText, Icon } from '@lobehub/ui';
import { App, Dropdown, type MenuProps, Typography } from 'antd';
import { createStyles } from 'antd-style';
import { MoreVertical, PencilLine, Trash } from 'lucide-react';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import BubblesLoading from '@/components/BubblesLoading';
import { LOADING_FLAT } from '@/const/message';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useChatStore } from '@/store/chat';

const useStyles = createStyles(({ css, token }) => ({
  active: css`
    color: ${token.colorText};
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
    color: ${token.colorTextSecondary};
    text-align: start;
  `,
}));
const { Paragraph } = Typography;

interface TopicContentProps {
  active?: boolean;
  id: string;
  showMore?: boolean;
  title: string;
}

const Content = memo<TopicContentProps>(({ id, title, active, showMore }) => {
  const { t } = useTranslation(['thread', 'common']);

  const mobile = useIsMobile();

  const [editing, updateThreadTitle, removeThread] = useChatStore((s) => [
    s.threadRenamingId === id,
    s.updateThreadTitle,
    s.removeThread,
  ]);
  const { styles, cx } = useStyles();

  const toggleEditing = (visible?: boolean) => {
    useChatStore.setState({ threadRenamingId: visible ? id : '' });
  };

  const { modal } = App.useApp();

  const items = useMemo<MenuProps['items']>(
    () => [
      {
        icon: <Icon icon={PencilLine} />,
        key: 'rename',
        label: t('rename', { ns: 'common' }),
        onClick: () => {
          toggleEditing(true);
        },
      },
      {
        type: 'divider',
      },
      {
        danger: true,
        icon: <Icon icon={Trash} />,
        key: 'delete',
        label: t('delete', { ns: 'common' }),
        onClick: () => {
          if (!id) return;

          modal.confirm({
            centered: true,
            okButtonProps: { danger: true },
            onOk: async () => {
              await removeThread(id);
            },
            title: t('actions.confirmRemoveThread'),
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
      {!editing ? (
        title === LOADING_FLAT ? (
          <Flexbox flex={1} height={28} justify={'center'}>
            <BubblesLoading />
          </Flexbox>
        ) : (
          <Paragraph
            className={cx(styles.title, active && styles.active)}
            ellipsis={{ rows: 1, tooltip: { placement: 'left', title } }}
            style={{ margin: 0 }}
          >
            {title}
          </Paragraph>
        )
      ) : (
        <EditableText
          editing={editing}
          onChangeEnd={(v) => {
            if (title !== v) {
              updateThreadTitle(id, v);
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
      {(showMore || mobile) && !editing && (
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

export default Content;
