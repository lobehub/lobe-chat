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
          urlPattern: 'https://github.com/**/blob/**',
          urlTransform: 'https://github.com/$1/raw/refs/heads/$2',
        },
      ],
    );

    expect(result).toEqual({
      filterOptions: {
        enableReadability: false,
      },
      transformedUrl:
        'https://github.com/lobehub/chat-plugin-web-crawler/raw/refs/heads/main/api/v1/_utils.ts',
    });
  });
});
