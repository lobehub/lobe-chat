export const encodeAsync = async (str: string): Promise<number> => {
  if (str.length === 0) return 0;

  // 30_000 is the limit of the client
  // if the string is longer than 30_000, we will use the server
  if (str.length <= 30_000) {
    const { clientEncodeAsync } = await import('./client');

    return await clientEncodeAsync(str);
  } else {
    const { serverEncodeAsync } = await import('./server');

    return await serverEncodeAsync(str);
  }
};
