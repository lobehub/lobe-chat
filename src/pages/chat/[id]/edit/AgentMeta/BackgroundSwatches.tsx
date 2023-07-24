import { Swatches, primaryColorsSwatches } from '@lobehub/ui';
import { memo } from 'react';
import { shallow } from 'zustand/shallow';

import { DEFAULT_BACKGROUND_COLOR } from '@/const/meta';
import { agentSelectors, useSessionStore } from '@/store/session';

const BackgroundSwatches = memo(() => {
  const [backgroundColor, updateAgentMeta] = useSessionStore(
    (s) => [agentSelectors.currentAgentBackgroundColor(s), s.updateAgentMeta],
    shallow,
  );

  const handleSelect = (v: any) => {
    if (v) {
      updateAgentMeta({ backgroundColor: v });
    } else {
      updateAgentMeta({ backgroundColor: DEFAULT_BACKGROUND_COLOR });
    }
  };

  return (
    <Swatches
      activeColor={backgroundColor}
      colors={primaryColorsSwatches}
      onSelect={handleSelect}
    />
  );
});

export default BackgroundSwatches;
