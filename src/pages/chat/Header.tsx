import { ActionIcon, Avatar } from '@lobehub/ui';
import { createStyles, useTheme } from 'antd-style';
import { ArchiveIcon, MoreVerticalIcon, Share2Icon } from 'lucide-react';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';
import { shallow } from 'zustand/shallow';

import { sessionSelectors, useChatStore } from '@/store/session';

const useStyles = createStyles(({ css, token }) => ({
  desc: css`
    font-size: 12px;
    color: ${token.colorTextTertiary};
  `,
  title: css`
    font-weight: bold;
    color: ${token.colorText};
  `,
}));
const Header = memo(() => {
  const theme = useTheme();
  const meta = useChatStore((s) => {
    const chat = sessionSelectors.currentSession(s);
    return chat?.meta;
  }, shallow);

  const [
    // genShareUrl,

    toggleConfig,
  ] = useChatStore(
    (s) => [
      // s.genShareUrl,
      s.toggleConfig,
    ],
    shallow,
  );

  const { styles } = useStyles();
  return (
    <Flexbox
      align={'center'}
      distribution={'space-between'}
      horizontal
      padding={8}
      paddingInline={16}
      style={{
        borderBottom: `1px solid ${theme.colorSplit}`,
        gridArea: 'header',
      }}
    >
      <Flexbox align={'center'} gap={12} horizontal>
        <Avatar avatar={meta && sessionSelectors.getAgentAvatar(meta)} size={40} title={'123'} />
        <Flexbox>
          <Flexbox className={styles.title}>{meta?.title}</Flexbox>
          <Flexbox className={styles.desc}>{meta?.description || '暂无描述'}</Flexbox>
        </Flexbox>
      </Flexbox>
      <Flexbox gap={16} horizontal>
        <ActionIcon
          icon={Share2Icon}
          onClick={() => {
            // genShareUrl();
          }}
          title={'分享'}
        />
        <ActionIcon icon={ArchiveIcon} title={'归档'} />
        <ActionIcon icon={MoreVerticalIcon} onClick={toggleConfig} />
      </Flexbox>
    </Flexbox>
  );
});

export default Header;
