// no need to introduce a package to get the current time as this module is just a debug utility
const getTime = () => {
  const date = new Date();
  return `${date.getFullYear()}-${date.getDate()}-${date.getDay()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}.${date.getMilliseconds()}`;
};

export const debugStream = async (stream: ReadableStream) => {
  let finished = false;
  let chunk = 0;
  let chunkValue: any;
  const decoder = new TextDecoder();

  const reader = stream.getReader();

  console.log(`[stream start] ${getTime()}`);

  while (!finished) {
    try {
      const { value, done } = await reader.read();

      if (done) {
        console.log(`[stream finished] total chunks: ${chunk}\n`);
        finished = true;
        break;
      }

      chunkValue = value;

      // if the value is ArrayBuffer, we need to decode it
      if ('byteLength' in value) {
        chunkValue = decoder.decode(value, { stream: true });
      } else if (typeof value !== 'string') {
        chunkValue = JSON.stringify(value);
      }

      console.log(`[chunk ${chunk}] ${getTime()}`);
      console.log(chunkValue);
      console.log(`\n`);

      finished = done;
      chunk++;
    } catch (e) {
      finished = true;
      console.error('[debugStream error]', e);
      console.error('[error chunk value:]', chunkValue);
    }
  }
};
