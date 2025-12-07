import { memo, useState } from 'react';
import { Flexbox } from 'react-layout-kit';

import Loading from '@/components/Loading/BrandTextLoading';
import NavHeader from '@/features/NavHeader';
import WideScreenContainer from '@/features/WideScreenContainer';
import WideScreenButton from '@/features/WideScreenContainer/WideScreenButton';
import { useUserMemoryStore } from '@/store/userMemory';

import ViewModeSwitcher, { ViewMode } from '../features/ViewModeSwitcher';
import List from './features/List';

const Experiences = memo(() => {
  const [viewMode, setViewMode] = useState<ViewMode>('masonry');

  const useFetchExperiences = useUserMemoryStore((s) => s.useFetchExperiences);
  const { data, isLoading } = useFetchExperiences();

  if (isLoading) return <Loading debugId={'Experiences'} />;

  return (
    <>
      <NavHeader
        right={
          <>
            <WideScreenButton />
            <ViewModeSwitcher onChange={setViewMode} value={viewMode} />
          </>
        }
      />
      <Flexbox height={'100%'} style={{ overflowY: 'auto', paddingBottom: '16vh' }} width={'100%'}>
        <WideScreenContainer gap={32} paddingBlock={48}>
          <List data={data || []} viewMode={viewMode} />
        </WideScreenContainer>
      </Flexbox>
    </>
  );
});

export default Experiences;
