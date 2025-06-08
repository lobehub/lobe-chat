'use client';

import { Form, type FormGroupItemType, type FormItemProps } from '@lobehub/ui';
import { Input, Select, Skeleton, Slider, Switch } from 'antd';
import isEqual from 'fast-deep-equal';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { FORM_STYLE } from '@/const/layoutTokens';
import { useUserStore } from '@/store/user';
import { settingsSelectors } from '@/store/user/selectors';

import { crawlProviders } from '../constants';

const CrawlProvider = memo(() => {
  const { t } = useTranslation('setting');
  const [form] = Form.useForm();

  const settings = useUserStore(settingsSelectors.currentSettings, isEqual);
  const [setSettings, isUserStateInit] = useUserStore((s) => [s.setSettings, s.isUserStateInit]);

  if (!isUserStateInit) return <Skeleton active paragraph={{ rows: 5 }} title={false} />;

  const crawlProviderItems: FormItemProps[] = [
    {
      children: (
        <Select
          options={crawlProviders.map((provider) => ({
            label: provider.name,
            value: provider.id,
          }))}
          placeholder={t('search.crawl.provider.placeholder')}
        />
      ),
      desc: t('search.crawl.provider.desc'),
      label: t('search.crawl.provider.title'),
      name: 'crawlProvider',
    },
    {
      children: <Input.Password placeholder={t('search.crawl.apiKey.placeholder')} />,
      desc: t('search.crawl.apiKey.desc'),
      label: t('search.crawl.apiKey.title'),
      name: 'crawlApiKey',
    },
    {
      children: <Input placeholder={t('search.crawl.endpoint.placeholder')} />,
      desc: t('search.crawl.endpoint.desc'),
      label: t('search.crawl.endpoint.title'),
      name: 'crawlEndpoint',
    },
  ];

  const crawlConfigItems: FormItemProps[] = [
    {
      children: <Slider max={120} min={5} step={5} />,
      desc: t('search.crawl.config.timeout.desc'),
      label: t('search.crawl.config.timeout.title'),
      name: ['crawlConfig', 'timeout'],
    },
    {
      children: (
        <Select
          options={[
            { label: 'Markdown', value: 'markdown' },
            { label: 'HTML', value: 'html' },
            { label: t('search.crawl.config.outputFormat.text'), value: 'text' },
          ]}
        />
      ),
      desc: t('search.crawl.config.outputFormat.desc'),
      label: t('search.crawl.config.outputFormat.title'),
      name: ['crawlConfig', 'outputFormat'],
    },
    {
      children: <Slider max={20_000} min={1000} step={500} />,
      desc: t('search.crawl.config.maxContentLength.desc'),
      label: t('search.crawl.config.maxContentLength.title'),
      name: ['crawlConfig', 'maxContentLength'],
    },
    {
      children: <Switch />,
      desc: t('search.crawl.config.executeJS.desc'),
      label: t('search.crawl.config.executeJS.title'),
      name: ['crawlConfig', 'executeJS'],
      valuePropName: 'checked',
    },
    {
      children: <Switch />,
      desc: t('search.crawl.config.includeImages.desc'),
      label: t('search.crawl.config.includeImages.title'),
      name: ['crawlConfig', 'includeImages'],
      valuePropName: 'checked',
    },
  ];

  const crawlProviderGroup: FormGroupItemType = {
    children: crawlProviderItems,
    title: t('search.crawl.provider.group'),
  };

  const crawlConfigGroup: FormGroupItemType = {
    children: crawlConfigItems,
    title: t('search.crawl.config.group'),
  };

  return (
    <Form
      form={form}
      initialValues={settings}
      items={[crawlProviderGroup, crawlConfigGroup]}
      itemsType={'group'}
      onValuesChange={setSettings}
      variant={'borderless'}
      {...FORM_STYLE}
    />
  );
});

CrawlProvider.displayName = 'CrawlProvider';

export default CrawlProvider;
