import { memo } from 'react';
import { Center } from 'react-layout-kit';

import PromptInput from '../PromptInput';

const EmptyState = memo(() => {
  return (
    <Center height={'calc(100vh - 180px)'}>
      <PromptInput showTitle={true} />
    </Center>
  );
});

export default EmptyState;
