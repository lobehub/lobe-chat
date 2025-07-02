import { memo } from 'react';
import { Center, Flexbox } from 'react-layout-kit';

import PromptInput from '@/app/[variants]/(main)/image/features/PromptInput';

const EmptyLayout = memo(() => {
  return (
    <Flexbox
      flex={1}
      height="100%"
      style={{
        overflow: 'hidden',
      }}
    >
      <Center flex={1} padding={24}>
        <PromptInput showTitle={true} />
      </Center>
    </Flexbox>
  );
});

export default EmptyLayout;
