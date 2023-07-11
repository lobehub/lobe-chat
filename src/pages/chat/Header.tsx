import { sessionSelectors, useChatStore } from '@/store/session';
import { ActionIcon, Avatar } from '@lobehub/ui';
import { createStyles, useTheme } from 'antd-style';
import { ArchiveIcon, MoreVerticalIcon, Share2Icon } from 'lucide-react';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';
import { shallow } from 'zustand/shallow';

const useStyles = createStyles(({ css, token }) => ({
  title: css`
    font-weight: bold;
    color: ${token.colorText};
  `,
  desc: css`
    font-size: 12px;
    color: ${token.colorTextTertiary};
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
      horizontal
      align={'center'}
      distribution={'space-between'}
      padding={8}
      paddingInline={16}
      style={{
        borderBottom: `1px solid ${theme.colorSplit}`,
        gridArea: 'header',
      }}
    >
      <Flexbox horizontal align={'center'} gap={12}>
        <Avatar size={40} title={'123'} avatar={meta && sessionSelectors.getAgentAvatar(meta)} />
        <Flexbox>
          <Flexbox className={styles.title}>{meta?.title}</Flexbox>
          <Flexbox className={styles.desc}>{meta?.description || '暂无描述'}</Flexbox>
        </Flexbox>
      </Flexbox>
      <Flexbox horizontal gap={16}>
        <ActionIcon
          title={'分享'}
          icon={Share2Icon}
          onClick={() => {
            // genShareUrl();
          }}
        />
        <ActionIcon title={'归档'} icon={ArchiveIcon} />
        <ActionIcon icon={MoreVerticalIcon} onClick={toggleConfig} />
      </Flexbox>
    </Flexbox>
  );
});

export default Header;
