import { describe, expect, it } from 'vitest';

import { promptNoSearchResults } from './formatNoSearchResults';

describe('promptNoSearchResults', () => {
  it('should format no search results with simple query', () => {
    const result = promptNoSearchResults('how to install');
    expect(result).toMatchSnapshot();
  });

  it('should format no search results with complex query', () => {
    const result = promptNoSearchResults('API authentication with OAuth 2.0');
    expect(result).toMatchSnapshot();
  });

  it('should format no search results with special characters', () => {
    const result = promptNoSearchResults('How to use fetchData<T> with async/await?');
    expect(result).toMatchSnapshot();
  });

  it('should format no search results with non-English query', () => {
    const result = promptNoSearchResults('如何配置数据库连接');
    expect(result).toMatchSnapshot();
  });
});
