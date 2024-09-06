export const serverEncodeAsync = async (str: string): Promise<number> => {
  try {
    const res = await fetch('/webapi/tokenizer', { body: str, method: 'POST' });
    const data = await res.json();

    return data.count;
  } catch (e) {
    console.error('serverEncodeAsync:', e);
    return str.length;
  }
};
