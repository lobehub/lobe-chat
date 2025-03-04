import { ModelIcon } from '@lobehub/icons';
import { createStyles } from 'antd-style';
import { memo } from 'react';
import { Center, Flexbox } from 'react-layout-kit';

import { MessageMetadata } from '@/types/message';

import TokenDetail from './UsageDetail';

export const useStyles = createStyles(({ token, css, cx }) => ({
  container: cx(css`
    font-size: 12px;
    color: ${token.colorTextQuaternary};
  `),
}));

interface UsageProps {
  metadata: MessageMetadata;
  model: string;
  provider: string;
}

const Usage = memo<UsageProps>(({ model, metadata, provider }) => {
  const { styles } = useStyles();

  return (
    <Flexbox align={'center'} className={styles.container} horizontal justify={'space-between'}>
      <Center gap={4} horizontal style={{ fontSize: 12 }}>
        <ModelIcon model={model as string} type={'mono'} />
        {model}
      </Center>

      {!!metadata.totalTokens && (
        <TokenDetail model={model as string} provider={provider} usage={metadata} />
      )}
    </Flexbox>
  );
});

export default Usage;
