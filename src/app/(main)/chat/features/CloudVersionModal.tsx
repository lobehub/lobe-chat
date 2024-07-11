'use client';

import Image from 'next/image';
import { memo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import GuideModal from '@/components/GuideModal';
import { OFFICIAL_URL } from '@/const/url';
import { useUserStore } from '@/store/user';
import { isOnServerSide } from '@/utils/env';

// TODO: Add feature flag
const CloudVersionModal = memo(() => {
  const [open, setOpen] = useState(true);
  const hidePublicTestGuide = useUserStore((s) => s.preference.guide?.publicTest);
  const updateGuideState = useUserStore((s) => s.updateGuideState);
  const { t } = useTranslation('common');
  if (!hidePublicTestGuide) return;

  return (
    <GuideModal
      cancelText={t('footer.later')}
      cover={
        <Image
          alt={'LobeChat Cloud Public Beta'}
          height={720}
          src={'/images/public_beta.webp'}
          style={{ height: 'auto', width: '100%' }}
          width={1024}
        />
      }
      desc={t('footer.publicTest.desc', { name: 'LobeChat Cloud' })}
      okText={t('footer.publicTest.action')}
      onCancel={() => {
        setOpen(false);
        updateGuideState({ publicTest: false });
      }}
      onOk={() => {
        if (isOnServerSide) return;
        window.open(OFFICIAL_URL, '__blank');
        updateGuideState({ publicTest: false });
      }}
      open={open}
      title={t('footer.publicTest.title', { name: 'LobeChat Cloud' })}
      width={512}
    />
  );
});

export default CloudVersionModal;
