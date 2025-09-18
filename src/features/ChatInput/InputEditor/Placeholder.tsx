import { KeyEnum } from '@lobechat/types';
import { Hotkey, combineKeys } from '@lobehub/ui';
import { memo } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { useUserStore } from '@/store/user';
import { preferenceSelectors } from '@/store/user/selectors';

const Placeholder = memo(() => {
  const { t } = useTranslation(['editor', 'chat']);

  const useCmdEnterToSend = useUserStore(preferenceSelectors.useCmdEnterToSend);
  const wrapperShortcut = useCmdEnterToSend
    ? KeyEnum.Enter
    : combineKeys([KeyEnum.Mod, KeyEnum.Enter]);

  return (
    <Flexbox align={'center'} as={'span'} gap={4} horizontal>
      {t('sendPlaceholder', { ns: 'chat' }).replace('...', ', ')}
      <Trans
        as={'span'}
        components={{
          key: (
            <Hotkey
              as={'span'}
              keys={wrapperShortcut}
              style={{ color: 'inherit' }}
              styles={{ kbdStyle: { color: 'inhert' } }}
              variant={'borderless'}
            />
          ),
        }}
        i18nKey={'input.warpWithKey'}
        ns={'chat'}
      />
      {'...'}
    </Flexbox>
  );
});

export default Placeholder;
