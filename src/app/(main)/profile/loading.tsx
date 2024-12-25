import { Flexbox } from 'react-layout-kit';

import SkeletonLoading from '@/components/Loading/SkeletonLoading';
import { isMobileDevice } from '@/utils/server/responsive';

const Loading = async () => {
  const mobile = await isMobileDevice();
  if (mobile) return <SkeletonLoading paragraph={{ rows: 8 }} />;
  return (
    <Flexbox horizontal style={{ position: 'relative' }} width={'100%'}>
      <Flexbox padding={24} width={256}>
        <SkeletonLoading paragraph={{ rows: 8 }} />;
      </Flexbox>
      <Flexbox align={'center'} flex={1}>
        <Flexbox padding={24} style={{ maxWidth: 1024 }} width={'100%'}>
          <SkeletonLoading paragraph={{ rows: 8 }} />;
        </Flexbox>
      </Flexbox>
    </Flexbox>
  );
};

export default Loading;
