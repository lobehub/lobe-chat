// @vitest-environment edge-runtime
import { describe, expect, it } from 'vitest';

import { POST } from './route';

describe('tokenizer Route', () => {
  it('count hello world', async () => {
    const txt = 'Hello, world!';
    const request = new Request('https://test.com', {
      method: 'POST',
      body: txt,
    });

    const response = await POST(request);

    const data = await response.json();
    expect(data.count).toEqual(4);
  });

  it('count Chinese', async () => {
    const txt = '今天天气真好';
    const request = new Request('https://test.com', {
      method: 'POST',
      body: txt,
    });

    const response = await POST(request);

    const data = await response.json();
    expect(data.count).toEqual(5);
  });
});
