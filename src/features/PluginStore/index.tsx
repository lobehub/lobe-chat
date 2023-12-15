import { Icon, Modal, SearchBar } from '@lobehub/ui';
import { Button, Empty, Segmented } from 'antd';
import { createStyles } from 'antd-style';
import isEqual from 'fast-deep-equal';
import { ServerCrash } from 'lucide-react';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Center, Flexbox } from 'react-layout-kit';

import MobilePadding from '@/components/MobilePadding';
import { useToolStore } from '@/store/tool';
import { pluginStoreSelectors } from '@/store/tool/selectors';

import Loading from './Loading';
import PluginItem from './PluginItem';

const useStyles = createStyles(({ css, token }) => ({
  header: css`
    color: ${token.colorTextDescription};

    > div {
      flex: 1;
    }
  `,
}));

interface PluginStoreProps {
  open?: boolean;
  setOpen: (open: boolean) => void;
}
export const PluginStore = memo<PluginStoreProps>(({ setOpen, open }) => {
  const [keywords, setKeywords] = useState<string>();
  const { t } = useTranslation('plugin');
  const { styles } = useStyles();
  const [listType, useFetchPluginList, installPlugins] = useToolStore((s) => [
    s.listType,
    s.useFetchPluginStore,
    s.installPlugins,
  ]);

  const pluginStoreList = useToolStore(pluginStoreSelectors.onlinePluginStore, isEqual);
  const { isLoading, error } = useFetchPluginList();
  const isEmpty = pluginStoreList.length === 0;

  return (
    <Modal
      footer={null}
      onCancel={() => {
        setOpen(false);
      }}
      open={open}
      title={t('store.title')}
      width={800}
    >
      <MobilePadding>
        <Center>
          <Flexbox gap={24} width={'100%'}>
            <Flexbox align={'center'} gap={8} horizontal justify={'space-between'}>
              <Segmented
                block
                onChange={(v) => {
                  useToolStore.setState({ listType: v as any });
                }}
                options={[
                  { label: t('store.tabs.all'), value: 'all' },
                  { label: t('store.tabs.installed'), value: 'installed' },
                ]}
                style={{ flex: 1 }}
                value={listType}
              />
            </Flexbox>
            {isLoading ? (
              <Loading />
            ) : isEmpty ? (
              <Center gap={12} padding={40}>
                {error ? (
                  <>
                    <Icon icon={ServerCrash} size={{ fontSize: 80 }} />
                    {t('store.networkError')}
                  </>
                ) : (
                  <Empty
                    description={t('store.empty')}
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  ></Empty>
                )}
              </Center>
            ) : (
              <>
                <Flexbox className={styles.header} gap={8} horizontal>
                  <SearchBar
                    allowClear
                    onChange={(e) => setKeywords(e.target.value)}
                    placeholder={t('store.placeholder')}
                    type={'block'}
                    value={keywords}
                  />
                  {listType === 'all' && (
                    <Button
                      onClick={() => {
                        installPlugins(pluginStoreList.map((item) => item.identifier));
                      }}
                    >
                      {t('store.installAllPlugins')}
                    </Button>
                  )}
                </Flexbox>

                {pluginStoreList
                  .filter((item) =>
                    [item.meta.title, item.meta.description, item.author, ...(item.meta.tags || [])]
                      .join('')
                      .toLowerCase()
                      .includes((keywords || '')?.toLowerCase()),
                  )
                  .map((item) => (
                    <PluginItem key={item.identifier} {...item} />
                  ))}
              </>
            )}
          </Flexbox>
        </Center>
      </MobilePadding>
    </Modal>
  );
});

export default PluginStore;
