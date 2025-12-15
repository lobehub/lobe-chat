import { memo, useState } from 'react';
import { Flexbox } from 'react-layout-kit';

import { SCROLL_PARENT_ID } from '@/app/[variants]/(main)/memory/features/TimeLineView/useScrollParent';
import Loading from '@/components/Loading/BrandTextLoading';
import NavHeader from '@/features/NavHeader';
import WideScreenContainer from '@/features/WideScreenContainer';
import WideScreenButton from '@/features/WideScreenContainer/WideScreenButton';
import { useUserMemoryStore } from '@/store/userMemory';

import ViewModeSwitcher, { ViewMode } from '../features/ViewModeSwitcher';
import ExperienceRightPanel from './features/ExperienceRightPanel';
import List from './features/List';

const ExperiencesArea = memo(() => {
  const [viewMode, setViewMode] = useState<ViewMode>('timeline');
  const useFetchExperiences = useUserMemoryStore((s) => s.useFetchExperiences);
  const experiencesInit = useUserMemoryStore((s) => s.experiencesInit);

  useFetchExperiences();

  if (!experiencesInit) return <Loading debugId={'Experiences'} />;

  return (
    <Flexbox flex={1} height={'100%'}>
      <NavHeader
        right={
          <>
            <ViewModeSwitcher onChange={setViewMode} value={viewMode} />
            <WideScreenButton />
          </>
        }
      />
      <Flexbox
        height={'100%'}
        id={SCROLL_PARENT_ID}
        style={{ overflowY: 'auto', paddingBottom: '16vh' }}
        width={'100%'}
      >
        <WideScreenContainer gap={32} paddingBlock={48}>
          <List viewMode={viewMode} />
        </WideScreenContainer>
      </Flexbox>
    </Flexbox>
  );
});

const Experiences = memo(() => {
  return (
    <Flexbox height={'100%'} horizontal width={'100%'}>
      <ExperiencesArea />
      <ExperienceRightPanel />
    </Flexbox>
  );
});

export default Experiences;
