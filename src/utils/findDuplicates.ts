export const findDuplicates = (arr: string[]): string[] => {
  const duplicates: { [key: string]: number } = {};

  // 统计每个项目出现的次数
  for (const item of arr) {
    if (duplicates[item]) {
      duplicates[item]++;
    } else {
      duplicates[item] = 1;
    }
  }

  // 挑出重复出现 3 次以上的项目
  const COUNT = 3;

  const result = Object.keys(duplicates).filter((item) => duplicates[item] >= COUNT);

  // 按重复次数从多到少排序
  result.sort((a, b) => duplicates[b] - duplicates[a]);

  return result;
};
