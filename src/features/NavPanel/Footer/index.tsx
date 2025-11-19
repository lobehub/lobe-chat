'use client';

import { ActionIcon } from '@lobehub/ui';
import { FlaskConical, Github } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';
import { Link } from 'react-router-dom';

import { GITHUB } from '@/const/url';
import { useGlobalStore } from '@/store/global';
import { systemStatusSelectors } from '@/store/global/selectors';
import { featureFlagsSelectors, useServerConfigStore } from '@/store/serverConfig';

const Footer = memo(() => {
  const expand = useGlobalStore(systemStatusSelectors.showSessionPanel);
  const { t } = useTranslation('common');
  const { hideGitHub } = useServerConfigStore(featureFlagsSelectors);
  if (!expand) return;
  return (
    <Flexbox align={'center'} gap={2} horizontal padding={8}>
      {!hideGitHub && (
        <a aria-label={'GitHub'} href={GITHUB} rel="noopener noreferrer" target={'_blank'}>
          <ActionIcon icon={Github} size={16} title={'GitHub'} />
        </a>
      )}
      <Link aria-label={t('labs')} to={'/labs'}>
        <ActionIcon icon={FlaskConical} size={16} title={t('labs')} />
      </Link>
    </Flexbox>
  );
});

export default Footer;
