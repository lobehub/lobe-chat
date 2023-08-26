import brotliPromise from 'brotli-wasm';

/**
 * @title 字符串压缩器
 */
export class StrCompressor {
  /**
   * @ignore
   */
  private instance!: {
    compress(buf: Uint8Array, options?: any): Uint8Array;
    decompress(buf: Uint8Array): Uint8Array;
  };

  async init(): Promise<void> {
    this.instance = await brotliPromise; // Import is async in browsers due to wasm requirements!
  }

  /**
   * @title 压缩字符串
   * @param str - 要压缩的字符串
   * @returns 压缩后的字符串
   */
  compress(str: string): string {
    const input = new TextEncoder().encode(str);

    const compressedData = this.instance.compress(input);

    return this.urlSafeBase64Encode(compressedData);
  }

  /**
   * @title 解压缩字符串
   * @param str - 要解压缩的字符串
   * @returns 解压缩后的字符串
   */
  decompress(str: string): string {
    const compressedData = this.urlSafeBase64Decode(str);

    const decompressedData = this.instance.decompress(compressedData);

    return new TextDecoder().decode(decompressedData);
  }

  /**
   * @title 异步压缩字符串
   * @param str - 要压缩的字符串
   * @returns Promise
   */
  async compressAsync(str: string) {
    const brotli = await brotliPromise;

    const input = new TextEncoder().encode(str);

    const compressedData = brotli.compress(input);

    return this.urlSafeBase64Encode(compressedData);
  }

  /**
   * @title 异步解压缩字符串
   * @param str - 要解压缩的字符串
   * @returns Promise
   */
  async decompressAsync(str: string) {
    const brotli = await brotliPromise;

    const compressedData = this.urlSafeBase64Decode(str);

    const decompressedData = brotli.decompress(compressedData);

    return new TextDecoder().decode(decompressedData);
  }

  private urlSafeBase64Encode = (data: Uint8Array): string => {
    const base64Str = btoa(String.fromCharCode(...data));
    return base64Str.replaceAll('+', '_0_').replaceAll('/', '_').replace(/=+$/, '');
  };

  private urlSafeBase64Decode = (data: string): Uint8Array => {
    let after = data.replaceAll('_0_', '+').replaceAll('_', '/');
    while (after.length % 4) {
      after += '=';
    }

    return new Uint8Array([...atob(after)].map((c) => c.charCodeAt(0)));
  };
}

export const Compressor = new StrCompressor();
