import { ActionIcon, Icon } from '@lobehub/ui';
import { Loader2, Share2 } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { useSessionStore } from '@/store/session';

const ShareButton = memo(() => {
  const { t } = useTranslation('common');

  const [shareLoading, shareToShareGPT] = useSessionStore((s) => [
    s.shareLoading,

    s.shareToShareGPT,
  ]);

  return shareLoading ? (
    <Icon icon={Loader2} size={{ fontSize: 24 }} spin />
  ) : (
    <ActionIcon
      icon={Share2}
      onClick={shareToShareGPT}
      size={{ fontSize: 24 }}
      title={t('share')}
    />
  );
});

export default ShareButton;
