import { describe, expect, it } from 'vitest';

import { processWithArtifact } from './utils';

describe('processWithArtifact', () => {
  it('should removeLineBreaks with closed tag', () => {
    const input = `好的

<lobeArtifact identifier="sleep-interpretation-card" type="image/svg+xml" title="睡觉的新解释">
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600">
<defs>
<style>
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;700&amp;display=swap');
</style>
</defs>
<!-- 背景 -->
<rect width="400" height="600" fill="#F0EAD6"/>
<!-- 总结 -->
<text x="200" y="500" font-family="'Noto Serif SC', serif" font-size="20" text-anchor="middle" fill="#8B4513">睡觉：生产力的假死，创造力的重生。</text>
</svg>
</lobeArtifact>`;

    const output = processWithArtifact(input);

    expect(output).toEqual(`好的

<lobeArtifact identifier="sleep-interpretation-card" type="image/svg+xml" title="睡觉的新解释"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600"><defs><style>@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;700&amp;display=swap');</style></defs><!-- 背景 --><rect width="400" height="600" fill="#F0EAD6"/><!-- 总结 --><text x="200" y="500" font-family="'Noto Serif SC', serif" font-size="20" text-anchor="middle" fill="#8B4513">睡觉：生产力的假死，创造力的重生。</text></svg></lobeArtifact>`);
  });

  it('should removeLineBreaks with open tag', () => {
    const input = `好的

<lobeArtifact identifier="ai-interpretation-card" type="image/svg+xml" title="人工智能新解卡片">
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600">
  <defs>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;700&amp;display=swap');
    </style>
  </defs>
`;

    const output = processWithArtifact(input);

    expect(output).toEqual(`好的

<lobeArtifact identifier="ai-interpretation-card" type="image/svg+xml" title="人工智能新解卡片"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600">  <defs>    <style>      @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;700&amp;display=swap');    </style>  </defs>`);
  });
  it('should not throw error with empty', () => {
    const input = '';

    const output = processWithArtifact(input);

    expect(output).toEqual('');
  });

  describe('close the <lobeArtifact tag', () => {
    it('close tag for <lobeArtifact', () => {
      const input = '<lobeArtifact';

      const output = processWithArtifact(input);

      expect(output).toEqual('<lobeArtifact>');
    });

    it('close tag for <lobeArtifact identifier="something"', () => {
      const input = '<lobeArtifact identifier="something"';

      const output = processWithArtifact(input);

      expect(output).toEqual('<lobeArtifact>');
    });

    it('close tag for <lobeArtifact identifier="ai-interpretation" type="image/svg+xml" titl', () => {
      const input = '<lobeArtifact identifier="ai-interpretation" type="image/svg+xml" titl';

      const output = processWithArtifact(input);

      expect(output).toEqual('<lobeArtifact>');
    });

    it('only change the <lobeArtifact> part', () => {
      const input = `好的,让我来用新的视角解释"人工智能"这个词汇。

<lobeThinking>这个词汇涉及了当代科技和社会热点,需要用批判性和幽默感来解读其本质。我会用隐喻和讽刺来表达,同时保持简洁有力。</lobeThinking>

<lobeArtifact identifier="ai-new-interpretation" type="image/svg+xml" t`;

      const output = processWithArtifact(input);

      expect(output).toEqual(`好的,让我来用新的视角解释"人工智能"这个词汇。

<lobeThinking>这个词汇涉及了当代科技和社会热点,需要用批判性和幽默感来解读其本质。我会用隐喻和讽刺来表达,同时保持简洁有力。</lobeThinking>

<lobeArtifact>`);
    });

    it('not change for <lobeArtifact />', () => {
      const input = '<lobeArtifact/>';

      const output = processWithArtifact(input);

      expect(output).toEqual(input);
    });
  });

  it('should removeLinkBreaks for lobeThinking', () => {
    const input = `好的,让我以一个特别的视角来解释"人工智能"这个词汇。

<lobeThinking>
这个词汇涉及了当代科技和社会热点,需要用批判性、幽默而深刻的视角来解读。我会运用隐喻和讽刺,抓住其本质,并以精练的方式表达出来。这符合一个好的artifact的标准,因为它是一个独立的、可能被用户修改或重用的内容。我将创建一个新的SVG artifact来呈现这个解释。
</lobeThinking>

<lobeArtifact identifier="ai-new-interpretation" type="image/svg+xml" title="人工智能的新解释">
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600">
  <defs>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;700&amp;display=swap');
      .background { fill: #f0f0f0; }
      .title { font-family: 'Noto Serif SC', serif; font-size: 28px; font-weight: 700; fill: #333; }
      .content { font-family: 'Noto Serif SC', serif; font-size: 18px; fill: #555; }
      .divider { stroke: #999; stroke-width: 1; }
      .decoration { fill: none; stroke: #999; stroke-width: 1; }
    </style>
  </defs>
</svg>
</lobeArtifact>

我为"人工智能"这个词创建了一个新的解释,并将其呈现在一个SVG卡片中。这个解释采用了批判性和幽默的视角,试图揭示这个概念背后的一些潜在问题。`;

    const output = processWithArtifact(input);

    expect(output).toEqual(`好的,让我以一个特别的视角来解释"人工智能"这个词汇。

<lobeThinking>这个词汇涉及了当代科技和社会热点,需要用批判性、幽默而深刻的视角来解读。我会运用隐喻和讽刺,抓住其本质,并以精练的方式表达出来。这符合一个好的artifact的标准,因为它是一个独立的、可能被用户修改或重用的内容。我将创建一个新的SVG artifact来呈现这个解释。</lobeThinking>

<lobeArtifact identifier="ai-new-interpretation" type="image/svg+xml" title="人工智能的新解释"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 600">  <defs>    <style>      @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;700&amp;display=swap');      .background { fill: #f0f0f0; }      .title { font-family: 'Noto Serif SC', serif; font-size: 28px; font-weight: 700; fill: #333; }      .content { font-family: 'Noto Serif SC', serif; font-size: 18px; fill: #555; }      .divider { stroke: #999; stroke-width: 1; }      .decoration { fill: none; stroke: #999; stroke-width: 1; }    </style>  </defs></svg></lobeArtifact>

我为"人工智能"这个词创建了一个新的解释,并将其呈现在一个SVG卡片中。这个解释采用了批判性和幽默的视角,试图揭示这个概念背后的一些潜在问题。`);
  });

  it('should removeLinkBreaks for lobeThinking', () => {
    const input = `<lobeThinking>
这个词汇涉及了
`;

    const output = processWithArtifact(input);

    expect(output).toEqual(`<lobeThinking>这个词汇涉及了`);
  });
});
