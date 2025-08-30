import { TypeIcon } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { useChatInput } from '../../hooks/useChatInput';
import Action from '../components/Action';

const Typo = memo(() => {
  const { t } = useTranslation('editor');
  const { showTypoBar, setShowTypoBar } = useChatInput();

  return (
    <Action
      active={showTypoBar}
      icon={TypeIcon}
      onClick={() => setShowTypoBar?.(!showTypoBar)}
      title={t(showTypoBar ? 'actions.typobar.off' : 'actions.typobar.on')}
    />
  );
});

export default Typo;
