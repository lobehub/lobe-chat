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
});
