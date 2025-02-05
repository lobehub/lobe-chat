import { memo } from 'react';

import OllamaSetupGuide from '@/components/OllamaSetupGuide';
import { ErrorActionContainer } from '@/features/Conversation/Error/style';

const SetupGuide = memo(() => {
  return (
    <ErrorActionContainer style={{ paddingBlock: 0 }}>
      <OllamaSetupGuide />
    </ErrorActionContainer>
  );
});

export default SetupGuide;
