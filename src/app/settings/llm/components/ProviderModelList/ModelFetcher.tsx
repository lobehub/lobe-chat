import { Icon, Tooltip } from '@lobehub/ui';
import { Typography } from 'antd';
import { createStyles } from 'antd-style';
import dayjs from 'dayjs';
import { LucideLoaderCircle, LucideRefreshCcwDot } from 'lucide-react';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import { useGlobalStore } from '@/store/global';
import { modelConfigSelectors } from '@/store/global/selectors';
import { GlobalLLMProviderKey } from '@/types/settings';

const useStyles = createStyles(({ css, token }) => ({
  hover: css`
    cursor: pointer;
    padding: 4px 8px;
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
  const [useFetchProviderModelList] = useGlobalStore((s) => [
    s.useFetchProviderModelList,
    s.setModelProviderConfig,
  ]);
  const enabledAutoFetch = useGlobalStore(modelConfigSelectors.enabledAutoFetchModels(provider));
  const latestFetchTime = useGlobalStore(
    (s) => modelConfigSelectors.providerConfig(provider)(s)?.latestFetchTime,
  );
  const totalModels = useGlobalStore(
    (s) => modelConfigSelectors.providerModelCards(provider)(s).length,
  );

  const { mutate, isValidating } = useFetchProviderModelList(provider, enabledAutoFetch);

  return (
    <Typography.Text style={{ fontSize: 12 }} type={'secondary'}>
      <Flexbox align={'center'} gap={0} horizontal justify={'space-between'}>
        <div>共 {totalModels} 个模型可用</div>
        <Tooltip title={`上次更新时间：${dayjs(latestFetchTime).format('MM-DD HH:mm:ss')}`}>
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
            <div>{isValidating ? '正在获取模型列表...' : '获取模型列表'}</div>
          </Flexbox>
        </Tooltip>
      </Flexbox>
    </Typography.Text>
  );
});
export default ModelFetcher;
