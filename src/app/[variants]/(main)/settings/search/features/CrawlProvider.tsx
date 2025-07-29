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
          placeholder={t('search.service.crawl.desc')}
        />
      ),
      desc: t('search.service.crawl.desc'),
      label: t('search.service.crawl.title'),
      name: ['search', 'crawlProvider'],
    },
    {
      children: <Input.Password placeholder={t('search.apiKey.placeholder')} />,
      desc: t('search.apiKey.desc'),
      label: t('search.apiKey.title'),
      name: ['search', 'crawlApiKey'],
    },
    {
      children: <Input placeholder={t('search.endpoint.placeholder')} />,
      desc: t('search.endpoint.desc'),
      label: t('search.endpoint.title'),
      name: ['search', 'crawlEndpoint'],
    },
  ];

  const crawlConfigItems: FormItemProps[] = [
    {
      children: <Slider max={120} min={5} step={5} />,
      desc: t('search.crawl.timeout.desc'),
      label: t('search.crawl.timeout.title'),
      name: ['search', 'crawlConfig', 'timeout'],
    },
    {
      children: (
        <Select
          options={[
            { label: 'Markdown', value: 'markdown' },
            { label: 'HTML', value: 'html' },
            { label: t('search.crawl.outputFormat.text'), value: 'text' },
          ]}
        />
      ),
      desc: t('search.crawl.outputFormat.desc'),
      label: t('search.crawl.outputFormat.title'),
      name: ['search', 'crawlConfig', 'outputFormat'],
    },
    {
      children: <Slider max={20_000} min={1000} step={500} />,
      desc: t('search.crawl.maxContentLength.desc'),
      label: t('search.crawl.maxContentLength.title'),
      name: ['search', 'crawlConfig', 'maxContentLength'],
    },
    {
      children: <Switch />,
      desc: t('search.crawl.executeJS.desc'),
      label: t('search.crawl.executeJS.title'),
      name: ['search', 'crawlConfig', 'executeJS'],
      valuePropName: 'checked',
    },
    {
      children: <Switch />,
      desc: t('search.crawl.includeImages.desc'),
      label: t('search.crawl.includeImages.title'),
      name: ['search', 'crawlConfig', 'includeImages'],
      valuePropName: 'checked',
    },
  ];

  const crawlProviderGroup: FormGroupItemType = {
    children: crawlProviderItems,
    title: t('search.service.title'),
  };

  const crawlConfigGroup: FormGroupItemType = {
    children: crawlConfigItems,
    title: t('search.crawl.title'),
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
