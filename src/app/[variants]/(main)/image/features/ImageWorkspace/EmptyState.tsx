import { AuroraBackground } from '@lobehub/ui/awesome';
import { memo } from 'react';
import { Center, Flexbox } from 'react-layout-kit';

import PromptInput from '../PromptInput';

const EmptyState = memo(() => {
  return (
    <>
      <AuroraBackground
        style={{
          height: 400,
          inset: 0,
          overflow: 'hidden',
          pointerEvents: 'none',
          position: 'absolute',
          width: '100%',
          zIndex: 0,
        }}
      />
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
    </>
  );
});

export default EmptyState;
