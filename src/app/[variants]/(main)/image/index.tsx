'use client';

import { Suspense, memo } from 'react';
import { Flexbox } from 'react-layout-kit';

import WideScreenButton from '@/app/[variants]/(main)/chat/features/WideScreenButton';
import WideScreenContainer from '@/features/Conversation/components/WideScreenContainer';
import NavHeader from '@/features/NavHeader';

import ImageWorkspace from './features/ImageWorkspace';
import SkeletonList from './features/ImageWorkspace/SkeletonList';

const DesktopImagePage = memo(() => {
  return (
    <>
      <NavHeader right={<WideScreenButton />} />
      <Flexbox height={'100%'} style={{ overflowY: 'auto', position: 'relative' }} width={'100%'}>
        <WideScreenContainer>
          <Suspense fallback={<SkeletonList />}>
            <ImageWorkspace />
          </Suspense>
        </WideScreenContainer>
      </Flexbox>
    </>
  );
});

DesktopImagePage.displayName = 'DesktopImagePage';

export default DesktopImagePage;
