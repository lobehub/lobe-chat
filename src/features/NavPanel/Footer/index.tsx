'use client';

import { ActionIcon } from '@lobehub/ui';
import { FlaskConical, Github, LibraryBigIcon } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';
import { Link } from 'react-router-dom';

import { GITHUB } from '@/const/url';
import { featureFlagsSelectors, useServerConfigStore } from '@/store/serverConfig';

const Footer = memo(() => {
  const { t } = useTranslation('common');
  const { hideGitHub } = useServerConfigStore(featureFlagsSelectors);
  const pathname = usePathname();
  const isInResources = pathname.startsWith('/resource');
  return (
    <Flexbox align={'center'} gap={2} horizontal justify={'space-between'} padding={8}>
      <Flexbox align={'center'} flex={1} gap={2} horizontal>
        {!hideGitHub && (
          <a aria-label={'GitHub'} href={GITHUB} rel="noopener noreferrer" target={'_blank'}>
            <ActionIcon icon={Github} size={16} title={'GitHub'} />
          </a>
        )}
        <Link aria-label={t('labs')} to={'/labs'}>
          <ActionIcon icon={FlaskConical} size={16} title={t('labs')} />
        </Link>
      </Flexbox>
      <Flexbox>
        {!isInResources && (
          <Link aria-label={t('tab.resource')} to={'/resource'}>
            <ActionIcon icon={LibraryBigIcon} size={16} title={t('tab.resource')} />
          </Link>
        )}
      </Flexbox>
    </Flexbox>
  );
});

export default Footer;
