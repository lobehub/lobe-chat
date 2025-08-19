import { isEmoji } from '../common';

describe('common utilities', () => {
  describe('isEmoji', () => {
    it('should return true for single emoji', () => {
      expect(isEmoji('😀')).toBe(true);
      expect(isEmoji('🚀')).toBe(true);
      expect(isEmoji('❤️')).toBe(true);
      expect(isEmoji('🎉')).toBe(true);
      expect(isEmoji('👍')).toBe(true);
    });

    it('should return true for multiple emojis', () => {
      expect(isEmoji('😀😃')).toBe(true);
      expect(isEmoji('🚀🎉👍')).toBe(true);
      expect(isEmoji('❤️💯')).toBe(true);
    });

    it('should return true for complex emojis with modifiers', () => {
      expect(isEmoji('👍🏻')).toBe(true); // skin tone modifier
      expect(isEmoji('👨‍💻')).toBe(true); // zero-width joiner sequence
      expect(isEmoji('🏳️‍🌈')).toBe(true); // flag sequence
    });

    it('should return false for text only', () => {
      expect(isEmoji('hello')).toBe(false);
      expect(isEmoji('abc')).toBe(false);
      expect(isEmoji('')).toBe(false);
    });

    it('should handle numeric characters (which have emoji variants)', () => {
      // Note: Numbers 0-9 and multi-digit numbers are detected as emoji
      // because they have Unicode emoji variants (e.g., 🔟 for 10)
      expect(isEmoji('0')).toBe(true);
      expect(isEmoji('1')).toBe(true);
      expect(isEmoji('9')).toBe(true);
      expect(isEmoji('10')).toBe(true);
      expect(isEmoji('123')).toBe(true);
      expect(isEmoji('42')).toBe(true);
    });

    it('should return false for mixed emoji and text', () => {
      expect(isEmoji('hello 😀')).toBe(false);
      expect(isEmoji('😀 world')).toBe(false);
      expect(isEmoji('test 🚀 rocket')).toBe(false);
    });

    it('should return false for special characters and symbols', () => {
      expect(isEmoji('!')).toBe(false);
      expect(isEmoji('@#$%')).toBe(false);
      expect(isEmoji('★')).toBe(false);
      expect(isEmoji('♪')).toBe(false);
    });

    it('should handle edge cases', () => {
      expect(isEmoji(' ')).toBe(false); // space
      expect(isEmoji('\n')).toBe(false); // newline
      expect(isEmoji('\t')).toBe(false); // tab
    });
  });
});
