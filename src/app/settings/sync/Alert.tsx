'use client';

import { Alert } from '@lobehub/ui';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { MAX_WIDTH } from '@/const/layoutTokens';
import { useGlobalStore } from '@/store/global';
import { preferenceSelectors } from '@/store/global/selectors';

const ExperimentAlert = () => {
  const { t } = useTranslation('setting');
  const [showSyncAlert, updatePreference] = useGlobalStore((s) => [
    preferenceSelectors.showSyncAlert(s),
    s.updatePreference,
  ]);
  return (
    showSyncAlert && (
      <Flexbox style={{ maxWidth: MAX_WIDTH }} width={'100%'}>
        <Alert
          closable
          message={t('sync.warning.message')}
          onClose={() => {
            updatePreference({ showSyncAlert: false });
          }}
          type={'warning'}
        />
      </Flexbox>
    )
  );
};

export default ExperimentAlert;
