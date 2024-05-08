import SkeletonLoading from '@/components/SkeletonLoading';

export default () => {
  return (
    <div style={{ flex: 1 }}>
      <SkeletonLoading paragraph={{ rows: 8 }} title={false} />
    </div>
  );
};
