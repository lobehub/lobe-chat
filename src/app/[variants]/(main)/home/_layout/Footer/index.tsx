'use client';

import { ActionIcon, Dropdown, Icon, type MenuProps } from '@lobehub/ui';
import { DiscordIcon } from '@lobehub/ui/icons';
import { Book, CircleHelp, Feather, FileClockIcon, FlaskConical, Github, Mail } from 'lucide-react';
import { memo, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import ChangelogModal from '@/components/ChangelogModal';
import LabsModal from '@/components/LabsModal';
import { BRANDING_EMAIL, SOCIAL_URL } from '@/const/branding';
import { DOCUMENTS_REFER_URL, GITHUB, GITHUB_ISSUES, mailTo } from '@/const/url';
import ThemeButton from '@/features/User/UserPanel/ThemeButton';
import { featureFlagsSelectors, useServerConfigStore } from '@/store/serverConfig';

const Footer = memo(() => {
  const { t } = useTranslation('common');
  const { hideGitHub } = useServerConfigStore(featureFlagsSelectors);
  const [isLabsModalOpen, setIsLabsModalOpen] = useState(false);
  const [isChangelogModalOpen, setIsChangelogModalOpen] = useState(false);

  const handleOpenLabsModal = () => {
    setIsLabsModalOpen(true);
  };

  const handleCloseLabsModal = () => {
    setIsLabsModalOpen(false);
  };

  const handleOpenChangelogModal = () => {
    setIsChangelogModalOpen(true);
  };

  const handleCloseChangelogModal = () => {
    setIsChangelogModalOpen(false);
  };

  const helpMenuItems: MenuProps['items'] = useMemo(
    () => [
      {
        icon: <Icon icon={Book} />,
        key: 'docs',
        label: (
          <a href={DOCUMENTS_REFER_URL} rel="noopener noreferrer" target="_blank">
            {t('userPanel.docs')}
          </a>
        ),
      },
      {
        icon: <Icon icon={Feather} />,
        key: 'feedback',
        label: (
          <a href={GITHUB_ISSUES} rel="noopener noreferrer" target="_blank">
            {t('userPanel.feedback')}
          </a>
        ),
      },
      {
        icon: <Icon icon={DiscordIcon} />,
        key: 'discord',
        label: (
          <a href={SOCIAL_URL.discord} rel="noopener noreferrer" target="_blank">
            {t('userPanel.discord')}
          </a>
        ),
      },
      {
        icon: <Icon icon={Mail} />,
        key: 'email',
        label: (
          <a href={mailTo(BRANDING_EMAIL.support)} rel="noopener noreferrer" target="_blank">
            {t('userPanel.email')}
          </a>
        ),
      },
      {
        type: 'divider',
      },
      {
        icon: <Icon icon={FileClockIcon} />,
        key: 'changelog',
        label: t('changelog'),
        onClick: handleOpenChangelogModal,
      },
      {
        icon: <Icon icon={FlaskConical} />,
        key: 'labs',
        label: t('labs'),
        onClick: handleOpenLabsModal,
      },
    ],
    [t],
  );

  return (
    <>
      <Flexbox align={'center'} gap={2} horizontal justify={'space-between'} padding={8}>
        <Flexbox align={'center'} flex={1} gap={2} horizontal>
          <Dropdown
            menu={{
              items: helpMenuItems,
            }}
            placement="topLeft"
            trigger={['click']}
          >
            <ActionIcon aria-label={t('userPanel.help')} icon={CircleHelp} size={16} />
          </Dropdown>
          {!hideGitHub && (
            <a aria-label={'GitHub'} href={GITHUB} rel="noopener noreferrer" target={'_blank'}>
              <ActionIcon icon={Github} size={16} title={'GitHub'} />
            </a>
          )}
        </Flexbox>
        <ThemeButton placement={'top'} size={16} />
      </Flexbox>
      <LabsModal onClose={handleCloseLabsModal} open={isLabsModalOpen} />
      <ChangelogModal onClose={handleCloseChangelogModal} open={isChangelogModalOpen} />
    </>
  );
});

export default Footer;
