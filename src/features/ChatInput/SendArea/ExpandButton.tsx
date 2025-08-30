import { ActionIcon } from '@lobehub/ui';
import { Maximize2Icon, Minimize2Icon } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import { useChatInput } from '../hooks/useChatInput';

const ExpandButton = memo(() => {
  const { t } = useTranslation('editor');
  const { expand, setExpand } = useChatInput();
  return (
    <ActionIcon
      className="show-on-hover"
      icon={expand ? Minimize2Icon : Maximize2Icon}
      onClick={() => setExpand?.(!expand)}
      size={{ blockSize: 32, size: 16, strokeWidth: 2.3 }}
      title={t(expand ? 'actions.expand.off' : 'actions.expand.on')}
    />
  );
});

ExpandButton.displayName = 'ExpandButton';

export default ExpandButton;
