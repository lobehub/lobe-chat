import { ActionIcon, ActionIconProps } from '@lobehub/ui';
import { FlaskConical, Github } from 'lucide-react';
import { memo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { GITHUB } from '@/const/url';
import { featureFlagsSelectors, useServerConfigStore } from '@/store/serverConfig';

const ICON_SIZE: ActionIconProps['size'] = {
  blockSize: 36,
  size: 20,
  strokeWidth: 1.5,
};

const BottomActions = memo(() => {
  const { t } = useTranslation('common');

  const { hideGitHub } = useServerConfigStore(featureFlagsSelectors);

  return (
    <Flexbox gap={8}>
      {!hideGitHub && (
        <a aria-label={'GitHub'} href={GITHUB} rel="noopener noreferrer" target={'_blank'}>
          <ActionIcon
            icon={Github}
            size={ICON_SIZE}
            title={'GitHub'}
            tooltipProps={{ placement: 'right' }}
          />
        </a>
      )}
      <Link aria-label={t('labs')} to={'/labs'}>
        <ActionIcon
          icon={FlaskConical}
          size={ICON_SIZE}
          title={t('labs')}
          tooltipProps={{ placement: 'right' }}
        />
      </Link>
    </Flexbox>
  );
});

export default BottomActions;
