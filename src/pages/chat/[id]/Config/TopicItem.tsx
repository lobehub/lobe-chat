import { ActionIcon, Icon } from '@lobehub/ui';
import { App, Dropdown, type MenuProps, Tag, Typography } from 'antd';
import { createStyles } from 'antd-style';
import { MessageSquareDashed, MoreVertical, PencilLine, Share2, Star, Trash } from 'lucide-react';
import { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';
import { shallow } from 'zustand/shallow';

import { useSessionStore } from '@/store/session';

const { Paragraph } = Typography;

const useStyles = createStyles(({ css, token, isDarkMode }) => ({
  active: css`
    background: ${isDarkMode ? token.colorFillTertiary : token.colorFillSecondary};
    transition: background 200ms ${token.motionEaseOut};

    &:hover {
      background: ${token.colorFill};
    }
  `,
  container: css`
    cursor: pointer;
    padding: 12px 8px;
    border-radius: ${token.borderRadius}px;

    .topic-more {
      opacity: 0;
      transition: opacity 400ms ${token.motionEaseOut};
    }

    &:hover {
      background: ${token.colorFillSecondary};

      .topic-more {
        opacity: 1;
      }
    }
  `,
  split: css`
    border-bottom: 1px solid ${token.colorSplit};
  `,
}));

export interface ConfigCellProps {
  active?: boolean;
  fav?: boolean;
  id?: string;
  showFav?: boolean;
  title: string;
}

const TopicItem = memo<ConfigCellProps>(({ title, active, id, showFav, fav }) => {
  const { styles, theme, cx } = useStyles();
  const { t } = useTranslation('common');

  const [dispatchTopic, toggleTopic, removeTopic] = useSessionStore(
    (s) => [s.dispatchTopic, s.toggleTopic, s.removeTopic],
    shallow,
  );

  const { modal } = App.useApp();
  // TODO: 动作绑定
  const items = useMemo<MenuProps['items']>(
    () => [
      {
        icon: <Icon icon={PencilLine} />,
        key: 'rename',
        label: t('rename'),
      },
      {
        icon: <Icon icon={Share2} />,
        key: 'share',
        label: t('share'),
      },
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
            title: t('topic.confirmRemoveTopic'),
          });
        },
      },
    ],
    [],
  );

  return (
    <Flexbox
      align={'center'}
      className={cx(styles.container, active && styles.active)}
      distribution={'space-between'}
      horizontal
      onClick={() => {
        toggleTopic(id);
      }}
    >
      <Flexbox align={'center'} gap={8} horizontal>
        {!showFav ? (
          <Flexbox align={'center'} height={24} justify={'center'} width={24}>
            <Icon color={theme.colorTextDescription} icon={MessageSquareDashed} />
          </Flexbox>
        ) : (
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
        )}
        <Paragraph ellipsis={{ rows: 2 }} style={{ margin: 0 }}>
          {title}
        </Paragraph>
        {id ? '' : <Tag>{t('temp')}</Tag>}
      </Flexbox>
      {!id ? null : (
        <Dropdown
          arrow={false}
          menu={{
            items,
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

export default TopicItem;
