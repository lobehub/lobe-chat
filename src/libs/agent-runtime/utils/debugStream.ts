export const debugStream = async (stream: ReadableStream) => {
  let done = false;
  let chunk = 0;
  const decoder = new TextDecoder();

  const reader = stream.getReader();
  while (!done) {
    const { value, done: _done } = await reader.read();
    const chunkValue = decoder.decode(value, { stream: true });
    if (!_done) {
      console.log(`chunk ${chunk}:`);
      console.log(chunkValue);
    }

    done = _done;
    chunk++;
  }
};
