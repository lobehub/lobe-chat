import { ChatHeader } from '@lobehub/ui';
import { Button } from 'antd';
import { createStyles } from 'antd-style';
import { useTranslation } from 'next-i18next';
import Router from 'next/router';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { makeI18nProps } from '@/utils/makeI18nProps';

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

  return (
    <ChatLayout>
      <Flexbox height={'100vh'} style={{ position: 'relative' }} width={'100%'}>
        {/*header*/}
        <ChatHeader
          left={<div className={styles.title}>{t('editAgentProfile')}</div>}
          onBackClick={() => Router.back()}
          right={
            <>
              <Button>{t('share')}</Button>
              <Button type={'primary'}>{t('export')}</Button>
            </>
          }
          showBackButton
        />
        {/*form*/}
        <Flexbox className={styles.form} flex={1} gap={10} padding={24}>
          <AgentMeta />
          <AgentConfig />
        </Flexbox>
      </Flexbox>
    </ChatLayout>
  );
});

export { getStaticPaths } from '@/utils/makeI18nProps';
export const getStaticProps = makeI18nProps(['common']);
export default EditPage;
