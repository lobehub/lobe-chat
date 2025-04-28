import { ActionIcon } from '@lobehub/ui';
import { LibraryBig, LucideLoader2 } from 'lucide-react';
import { Suspense, memo } from 'react';
import { useTranslation } from 'react-i18next';

import TipGuide from '@/components/TipGuide';
import { LOBE_CHAT_CLOUD } from '@/const/branding';
import { isServerMode } from '@/const/version';
import { featureFlagsSelectors, useServerConfigStore } from '@/store/serverConfig';
import { useUserStore } from '@/store/user';
import { preferenceSelectors } from '@/store/user/selectors';

import DropdownMenu from './Dropdown';

const enableKnowledge = isServerMode;

const Knowledge = memo(() => {
  const { t } = useTranslation('chat');

  const { enableKnowledgeBase } = useServerConfigStore(featureFlagsSelectors);

  const [showTip, updateGuideState] = useUserStore((s) => [
    preferenceSelectors.showUploadFileInKnowledgeBaseTip(s),
    s.updateGuideState,
  ]);

  if (!enableKnowledgeBase) {
    return null;
  }

  const icon = (
    <ActionIcon
      disabled={!enableKnowledge}
      icon={LibraryBig}
      title={
        enableKnowledge
          ? t('knowledgeBase.title')
          : t('knowledgeBase.disabled', { cloud: LOBE_CHAT_CLOUD })
      }
      tooltipProps={{
        placement: 'bottom',
      }}
    />
  );

  if (!enableKnowledge) return icon;

  const content = <DropdownMenu>{icon}</DropdownMenu>;

  return (
    <Suspense fallback={<ActionIcon icon={LucideLoader2} spin />}>
      {showTip ? (
        <TipGuide
          onOpenChange={() => {
            updateGuideState({ uploadFileInKnowledgeBase: false });
          }}
          open={showTip}
          placement={'top'}
          title={t('knowledgeBase.uploadGuide')}
        >
          {content}
        </TipGuide>
      ) : (
        content
      )}
    </Suspense>
  );
});

export default Knowledge;
