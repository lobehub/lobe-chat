import { applyUrlRules } from './appUrlRules';

describe('applyUrlRules', () => {
  it('github file rules', () => {
    const result = applyUrlRules(
      'https://github.com/lobehub/chat-plugin-web-crawler/blob/main/api/v1/_utils.ts',
      [
        {
          filterOptions: {
            enableReadability: false,
          },
          impls: ['naive'],
          urlPattern: 'https://github.com/([^/]+)/([^/]+)/blob/([^/]+)/(.*)',
          urlTransform: 'https://github.com/$1/$2/raw/refs/heads/$3/$4',
        },
      ],
    );

    expect(result).toEqual({
      filterOptions: {
        enableReadability: false,
      },
      impls: ['naive'],
      transformedUrl:
        'https://github.com/lobehub/chat-plugin-web-crawler/raw/refs/heads/main/api/v1/_utils.ts',
    });
  });

  it('should return original url when no rules match', () => {
    const result = applyUrlRules('https://example.com', []);
    expect(result).toEqual({
      transformedUrl: 'https://example.com',
    });
  });

  it('should return url with filter options when pattern matches but no transform', () => {
    const result = applyUrlRules('https://example.com', [
      {
        filterOptions: {
          pureText: true,
        },
        impls: ['jina'],
        urlPattern: 'https://example.com',
      },
    ]);

    expect(result).toEqual({
      filterOptions: {
        pureText: true,
      },
      impls: ['jina'],
      transformedUrl: 'https://example.com',
    });
  });

  it('should handle multiple capture groups in transform', () => {
    const result = applyUrlRules('test-123-abc', [
      {
        filterOptions: {
          enableReadability: true,
        },
        impls: ['browserless'],
        urlPattern: 'test-([0-9]+)-([a-z]+)',
        urlTransform: 'transformed-$1-$2',
      },
    ]);

    expect(result).toEqual({
      filterOptions: {
        enableReadability: true,
      },
      impls: ['browserless'],
      transformedUrl: 'transformed-123-abc',
    });
  });

  it('should handle multiple impls types', () => {
    const result = applyUrlRules('https://example.com', [
      {
        filterOptions: {
          pureText: true,
        },
        impls: ['naive', 'jina', 'browserless'],
        urlPattern: 'https://example.com',
      },
    ]);

    expect(result).toEqual({
      filterOptions: {
        pureText: true,
      },
      impls: ['naive', 'jina', 'browserless'],
      transformedUrl: 'https://example.com',
    });
  });

  it('should handle undefined impls', () => {
    const result = applyUrlRules('https://example.com', [
      {
        filterOptions: {
          pureText: true,
        },
        urlPattern: 'https://example.com',
      },
    ]);

    expect(result).toEqual({
      filterOptions: {
        pureText: true,
      },
      transformedUrl: 'https://example.com',
    });
  });
});
