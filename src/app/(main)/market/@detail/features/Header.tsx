import { Tag } from '@lobehub/ui';
import { App, Button, Typography } from 'antd';
import isEqual from 'fast-deep-equal';
import { startCase } from 'lodash-es';
import { useRouter } from 'next/navigation';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Center, Flexbox } from 'react-layout-kit';

import { SESSION_CHAT_URL } from '@/const/url';
import { agentMarketSelectors, useMarketStore } from '@/store/market';
import { useServerConfigStore } from '@/store/serverConfig';
import { useSessionStore } from '@/store/session';

import { useStyles } from './style';

const { Link } = Typography;

const Header = memo(() => {
  const setSearchKeywords = useMarketStore((s) => s.setSearchKeywords);
  const router = useRouter();
  const { t } = useTranslation('market');
  const { styles } = useStyles();
  const createSession = useSessionStore((s) => s.createSession);
  const agentItem = useMarketStore(agentMarketSelectors.currentAgentItem, isEqual);

  const { message } = App.useApp();

  const { meta, createAt, author, homepage, config } = agentItem;
  const { title, description, tags } = meta;

  const isMobile = useServerConfigStore((s) => s.isMobile);

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
      <h2 className={styles.title}>{title}</h2>
      <Center gap={6} horizontal style={{ flexWrap: 'wrap' }}>
        {(tags as string[]).map((tag: string, index) => (
          <Tag key={index} onClick={() => setSearchKeywords(tag)} style={{ margin: 0 }}>
            {startCase(tag).trim()}
          </Tag>
        ))}
      </Center>
      <div className={styles.desc}>{description}</div>
      <Button block onClick={handleAddAgentAndConverse} type={'primary'}>
        {t('addAgentAndConverse')}
      </Button>
      <Button block onClick={handleAddAgent}>
        {t('addAgent')}
      </Button>
      <Flexbox align={'center'} gap={12} horizontal>
        <Link aria-label={author} className={styles.author} href={homepage} target={'_blank'}>
          @{author}
        </Link>
        <time className={styles.time} dateTime={new Date(createAt).toISOString()}>
          {createAt}
        </time>
      </Flexbox>
    </Center>
  );
});

export default Header;
