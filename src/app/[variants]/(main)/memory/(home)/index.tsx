import { Empty } from 'antd';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Flexbox } from 'react-layout-kit';

import { SCROLL_PARENT_ID } from '@/app/[variants]/(main)/memory/features/TimeLineView/useScrollParent';
import Loading from '@/components/Loading/BrandTextLoading';
import NavHeader from '@/features/NavHeader';
import WideScreenContainer from '@/features/WideScreenContainer';
import WideScreenButton from '@/features/WideScreenContainer/WideScreenButton';
import { useUserMemoryStore } from '@/store/userMemory';

import RoleTagCloud from './features/RoleTagCloud';

const Home = memo(() => {
  const { t } = useTranslation('memory');

  const useFetchTags = useUserMemoryStore((s) => s.useFetchTags);
  const { data, isLoading } = useFetchTags();

  if (isLoading) return <Loading debugId={'Home'} />;

  if (!data || data.length === 0) {
    return <Empty description={t('identity.empty')} />;
  }

  return (
    <Flexbox flex={1} height={'100%'}>
      <NavHeader right={<WideScreenButton />} />
      <Flexbox
        height={'100%'}
        id={SCROLL_PARENT_ID}
        style={{ overflowY: 'auto', paddingBottom: '16vh' }}
        width={'100%'}
      >
        <WideScreenContainer gap={32} paddingBlock={48}>
          <RoleTagCloud tags={data} />
        </WideScreenContainer>
      </Flexbox>
    </Flexbox>
  );
});

export default Home;
