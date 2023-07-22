import { ActionIcon, ChatHeader } from '@lobehub/ui';
import { createStyles } from 'antd-style';
import { Download, Share2 } from 'lucide-react';
import Head from 'next/head';
import Router from 'next/router';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import HeaderSpacing from '@/components/HeaderSpacing';

import ChatLayout from '../../layout';
import AgentConfig from './AgentConfig';
import AgentMeta from './AgentMeta';

const useStyles = createStyles(({ css, token }) => ({
  footer: css`
    position: sticky;
    bottom: 0;
    border-top: 1px solid ${token.colorBorder};
  `,
  form: css`
    overflow-y: auto;
  `,
  header: css`
    background: ${token.colorBgContainer};
    border-bottom: 1px solid ${token.colorSplit};
  `,
  title: css`
    font-size: 16px;
    font-weight: 500;
  `,
}));

const EditPage = memo(() => {
  const { t } = useTranslation('common');

  const { styles } = useStyles();

  const pageTitle = t('editAgentProfile');

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
      </Head>
      <ChatLayout>
        <ChatHeader
          left={<div className={styles.title}>{t('editAgentProfile')}</div>}
          onBackClick={() => Router.back()}
          right={
            <>
              <ActionIcon icon={Share2} size={{ fontSize: 24 }} title={t('share')} />
              <ActionIcon icon={Download} size={{ fontSize: 24 }} title={t('export')} />
            </>
          }
          showBackButton
        />
        <Flexbox className={styles.form} flex={1} gap={10} padding={24}>
          <HeaderSpacing />
          <AgentMeta />
          <AgentConfig />
        </Flexbox>
      </ChatLayout>
    </>
  );
});

export default EditPage;
