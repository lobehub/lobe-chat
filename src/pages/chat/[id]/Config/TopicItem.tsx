import { ActionIcon, Icon } from '@lobehub/ui';
import { Dropdown, type MenuProps, Tag, Typography } from 'antd';
import { createStyles } from 'antd-style';
import { MessageSquareDashed, MoreVertical, PencilLine, Share2, Star, Trash } from 'lucide-react';
import { memo, useMemo, useState } from 'react';
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
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { styles, theme, cx } = useStyles();
  const { t } = useTranslation('common');

  const [dispatchTopic, toggleTopic] = useSessionStore(
    (s) => [s.dispatchTopic, s.toggleTopic],
    shallow,
  );

  // TODO: 动作绑定
  const items: MenuProps['items'] = useMemo(
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
        icon: <Icon icon={Trash} />,
        key: 'delete',
        label: t('delete'),
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
              dispatchTopic({ id, key: 'favorite', type: 'updateChatTopic', value: !fav });
            }}
            size={'small'}
          />
        )}
        <Paragraph ellipsis={{ rows: 2 }} style={{ margin: 0 }}>
          {title}
        </Paragraph>
        {id ? '' : <Tag>{t('temp')}</Tag>}
      </Flexbox>
      <Dropdown
        arrow={false}
        menu={{ items }}
        onOpenChange={setDropdownOpen}
        open={dropdownOpen}
        trigger={['click']}
      >
        <ActionIcon
          className="topic-more"
          icon={MoreVertical}
          size={'small'}
          style={dropdownOpen ? { opacity: 1 } : {}}
        />
      </Dropdown>
    </Flexbox>
  );
});

export default TopicItem;
