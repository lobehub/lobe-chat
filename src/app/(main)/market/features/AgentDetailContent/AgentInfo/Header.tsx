import { Avatar, Tag } from '@lobehub/ui';
import { App, Button, Typography } from 'antd';
import { startCase } from 'lodash-es';
import { useRouter } from 'next/navigation';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Center } from 'react-layout-kit';

import { SESSION_CHAT_URL } from '@/const/url';
import { useIsMobile } from '@/hooks/useIsMobile';
import { agentMarketSelectors, useMarketStore } from '@/store/market';
import { useSessionStore } from '@/store/session';

import { useStyles } from './style';

const { Link } = Typography;

const Header = memo(() => {
  const router = useRouter();
  const { t } = useTranslation('market');
  const { styles, theme } = useStyles();
  const createSession = useSessionStore((s) => s.createSession);
  const agentItem = useMarketStore(agentMarketSelectors.currentAgentItem);
  const { message } = App.useApp();

  const { meta, createAt, author, homepage, config } = agentItem;
  const { avatar, title, description, tags, backgroundColor } = meta;

  const isMobile = useIsMobile();

  const handleAddAgentAndConverse = async () => {
    if (!agentItem) return;

    const session = await createSession({ config, meta });
    message.success(t('addAgentSuccess'));
    router.push(SESSION_CHAT_URL(session, isMobile));
  };

  const handleAddAgent = () => {
    if (!agentItem) return;

    createSession({ config, meta }, false);
    message.success(t('addAgentSuccess'));
  };

  return (
    <Center className={styles.container} gap={16}>
      <Avatar
        animation
        avatar={avatar}
        background={backgroundColor || theme.colorFillTertiary}
        className={styles.avatar}
        size={100}
      />
      <div className={styles.title}>{title}</div>
      <Center gap={6} horizontal style={{ flexWrap: 'wrap' }}>
        {(tags as string[]).map((tag: string, index) => (
          <Tag
            key={index}
            onClick={() => useMarketStore.setState({ searchKeywords: tag })}
            style={{ margin: 0 }}
          >
            {startCase(tag).trim()}
          </Tag>
        ))}
      </Center>
      <div className={styles.desc}>{description}</div>
      <Link aria-label={author} className={styles.author} href={homepage} target={'_blank'}>
        @{author}
      </Link>
      <Button block onClick={handleAddAgentAndConverse} type={'primary'}>
        {t('addAgentAndConverse')}
      </Button>
      <Button block onClick={handleAddAgent}>
        {t('addAgent')}
      </Button>
      <div className={styles.date}>{createAt}</div>
    </Center>
  );
});

export default Header;
