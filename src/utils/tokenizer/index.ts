export const encodeAsync = async (str: string): Promise<number> => {
  if (str.length === 0) return 0;

  // 50_000 is the limit of the client
  // if the string is longer than 100_000, we will use the server
  if (str.length <= 50_000) {
    const { clientEncodeAsync } = await import('./client');

    return await clientEncodeAsync(str);
  } else {
    const { serverEncodeAsync } = await import('./server');

    return await serverEncodeAsync(str);
  }
};
