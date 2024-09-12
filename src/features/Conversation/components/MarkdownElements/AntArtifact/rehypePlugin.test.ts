import { describe, expect, it } from 'vitest';

import rehypePlugin from './rehypePlugin';

describe('rehypePlugin', () => {
  it('should transform <antArtifact> tags within paragraphs', () => {
    const tree = {
      type: 'root',
      children: [
        {
          type: 'element',
          tagName: 'p',
          properties: {},
          children: [
            {
              type: 'text',
              value: '好的,让我来用新的视角解释一下"睡觉"这个词。',
              position: {
                start: {
                  line: 1,
                  column: 1,
                  offset: 0,
                },
                end: {
                  line: 1,
                  column: 24,
                  offset: 23,
                },
              },
            },
          ],
          position: {
            start: {
              line: 1,
              column: 1,
              offset: 0,
            },
            end: {
              line: 1,
              column: 24,
              offset: 23,
            },
          },
        },
        {
          type: 'text',
          value: '\n',
        },
        {
          type: 'raw',
          value: `<antArtifact identifier="sleep-interpretation-card" type="image/svg+xml" title="睡觉的新解释">\n<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600">\n  <defs>\n    <style>\n      @import url(\'https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;700&amp;display=swap\');\n    </style>\n  </defs>`,
          position: {
            start: {
              line: 5,
              column: 1,
              offset: 166,
            },
            end: {
              line: 11,
              column: 10,
              offset: 468,
            },
          },
        },
        {
          type: 'text',
          value: '\n',
        },
        {
          type: 'raw',
          value: '  <!-- 背景 -->',
          position: {
            start: {
              line: 13,
              column: 1,
              offset: 472,
            },
            end: {
              line: 13,
              column: 14,
              offset: 485,
            },
          },
        },
        {
          type: 'element',
          tagName: 'p',
          properties: {},
          children: [
            {
              type: 'raw',
              value:
                '<text x="200" y="500" font-family="\'Noto Serif SC\', serif" font-size="20" text-anchor="middle" fill="#8B4513">',
              position: {
                start: {
                  line: 46,
                  column: 3,
                  offset: 2144,
                },
                end: {
                  line: 46,
                  column: 113,
                  offset: 2254,
                },
              },
            },
            {
              type: 'text',
              value: '睡觉：生产力的假死，创造力的重生。',
              position: {
                start: {
                  line: 46,
                  column: 113,
                  offset: 2254,
                },
                end: {
                  line: 46,
                  column: 130,
                  offset: 2271,
                },
              },
            },
            {
              type: 'raw',
              value: '</text>',
              position: {
                start: {
                  line: 46,
                  column: 130,
                  offset: 2271,
                },
                end: {
                  line: 46,
                  column: 137,
                  offset: 2278,
                },
              },
            },
            {
              type: 'element',
              tagName: 'br',
              properties: {},
              children: [],
            },
            {
              children: [
                {
                  type: 'raw',
                  value: `\n<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600">\n  <defs>\n    <style>\n      @import url(\'https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;700&amp;display=swap\');\n    </style>\n  </defs>\n  <!-- 背景 -->\n  <rect width="400" height="600" fill="#F0EAD6"/>\n  <!-- 几何装饰 -->\n  <rect x="20" y="20" width="360" height="560" fill="none" stroke="#D2691E" stroke-width="2"/>\n  <line x1="20" y1="100" x2="380" y2="100" stroke="#D2691E" stroke-width="1"/>\n  <!-- 标题 -->\n<text x="200" y="70" font-family="\'Noto Serif SC\', serif" font-size="32" font-weight="700" text-anchor="middle" fill="#8B4513">汉语新解</text>\n  <!-- 原词 -->\n<text x="40" y="140" font-family="\'Noto Serif SC\', serif" font-size="24" fill="#696969">睡觉</text>\n<text x="40" y="170" font-family="\'Noto Serif SC\', serif" font-size="16" fill="#808080">Sleep</text>\n<text x="40" y="190" font-family="\'Noto Serif SC\', serif" font-size="16" fill="#808080">眠る (nemuru)</text>\n  <!-- 新解释 -->\n  <text x="40" y="240" font-family="\'Noto Serif SC\', serif" font-size="18" fill="#4A4A4A">\n    <tspan x="40" dy="0">睡觉：一场与资本主义的</tspan>\n    <tspan x="40" dy="30">短暂罢工，是生产力的</tspan>\n    <tspan x="40" dy="30">叛徒，却是创造力的</tspan>\n    <tspan x="40" dy="30">忠实盟友。</tspan>\n  </text>\n  <!-- 线条图 -->\n  <line x1="40" y1="400" x2="360" y2="400" stroke="#8B4513" stroke-width="2"/>\n  <circle cx="120" cy="400" r="5" fill="#D2691E"/>\n  <text x="120" y="420" font-family="\'Noto Serif SC\', serif" font-size="12" text-anchor="middle" fill="#696969">效率</text>\n  <circle cx="200" cy="400" r="5" fill="#D2691E"/>\n  <text x="200" y="420" font-family="\'Noto Serif SC\', serif" font-size="12" text-anchor="middle" fill="#696969">解放</text>\n  <circle cx="280" cy="400" r="5" fill="#D2691E"/>\n  <text x="280" y="420" font-family="\'Noto Serif SC\', serif" font-size="12" text-anchor="middle" fill="#696969">创新</text>\n  <!-- 总结 -->\n<text x="200" y="500" font-family="\'Noto Serif SC\', serif" font-size="20" text-anchor="middle" fill="#8B4513">睡觉：生产力的假死，创造力的重生。</text>\n</svg>\n`,
                },
              ],
              properties: {
                identifier: 'sleep-interpretation-card',
                type: 'image/svg+xml',
                title: '睡觉的新解释',
              },
              tagName: 'antArtifact',
              type: 'element',
            },
          ],
          position: {
            start: {
              line: 46,
              column: 3,
              offset: 2144,
            },
            end: {
              line: 48,
              column: 15,
              offset: 2300,
            },
          },
        },
        {
          type: 'text',
          value: '\n',
        },
        {
          type: 'element',
          tagName: 'p',
          properties: {},
          children: [
            {
              type: 'text',
              value: '这是我为"睡觉"这个词创作的新解释卡片。',
              position: {
                start: {
                  line: 50,
                  column: 1,
                  offset: 2302,
                },
                end: {
                  line: 50,
                  column: 42,
                  offset: 2343,
                },
              },
            },
          ],
          position: {
            start: {
              line: 50,
              column: 1,
              offset: 2302,
            },
            end: {
              line: 50,
              column: 42,
              offset: 2343,
            },
          },
        },
      ],
      position: {
        start: {
          line: 1,
          column: 1,
          offset: 0,
        },
        end: {
          line: 60,
          column: 40,
          offset: 2684,
        },
      },
    };
    const expectedTree = {
      type: 'root',
      children: [
        {
          type: 'element',
          tagName: 'p',
          properties: {},
          children: [
            {
              type: 'text',
              value: '好的,让我来用新的视角解释一下"睡觉"这个词。',
              position: {
                start: {
                  line: 1,
                  column: 1,
                  offset: 0,
                },
                end: {
                  line: 1,
                  column: 24,
                  offset: 23,
                },
              },
            },
          ],
          position: {
            start: {
              line: 1,
              column: 1,
              offset: 0,
            },
            end: {
              line: 1,
              column: 24,
              offset: 23,
            },
          },
        },
        {
          type: 'text',
          value: '\n',
        },

        {
          type: 'element',
          tagName: 'antArtifact',
          properties: {
            identifier: 'sleep-interpretation-card',
            type: 'image/svg+xml',
            title: '睡觉的新解释',
          },
          children: [
            {
              type: 'raw',
              value: `\n<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600">\n  <defs>\n    <style>\n      @import url(\'https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;700&amp;display=swap\');\n    </style>\n  </defs>\n  <!-- 背景 -->\n  <rect width="400" height="600" fill="#F0EAD6"/>\n  <!-- 几何装饰 -->\n  <rect x="20" y="20" width="360" height="560" fill="none" stroke="#D2691E" stroke-width="2"/>\n  <line x1="20" y1="100" x2="380" y2="100" stroke="#D2691E" stroke-width="1"/>\n  <!-- 标题 -->\n<text x="200" y="70" font-family="\'Noto Serif SC\', serif" font-size="32" font-weight="700" text-anchor="middle" fill="#8B4513">汉语新解</text>\n  <!-- 原词 -->\n<text x="40" y="140" font-family="\'Noto Serif SC\', serif" font-size="24" fill="#696969">睡觉</text>\n<text x="40" y="170" font-family="\'Noto Serif SC\', serif" font-size="16" fill="#808080">Sleep</text>\n<text x="40" y="190" font-family="\'Noto Serif SC\', serif" font-size="16" fill="#808080">眠る (nemuru)</text>\n  <!-- 新解释 -->\n  <text x="40" y="240" font-family="\'Noto Serif SC\', serif" font-size="18" fill="#4A4A4A">\n    <tspan x="40" dy="0">睡觉：一场与资本主义的</tspan>\n    <tspan x="40" dy="30">短暂罢工，是生产力的</tspan>\n    <tspan x="40" dy="30">叛徒，却是创造力的</tspan>\n    <tspan x="40" dy="30">忠实盟友。</tspan>\n  </text>\n  <!-- 线条图 -->\n  <line x1="40" y1="400" x2="360" y2="400" stroke="#8B4513" stroke-width="2"/>\n  <circle cx="120" cy="400" r="5" fill="#D2691E"/>\n  <text x="120" y="420" font-family="\'Noto Serif SC\', serif" font-size="12" text-anchor="middle" fill="#696969">效率</text>\n  <circle cx="200" cy="400" r="5" fill="#D2691E"/>\n  <text x="200" y="420" font-family="\'Noto Serif SC\', serif" font-size="12" text-anchor="middle" fill="#696969">解放</text>\n  <circle cx="280" cy="400" r="5" fill="#D2691E"/>\n  <text x="280" y="420" font-family="\'Noto Serif SC\', serif" font-size="12" text-anchor="middle" fill="#696969">创新</text>\n  <!-- 总结 -->\n<text x="200" y="500" font-family="\'Noto Serif SC\', serif" font-size="20" text-anchor="middle" fill="#8B4513">睡觉：生产力的假死，创造力的重生。</text>\n</svg>\n`,
            },
          ],
        },
        {
          type: 'text',
          value: '\n',
        },
        {
          type: 'element',
          tagName: 'p',
          properties: {},
          children: [
            {
              type: 'text',
              value: '这是我为"睡觉"这个词创作的新解释卡片。',
              position: {
                start: {
                  line: 50,
                  column: 1,
                  offset: 2302,
                },
                end: {
                  line: 50,
                  column: 42,
                  offset: 2343,
                },
              },
            },
          ],
          position: {
            start: {
              line: 50,
              column: 1,
              offset: 2302,
            },
            end: {
              line: 50,
              column: 42,
              offset: 2343,
            },
          },
        },
      ],
      position: {
        start: {
          line: 1,
          column: 1,
          offset: 0,
        },
        end: {
          line: 60,
          column: 40,
          offset: 2684,
        },
      },
    };

    const plugin = rehypePlugin();
    plugin(tree);

    expect(tree).toEqual(expectedTree);
  });
});
