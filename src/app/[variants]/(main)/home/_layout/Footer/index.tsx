'use client';

import { ActionIcon } from '@lobehub/ui';
import { FlaskConical, Github } from 'lucide-react';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import LabsModal from '@/components/LabsModal';
import { GITHUB } from '@/const/url';
import ThemeButton from '@/features/User/UserPanel/ThemeButton';
import { featureFlagsSelectors, useServerConfigStore } from '@/store/serverConfig';

const Footer = memo(() => {
  const { t } = useTranslation('common');
  const { hideGitHub } = useServerConfigStore(featureFlagsSelectors);
  const [isLabsModalOpen, setIsLabsModalOpen] = useState(false);

  const handleOpenLabsModal = () => {
    setIsLabsModalOpen(true);
  };

  const handleCloseLabsModal = () => {
    setIsLabsModalOpen(false);
  };

  return (
    <>
      <Flexbox align={'center'} gap={2} horizontal justify={'space-between'} padding={8}>
        <Flexbox align={'center'} flex={1} gap={2} horizontal>
          {!hideGitHub && (
            <a aria-label={'GitHub'} href={GITHUB} rel="noopener noreferrer" target={'_blank'}>
              <ActionIcon icon={Github} size={16} title={'GitHub'} />
            </a>
          )}
          <ActionIcon
            aria-label={t('labs')}
            icon={FlaskConical}
            onClick={handleOpenLabsModal}
            size={16}
            title={t('labs')}
          />
        </Flexbox>
        <ThemeButton placement={'top'} size={16} />
      </Flexbox>

      <LabsModal onClose={handleCloseLabsModal} open={isLabsModalOpen} />
    </>
  );
});

export default Footer;
