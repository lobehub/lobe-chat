import { ActionIcon, Icon } from '@lobehub/ui';
import { Button, Skeleton, Space, Typography } from 'antd';
import { useTheme } from 'antd-style';
import { CircleX, LucideRefreshCcwDot, PlusIcon } from 'lucide-react';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useIsMobile } from '@/hooks/useIsMobile';
import { useAiInfraStore } from '@/store/aiInfra';
import { aiModelSelectors } from '@/store/aiInfra/selectors';

import CreateNewModelModal from '../CreateNewModelModal';
import Search from './Search';

interface ModelFetcherProps {
  provider: string;
}

const ModelTitle = memo<ModelFetcherProps>(({ provider }) => {
  const theme = useTheme();
  const { t } = useTranslation('modelProvider');
  const [
    searchKeyword,
    totalModels,
    isEmpty,
    hasRemoteModels,
    fetchRemoteModelList,
    clearObtainedModels,
    useFetchAiProviderModels,
  ] = useAiInfraStore((s) => [
    s.modelSearchKeyword,
    aiModelSelectors.totalAiProviderModelList(s),
    aiModelSelectors.isEmptyAiProviderModelList(s),
    aiModelSelectors.hasRemoteModels(s),
    s.fetchRemoteModelList,
    s.clearRemoteModels,
    s.useFetchAiProviderModels,
  ]);

  const { isLoading } = useFetchAiProviderModels(provider);

  const [fetchRemoteModelsLoading, setFetchRemoteModelsLoading] = useState(false);
  const [clearRemoteModelsLoading, setClearRemoteModelsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const mobile = useIsMobile();

  return (
    <Flexbox
      gap={12}
      paddingBlock={8}
      style={{
        background: theme.colorBgLayout,
        position: 'sticky',
        top: mobile ? -2 : -16,
        zIndex: 15,
      }}
    >
      <Flexbox align={'center'} gap={0} horizontal justify={'space-between'}>
        <Flexbox align={'center'} gap={8} horizontal>
          <Typography.Text style={{ fontSize: 16, fontWeight: 'bold' }}>
            {t('providerModels.list.title')}
          </Typography.Text>

          {isLoading ? (
            <Skeleton.Button active style={{ height: 22 }} />
          ) : (
            <Typography.Text style={{ fontSize: 12 }} type={'secondary'}>
              <div style={{ display: 'flex', lineHeight: '24px' }}>
                {t('providerModels.list.total', { count: totalModels })}
                {hasRemoteModels && (
                  <ActionIcon
                    icon={CircleX}
                    loading={clearRemoteModelsLoading}
                    onClick={async () => {
                      setClearRemoteModelsLoading(true);
                      await clearObtainedModels(provider);
                      setClearRemoteModelsLoading(false);
                    }}
                    size={'small'}
                    title={t('providerModels.list.fetcher.clear')}
                  />
                )}
              </div>
            </Typography.Text>
          )}
        </Flexbox>
        {isLoading ? (
          <Skeleton.Button active size={'small'} style={{ width: 120 }} />
        ) : isEmpty ? null : (
          <Flexbox gap={8} horizontal>
            {!mobile && (
              <Search
                onChange={(value) => {
                  useAiInfraStore.setState({ modelSearchKeyword: value });
                }}
                value={searchKeyword}
              />
            )}
            <Space.Compact>
              <Button
                icon={<Icon icon={LucideRefreshCcwDot} />}
                loading={fetchRemoteModelsLoading}
                onClick={async () => {
                  setFetchRemoteModelsLoading(true);
                  try {
                    await fetchRemoteModelList(provider);
                  } catch (e) {
                    console.error(e);
                  }
                  setFetchRemoteModelsLoading(false);
                }}
                size={'small'}
              >
                {fetchRemoteModelsLoading
                  ? t('providerModels.list.fetcher.fetching')
                  : t('providerModels.list.fetcher.fetch')}
              </Button>
              <Button
                icon={<Icon icon={PlusIcon} />}
                onClick={() => {
                  setShowModal(true);
                }}
                size={'small'}
              />
              <CreateNewModelModal open={showModal} setOpen={setShowModal} />
            </Space.Compact>
          </Flexbox>
        )}
      </Flexbox>

      {mobile && (
        <Search
          onChange={(value) => {
            useAiInfraStore.setState({ modelSearchKeyword: value });
          }}
          value={searchKeyword}
          variant={'filled'}
        />
      )}
    </Flexbox>
  );
});
export default ModelTitle;
