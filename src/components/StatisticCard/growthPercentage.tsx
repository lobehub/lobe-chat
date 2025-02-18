export const calcGrowthPercentage = (currentCount: number, previousCount: number) => {
  if (typeof currentCount !== 'number') return 0;
  return previousCount !== 0
    ? ((currentCount - previousCount) / previousCount) * 100 // 计算增长百分比
    : currentCount > 0
      ? 100
      : 0;
};
