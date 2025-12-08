import { memo, useState } from 'react';
import { Flexbox } from 'react-layout-kit';

import { SCROLL_PARENT_ID } from '@/app/[variants]/(main)/memory/features/TimeLineView/useScrollParent';
import Loading from '@/components/Loading/BrandTextLoading';
import NavHeader from '@/features/NavHeader';
import WideScreenContainer from '@/features/WideScreenContainer';
import WideScreenButton from '@/features/WideScreenContainer/WideScreenButton';
import { useUserMemoryStore } from '@/store/userMemory';

import ViewModeSwitcher, { ViewMode } from '../features/ViewModeSwitcher';
import ContextRightPanel from './features/ContextRightPanel';
import List from './features/List';

const ContextsArea = memo(() => {
  const [viewMode, setViewMode] = useState<ViewMode>('masonry');
  const useFetchContexts = useUserMemoryStore((s) => s.useFetchContexts);
  const contextsInit = useUserMemoryStore((s) => s.contextsInit);

  useFetchContexts();

  if (!contextsInit) return <Loading debugId={'Contexts'} />;

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

const Contexts = memo(() => {
  return (
    <Flexbox height={'100%'} horizontal width={'100%'}>
      <ContextsArea />
      <ContextRightPanel />
    </Flexbox>
  );
});

export default Contexts;
