import { ActionIcon, Avatar, ChatHeader } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { ArchiveIcon, LucideEdit, MoreVerticalIcon, Share2Icon } from 'lucide-react';
import Router from 'next/router';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';
import { shallow } from 'zustand/shallow';

import { sessionSelectors, useSessionStore } from '@/store/session';

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
  const [meta, id] = useSessionStore((s) => {
    const chat = sessionSelectors.currentSession(s);
    return [chat?.meta, s.activeId];
  }, shallow);

  const [
    // genShareUrl,

    toggleConfig,
  ] = useSessionStore(
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
        id && (
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
              icon={LucideEdit}
              onClick={() => {
                Router.push(`/chat/${id}/edit`);
              }}
              size={{ blockSize: 32, fontSize: 20 }}
              title={t('edit')}
            />
            <ActionIcon
              icon={MoreVerticalIcon}
              onClick={() => toggleConfig()}
              size={{ fontSize: 24 }}
              title={t('sessionSetting')}
            />
          </>
        )
      }
    />
  );
});

export default Header;
