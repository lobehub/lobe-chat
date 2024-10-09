import { Icon, Tooltip } from '@lobehub/ui';
import { Typography } from 'antd';
import { createStyles } from 'antd-style';
import dayjs from 'dayjs';
import { CircleX, LucideLoaderCircle, LucideRefreshCcwDot } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useUserStore } from '@/store/user';
import {
  modelConfigSelectors,
  modelProviderSelectors,
  settingsSelectors,
} from '@/store/user/selectors';
import { GlobalLLMProviderKey } from '@/types/user/settings';

const useStyles = createStyles(({ css, token }) => ({
  buttons: css`
    display: flex;
  `,

  hover: css`
    cursor: pointer;

    padding-block: 4px;
    padding-inline: 8px;

    border-radius: ${token.borderRadius}px;

    transition: all 0.2s ease-in-out;

    &:hover {
      color: ${token.colorText};
      background-color: ${token.colorFillSecondary};
    }
  `,
}));

interface ModelFetcherProps {
  provider: GlobalLLMProviderKey;
}

const ModelFetcher = memo<ModelFetcherProps>(({ provider }) => {
  const { styles } = useStyles();
  const { t } = useTranslation('setting');
  const [useFetchProviderModelList, clearObtainedModels] = useUserStore((s) => [
    s.useFetchProviderModelList,
    s.clearObtainedModels,
    s.setModelProviderConfig,
  ]);
  const enabledAutoFetch = useUserStore(modelConfigSelectors.isAutoFetchModelsEnabled(provider));
  const latestFetchTime = useUserStore(
    (s) => settingsSelectors.providerConfig(provider)(s)?.latestFetchTime,
  );
  const totalModels = useUserStore(
    (s) => modelProviderSelectors.getModelCardsById(provider)(s).length,
  );

  const remoteModels = useUserStore((s) =>
    modelProviderSelectors.remoteProviderModelCards(provider)(s),
  );

  const { mutate, isValidating } = useFetchProviderModelList(provider, enabledAutoFetch);

  return (
    <Typography.Text style={{ fontSize: 12 }} type={'secondary'}>
      <Flexbox align={'center'} gap={0} horizontal justify={'space-between'}>
        <div>{t('llm.modelList.total', { count: totalModels })}</div>
        <div className={styles.buttons}>
          <Tooltip
            overlayStyle={{ pointerEvents: 'none' }}
            title={
              latestFetchTime
                ? t('llm.fetcher.latestTime', {
                    time: dayjs(latestFetchTime).format('YYYY-MM-DD HH:mm:ss'),
                  })
                : t('llm.fetcher.noLatestTime')
            }
          >
            <Flexbox
              align={'center'}
              className={styles.hover}
              gap={4}
              horizontal
              onClick={() => mutate()}
            >
              <Icon
                icon={isValidating ? LucideLoaderCircle : LucideRefreshCcwDot}
                size={'small'}
                spin={isValidating}
              />
              <div>{isValidating ? t('llm.fetcher.fetching') : t('llm.fetcher.fetch')}</div>
            </Flexbox>
          </Tooltip>
          {remoteModels && remoteModels.length > 0 && (
            <Flexbox
              align={'center'}
              className={styles.hover}
              gap={4}
              horizontal
              onClick={() => clearObtainedModels(provider)}
            >
              <Icon icon={CircleX} size={'small'} />
              <div>{t('llm.fetcher.clear')}</div>
            </Flexbox>
          )}
        </div>
      </Flexbox>
    </Typography.Text>
  );
});
export default ModelFetcher;
