import { ActionIcon, Avatar, ChatHeader } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { ArchiveIcon, MoreVerticalIcon, Share2Icon } from 'lucide-react';
import { useTranslation } from 'next-i18next';
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
  const { t } = useTranslation('common');
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
    <ChatHeader
      left={
        <>
          <Avatar avatar={meta && sessionSelectors.getAgentAvatar(meta)} size={40} title={'123'} />
          <Flexbox>
            <Flexbox className={styles.title}>{meta?.title || t('defaultAgent')}</Flexbox>
            <Flexbox className={styles.desc}>{meta?.description || t('noDescription')}</Flexbox>
          </Flexbox>
        </>
      }
      right={
        <>
          <ActionIcon
            icon={Share2Icon}
            onClick={() => {
              // genShareUrl();
            }}
            size={{ fontSize: 24 }}
            title={t('share')}
          />
          <ActionIcon icon={ArchiveIcon} size={{ fontSize: 24 }} title={t('archive')} />
          <ActionIcon
            icon={MoreVerticalIcon}
            onClick={toggleConfig}
            size={{ fontSize: 24 }}
            title={t('sessionSetting')}
          />
        </>
      }
    />
  );
});

export default Header;
