export const encodeAsync = async (str: string) => {
  const { encode } = await import('gpt-tokenizer');

  return encode(str).length;
};
