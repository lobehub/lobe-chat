const getWorker = () => {
  // Disable workers in React Native environment
  // Always return null for now to avoid bundling issues
  return null;
};

export const clientEncodeAsync = (str: string): Promise<number> =>
  new Promise((resolve) => {
    const worker = getWorker();

    if (!worker) {
      resolve(str.length);
      return;
    }
  });
