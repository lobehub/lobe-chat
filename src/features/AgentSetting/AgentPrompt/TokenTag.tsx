import { TokenTag } from '@lobehub/ui';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useTokenCount } from '@/hooks/useTokenCount';
import { useGlobalStore } from '@/store/global';
import { modelProviderSelectors } from '@/store/global/selectors';

import { useStore } from '../store';

const Tokens = memo(() => {
  const { t } = useTranslation('chat');
  const [systemRole, model] = useStore((s) => [s.config.systemRole, s.config.model]);
  const systemTokenCount = useTokenCount(systemRole);

  const showTag = useGlobalStore(modelProviderSelectors.isModelHasMaxToken(model));
  const modelMaxTokens = useGlobalStore(modelProviderSelectors.modelMaxToken(model));

  return (
    <Flexbox align={'center'} gap={8} horizontal>
      {showTag && (
        <TokenTag
          displayMode={'used'}
          maxValue={modelMaxTokens}
          shape={'square'}
          text={{
            overload: t('tokenTag.overload'),
            remained: t('tokenTag.remained'),
            used: t('tokenTag.used'),
          }}
          value={systemTokenCount}
        />
      )}
    </Flexbox>
  );
});

export default Tokens;
