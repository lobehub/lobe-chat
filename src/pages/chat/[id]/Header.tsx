import { ActionIcon, Avatar, ChatHeader } from '@lobehub/ui';
import { Tag } from 'antd';
import { createStyles } from 'antd-style';
import { ArchiveIcon, MoreVerticalIcon, Share2 } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';
import { shallow } from 'zustand/shallow';

import { agentSelectors, sessionSelectors, useSessionStore } from '@/store/session';

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
  const [avatar, model] = useSessionStore(
    (s) => [agentSelectors.currentAgentAvatar(s), agentSelectors.currentAgentModel(s)],
    shallow,
  );
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
          <Avatar avatar={avatar} size={40} title={meta?.title} />
          <Flexbox>
            <Flexbox align={'center'} className={styles.title} gap={8} horizontal>
              {meta?.title || t('defaultAgent')}
              <Tag bordered={false}>{model}</Tag>
            </Flexbox>
            <Flexbox className={styles.desc}>{meta?.description || t('noDescription')}</Flexbox>
          </Flexbox>
        </>
      }
      right={
        id && (
          <>
            <ActionIcon
              icon={Share2}
              onClick={() => {
                // genShareUrl();
              }}
              size={{ fontSize: 24 }}
              title={t('share')}
            />
            <ActionIcon icon={ArchiveIcon} size={{ fontSize: 24 }} title={t('archive')} />
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
