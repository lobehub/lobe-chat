addEventListener('message', async (event) => {
  const { id, str } = event.data;
  try {
    const { encode } = await import('gpt-tokenizer');

    const tokenCount = encode(str).length;

    postMessage({ id, result: tokenCount });
  } catch (error) {
    postMessage({ error: (error as Error).message, id });
  }
});
