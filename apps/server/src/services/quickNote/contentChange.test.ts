import { describe, expect, it } from 'vitest';

import {
  isQuickNoteMeaningChanged,
  isQuickNoteTextEquivalent,
  normalizeQuickNoteText,
} from './contentChange';

describe('normalizeQuickNoteText', () => {
  it('strips whitespace, punctuation, and case', () => {
    expect(normalizeQuickNoteText('  Hello,  World!\n')).toBe('helloworld');
  });

  it('strips CJK punctuation and folds full-width characters', () => {
    expect(normalizeQuickNoteText('我好喜欢北京。')).toBe('我好喜欢北京');
    expect(normalizeQuickNoteText('「调研」一下：ＧＰＴ－live，moshi？')).toBe(
      '调研一下gptlivemoshi',
    );
  });
});

describe('isQuickNoteTextEquivalent', () => {
  it('treats a trailing full stop as no change', () => {
    expect(isQuickNoteTextEquivalent('我好喜欢北京', '我好喜欢北京。')).toBe(true);
  });

  it('treats spacing and case edits as no change', () => {
    expect(isQuickNoteTextEquivalent('Research Moshi', 'research  moshi!')).toBe(true);
  });

  it('detects a real wording change', () => {
    expect(isQuickNoteTextEquivalent('调研 moshi', '调研 gpt-live')).toBe(false);
    expect(isQuickNoteTextEquivalent('我好喜欢北京', '我不喜欢北京')).toBe(false);
  });
});

describe('isQuickNoteMeaningChanged', () => {
  it('counts only a yes probability above one half', () => {
    expect(isQuickNoteMeaningChanged(0.75)).toBe(true);
    expect(isQuickNoteMeaningChanged(0.5)).toBe(false);
  });
});
