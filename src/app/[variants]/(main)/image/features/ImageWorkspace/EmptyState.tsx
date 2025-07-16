import { memo } from 'react';
import { Center, Flexbox } from 'react-layout-kit';

import PromptInput from '../PromptInput';

const EmptyState = memo(() => {
  return (
    <Flexbox
      flex={1}
      height="100%"
      style={{
        overflow: 'hidden',
        zIndex: 1,
      }}
    >
      <Center flex={1} padding={24}>
        <PromptInput showTitle={true} />
      </Center>
    </Flexbox>
  );
});

export default EmptyState;
