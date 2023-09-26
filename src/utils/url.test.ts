import { pathString } from './url';

describe('pathString', () => {
  it('基本情况', () => {
    const result = pathString('/home');
    expect(result).toBe('/home');
  });

  it('包含查询参数的情况', () => {
    const result = pathString('/home', { search: 'id=1&name=test' });
    expect(result).toBe('/home?id=1&name=test');
  });

  it('包含哈希值的情况', () => {
    const result = pathString('/home', { hash: 'top' });
    expect(result).toBe('/home#top');

    const result2 = pathString('/home', { hash: '#hash=abc' });
    expect(result2).toBe('/home#hash=abc');
  });

  it('path 参数包含相对路径的情况', () => {
    const result = pathString('./home');
    expect(result).toBe('/home');
  });

  it('path 参数包含绝对路径的情况', () => {
    const result = pathString('/home');
    expect(result).toBe('/home');
  });

  it('path 参数包含协议的情况', () => {
    const result = pathString('https://www.example.com/home');
    expect(result).toBe('https://www.example.com/home');
  });

  it('path 参数包含主机名的情况', () => {
    const result = pathString('//www.example.com/home');
    expect(result).toBe('https://www.example.com/home');
  });

  it('path 参数包含端口号的情况', () => {
    const result = pathString('//www.example.com:8080/home');
    expect(result).toBe('https://www.example.com:8080/home');
  });

  it('path 参数包含特殊字符的情况', () => {
    const result = pathString('/home/测试');
    expect(result).toBe('/home/%E6%B5%8B%E8%AF%95');
  });
});
