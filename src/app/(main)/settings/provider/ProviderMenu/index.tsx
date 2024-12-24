'use client';

import { ActionIcon, SearchBar } from '@lobehub/ui';
import { Typography } from 'antd';
import { useTheme } from 'antd-style';
import isEqual from 'fast-deep-equal';
import { PlusIcon } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import SearchResult from '@/app/(main)/settings/provider/ProviderMenu/SearchResult';
import { useUserStore } from '@/store/user';
import { modelProviderSelectors } from '@/store/user/selectors';

import All from './All';
import ProviderItem from './Item';

const ProviderMenu = () => {
  const { t } = useTranslation('modelProvider');
  const [searchKeyword, setSearchKeyword] = useState('');
  const theme = useTheme();

  const enabledModelProviderList = useUserStore(
    modelProviderSelectors.enabledModelProviderList,
    isEqual,
  );
  const disabledModelProviderList = useUserStore(
    modelProviderSelectors.disabledModelProviderList,
    isEqual,
  );

  return (
    <Flexbox style={{ minWidth: 280, overflow: 'scroll' }} width={280}>
      <Flexbox
        horizontal
        justify={'space-between'}
        padding={'16px 12px 12px'}
        style={{ background: theme.colorBgLayout, position: 'sticky', top: 0, zIndex: 50 }}
        width={'100%'}
      >
        <SearchBar
          allowClear
          onChange={(e) => setSearchKeyword(e.target.value)}
          placeholder={t('menu.searchProviders')}
          type={'block'}
          value={searchKeyword}
        />
        {/*<ActionIcon icon={PlusIcon} title={'添加自定义服务商'} />*/}
      </Flexbox>
      {!!searchKeyword ? (
        <SearchResult searchKeyword={searchKeyword} />
      ) : (
        <Flexbox gap={4} padding={'0 12px'}>
          <All />
          <Typography.Text style={{ fontSize: 12, marginTop: 8 }} type={'secondary'}>
            已启用
          </Typography.Text>
          {enabledModelProviderList.map((item) => (
            <ProviderItem {...item} key={item.id} />
          ))}
          <Typography.Text style={{ fontSize: 12, marginTop: 8 }} type={'secondary'}>
            未启用
          </Typography.Text>
          {disabledModelProviderList.map((item) => (
            <ProviderItem {...item} key={item.id} />
          ))}
        </Flexbox>
      )}
    </Flexbox>
  );
};

export default ProviderMenu;
