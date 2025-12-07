import { memo, useState } from 'react';
import { Flexbox } from 'react-layout-kit';

import { SCROLL_PARENT_ID } from '@/app/[variants]/(main)/memory/features/TimeLineView/useScrollParent';
import Loading from '@/components/Loading/BrandTextLoading';
import NavHeader from '@/features/NavHeader';
import WideScreenContainer from '@/features/WideScreenContainer';
import WideScreenButton from '@/features/WideScreenContainer/WideScreenButton';
import { useUserMemoryStore } from '@/store/userMemory';

import ViewModeSwitcher, { ViewMode } from '../features/ViewModeSwitcher';
import List from './features/List';

const Contexts = memo(() => {
  const [viewMode, setViewMode] = useState<ViewMode>('masonry');

  const useFetchContexts = useUserMemoryStore((s) => s.useFetchContexts);
  const { data, isLoading } = useFetchContexts();

  if (isLoading) return <Loading debugId={'Contexts'} />;

  return (
    <>
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
          <List data={data || []} viewMode={viewMode} />
        </WideScreenContainer>
      </Flexbox>
    </>
  );
});

export default Contexts;
