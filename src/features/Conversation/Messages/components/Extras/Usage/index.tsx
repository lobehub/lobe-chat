import { ModelPerformance, ModelUsage } from '@lobechat/types';
import { ModelIcon } from '@lobehub/icons';
import { createStyles } from 'antd-style';
import isEqual from 'fast-deep-equal';
import { memo } from 'react';
import { Center, Flexbox } from 'react-layout-kit';

import TokenDetail from './UsageDetail';

export const useStyles = createStyles(({ token, css, cx }) => ({
  container: cx(css`
    font-size: 12px;
    color: ${token.colorTextQuaternary};
  `),
}));

interface UsageProps {
  model: string;
  performance?: ModelPerformance;
  provider: string;
  usage?: ModelUsage;
}

const Usage = memo<UsageProps>(({ model, usage, performance, provider }) => {
  const { styles } = useStyles();

  return (
    <Flexbox
      align={'center'}
      className={styles.container}
      gap={12}
      horizontal
      justify={'space-between'}
    >
      <Center gap={4} horizontal style={{ fontSize: 12 }}>
        <ModelIcon model={model as string} type={'mono'} />
        {model}
      </Center>

      {!!usage?.totalTokens && (
        <TokenDetail
          model={model as string}
          performance={performance}
          provider={provider}
          usage={usage}
        />
      )}
    </Flexbox>
  );
}, isEqual);

export default Usage;
