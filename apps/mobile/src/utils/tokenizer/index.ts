export const encodeAsync = async (str: string): Promise<number> => {
  if (str.length === 0) return 0;

  // use gpt-tokenizer under 10000 str
  // use approximation way if large then 10000
  if (str.length <= 10_000) {
    const { clientEncodeAsync } = await import('./client');

    return await clientEncodeAsync(str);
  } else {
    const { estimatedEncodeAsync } = await import('./estimated');

    return await estimatedEncodeAsync(str);
  }
};
