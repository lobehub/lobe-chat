import { ActionIcon } from '@lobehub/ui';
import { Book, Github } from 'lucide-react';
import Link from 'next/link';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { DOCUMENTS_REFER_URL, GITHUB } from '@/const/url';
import { featureFlagsSelectors, useServerConfigStore } from '@/store/serverConfig';

const BottomActions = memo(() => {
  const { t } = useTranslation('common');
  const { hideGitHub, hideDocs } = useServerConfigStore(featureFlagsSelectors);

  return (
    <>
      {!hideGitHub && (
        <Link aria-label={'GitHub'} href={GITHUB} target={'_blank'}>
          <ActionIcon icon={Github} placement={'right'} title={'GitHub'} />
        </Link>
      )}
      {!hideDocs && (
        <Link aria-label={t('document')} href={DOCUMENTS_REFER_URL} target={'_blank'}>
          <ActionIcon icon={Book} placement={'right'} title={t('document')} />
        </Link>
      )}
    </>
  );
});

export default BottomActions;
