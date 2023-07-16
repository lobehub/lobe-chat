import { ActionIcon, Avatar, Input, TextArea } from '@lobehub/ui';
import { Button, Slider } from 'antd';
import { createStyles } from 'antd-style';
import { LucideChevronLeft } from 'lucide-react';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Router from 'next/router';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import ChatLayout from '../../layout';
import FormItem from './Form';

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
  profile: css`
    font-size: 20px;
    color: ${token.colorTextTertiary};
  `,
  title: css`
    font-size: 16px;
    font-weight: 500;
  `,
}));

const EditPage = memo(() => {
  const { t } = useTranslation('common');

  const { styles, theme } = useStyles();

  const basic = [
    { label: t('agentName'), placeholder: t('agentNamePlaceholder') },
    { label: t('agentDescription'), placeholder: t('agentDescriptionPlaceholder') },
    { label: t('agentTag'), placeholder: t('agentTagPlaceholder') },
  ];
  return (
    <ChatLayout>
      <Flexbox height={'100vh'} style={{ position: 'relative' }} width={'100%'}>
        {/*header*/}
        <Flexbox
          align={'center'}
          className={styles.header}
          gap={8}
          horizontal
          paddingBlock={8}
          paddingInline={16}
        >
          <ActionIcon
            icon={LucideChevronLeft}
            onClick={() => {
              Router.back();
            }}
            title={'返回'}
          />
          <Flexbox className={styles.title}>{t('editAgentProfile')}</Flexbox>
        </Flexbox>

        {/*form*/}
        <Flexbox className={styles.form} flex={1} gap={10} padding={24}>
          <FormItem label={t('agentPrompt')}>
            <TextArea
              placeholder={t('agentPromptPlaceholder')}
              // style={{ minHeight: 64 }}
              type={'block'}
            />
          </FormItem>

          <Flexbox
            align={'center'}
            distribution={'space-between'}
            horizontal
            paddingBlock={12}
            style={{
              borderBottom: `1px solid ${theme.colorBorder}`,
            }}
          >
            <Flexbox className={styles.profile}> {t('profile')}</Flexbox>
            <Button size={'large'}>{t('autoGenerate')}</Button>
          </Flexbox>
          <Flexbox gap={80} horizontal style={{ marginTop: 16 }}>
            <Flexbox flex={1} gap={24}>
              {basic.map((item) => (
                <FormItem key={item.label} label={item.label}>
                  <Input placeholder={item.placeholder} type={'block'} />
                </FormItem>
              ))}

              <Flexbox className={styles.profile}> {t('advanceSettings')}</Flexbox>

              <FormItem label={t('modelTemperature')}>
                <Slider />
              </FormItem>
            </Flexbox>
            <FormItem label={t('agentAvatar')}>
              <Avatar size={200} />
            </FormItem>
          </Flexbox>
        </Flexbox>

        {/*bottom*/}
        <Flexbox
          className={styles.footer}
          direction={'horizontal-reverse'}
          gap={8}
          padding={'16px 24px'}
        >
          <Button type={'primary'}>{t('updateAgent')}</Button>
          <Button>{t('reset')}</Button>
        </Flexbox>
      </Flexbox>
    </ChatLayout>
  );
});

export default EditPage;

export const getServerSideProps = async (context: any) => ({
  props: await serverSideTranslations(context.locale),
});
