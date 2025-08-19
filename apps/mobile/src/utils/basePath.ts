// Mobile端不需要复杂的basePath处理，直接返回原始路径
export const withBasePath = (path: string): string => {
  return `http://localhost:3020${path}`;
};
