import { PropsWithChildren, memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import ResponsiveSessionList from './SessionList';

export default memo(({ children }: PropsWithChildren) => {
  return (
    <>
      <ResponsiveSessionList />
      <Flexbox
        flex={1}
        height={'100%'}
        id={'lobe-conversion-container'}
        style={{ position: 'relative' }}
      >
        {children}
      </Flexbox>
    </>
  );
});
