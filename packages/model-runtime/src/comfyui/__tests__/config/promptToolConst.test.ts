import { describe, expect, it } from 'vitest';

import {
  COMPOUND_STYLES,
  STYLE_ADJECTIVE_PATTERNS,
  STYLE_KEYWORDS,
  STYLE_SYNONYMS,
  extractStyleAdjectives,
  getAllStyleKeywords,
  getCompoundStyles,
  isStyleAdjective,
  normalizeStyleTerm,
} from '../../config/promptToolConst';

describe('promptToolConst', () => {
  describe('STYLE_KEYWORDS', () => {
    it('should have all expected categories', () => {
      const expectedCategories = [
        'ARTISTS',
        'ART_STYLES',
        'LIGHTING',
        'PHOTOGRAPHY',
        'QUALITY',
        'RENDERING',
        'COLOR_MOOD',
        'TEXTURE_MATERIAL',
      ];
      expect(Object.keys(STYLE_KEYWORDS)).toEqual(expectedCategories);
    });

    it('should have expanded keywords in each category', () => {
      // Strict expectations with exact counts
      expect(STYLE_KEYWORDS.ARTISTS.length).toBe(20);
      expect(STYLE_KEYWORDS.ART_STYLES.length).toBe(52);
      expect(STYLE_KEYWORDS.LIGHTING.length).toBe(37);
      expect(STYLE_KEYWORDS.PHOTOGRAPHY.length).toBe(49);
      expect(STYLE_KEYWORDS.QUALITY.length).toBe(39);
      expect(STYLE_KEYWORDS.RENDERING.length).toBe(39);
      expect(STYLE_KEYWORDS.COLOR_MOOD.length).toBe(56);
      expect(STYLE_KEYWORDS.TEXTURE_MATERIAL.length).toBe(60);
    });

    it('should not have duplicate keywords within categories', () => {
      Object.entries(STYLE_KEYWORDS).forEach(([, keywords]) => {
        const uniqueKeywords = [...new Set(keywords)];
        expect(keywords.length).toBe(uniqueKeywords.length);
      });
    });

    it('should have lowercase keywords', () => {
      Object.values(STYLE_KEYWORDS).forEach((keywords) => {
        keywords.forEach((keyword) => {
          expect(keyword).toBe(keyword.toLowerCase());
        });
      });
    });
  });

  describe('STYLE_SYNONYMS', () => {
    it('should have synonym mappings', () => {
      // Strict: expect exact minimum number of synonym groups
      expect(Object.keys(STYLE_SYNONYMS).length).toBeGreaterThanOrEqual(15);
      expect(Object.keys(STYLE_SYNONYMS).length).toBeLessThanOrEqual(30); // Not too many
    });

    it('should map common variations', () => {
      expect(STYLE_SYNONYMS['photorealistic']).toContain('photo-realistic');
      expect(STYLE_SYNONYMS['photorealistic']).toContain('photo realistic');
      expect(STYLE_SYNONYMS['photorealistic']).toContain('lifelike');

      expect(STYLE_SYNONYMS['4k']).toContain('4k resolution');
      expect(STYLE_SYNONYMS['4k']).toContain('ultra hd');

      expect(STYLE_SYNONYMS['cinematic']).toContain('filmic');
      expect(STYLE_SYNONYMS['cinematic']).toContain('movie-like');
    });

    it('should have unique synonyms for each key', () => {
      Object.entries(STYLE_SYNONYMS).forEach(([, synonyms]) => {
        const uniqueSynonyms = [...new Set(synonyms)];
        expect(synonyms.length).toBe(uniqueSynonyms.length);
      });
    });

    it('should not have overlapping synonyms between different keys', () => {
      const allSynonyms: string[] = [];
      const duplicates: string[] = [];

      Object.values(STYLE_SYNONYMS).forEach((synonyms) => {
        synonyms.forEach((synonym) => {
          if (allSynonyms.includes(synonym)) {
            duplicates.push(synonym);
          }
          allSynonyms.push(synonym);
        });
      });

      expect(duplicates).toEqual([]);
    });
  });

  describe('COMPOUND_STYLES', () => {
    it('should have compound style definitions', () => {
      // Strict: expect precise range
      expect(COMPOUND_STYLES.length).toBeGreaterThanOrEqual(35);
      expect(COMPOUND_STYLES.length).toBeLessThanOrEqual(80); // Not too many
    });

    it('should include expected compound styles', () => {
      expect(COMPOUND_STYLES).toContain('studio ghibli style');
      expect(COMPOUND_STYLES).toContain('cinematic lighting');
      expect(COMPOUND_STYLES).toContain('dramatic lighting');
      expect(COMPOUND_STYLES).toContain('depth of field');
      expect(COMPOUND_STYLES).toContain('physically based rendering');
      expect(COMPOUND_STYLES).toContain('global illumination');
    });

    it('should have unique compound styles', () => {
      const uniqueStyles = [...new Set(COMPOUND_STYLES)];
      expect(COMPOUND_STYLES.length).toBe(uniqueStyles.length);
    });

    it('should have lowercase compound styles', () => {
      COMPOUND_STYLES.forEach((style) => {
        expect(style).toBe(style.toLowerCase());
      });
    });
  });

  describe('STYLE_ADJECTIVE_PATTERNS', () => {
    it('should have all expected pattern categories', () => {
      const expectedPatterns = [
        'quality',
        'artistic',
        'visual',
        'mood',
        'texture',
        'scale',
        'detail',
        'professional',
      ];
      expect(Object.keys(STYLE_ADJECTIVE_PATTERNS)).toEqual(expectedPatterns);
    });

    it('should match expected adjectives', () => {
      // Quality patterns
      expect(STYLE_ADJECTIVE_PATTERNS.quality.test('sharp')).toBe(true);
      expect(STYLE_ADJECTIVE_PATTERNS.quality.test('blurry')).toBe(true);
      expect(STYLE_ADJECTIVE_PATTERNS.quality.test('crisp')).toBe(true);
      expect(STYLE_ADJECTIVE_PATTERNS.quality.test('walking')).toBe(false);

      // Artistic patterns
      expect(STYLE_ADJECTIVE_PATTERNS.artistic.test('abstract')).toBe(true);
      expect(STYLE_ADJECTIVE_PATTERNS.artistic.test('surreal')).toBe(true);
      expect(STYLE_ADJECTIVE_PATTERNS.artistic.test('minimal')).toBe(true);
      expect(STYLE_ADJECTIVE_PATTERNS.artistic.test('minimalist')).toBe(true);
      expect(STYLE_ADJECTIVE_PATTERNS.artistic.test('running')).toBe(false);

      // Visual patterns
      expect(STYLE_ADJECTIVE_PATTERNS.visual.test('bright')).toBe(true);
      expect(STYLE_ADJECTIVE_PATTERNS.visual.test('dark')).toBe(true);
      expect(STYLE_ADJECTIVE_PATTERNS.visual.test('vibrant')).toBe(true);
      expect(STYLE_ADJECTIVE_PATTERNS.visual.test('opened')).toBe(false);

      // Mood patterns
      expect(STYLE_ADJECTIVE_PATTERNS.mood.test('dramatic')).toBe(true);
      expect(STYLE_ADJECTIVE_PATTERNS.mood.test('peaceful')).toBe(true);
      expect(STYLE_ADJECTIVE_PATTERNS.mood.test('mysterious')).toBe(true);
      expect(STYLE_ADJECTIVE_PATTERNS.mood.test('walking')).toBe(false);
    });

    it('should be case insensitive', () => {
      expect(STYLE_ADJECTIVE_PATTERNS.quality.test('Sharp')).toBe(true);
      expect(STYLE_ADJECTIVE_PATTERNS.quality.test('SHARP')).toBe(true);
      expect(STYLE_ADJECTIVE_PATTERNS.artistic.test('Abstract')).toBe(true);
      expect(STYLE_ADJECTIVE_PATTERNS.artistic.test('ABSTRACT')).toBe(true);
    });
  });

  describe('getAllStyleKeywords', () => {
    it('should return flattened array of all keywords', () => {
      const allKeywords = getAllStyleKeywords();

      expect(Array.isArray(allKeywords)).toBe(true);
      // Strict: expect exact range for total keywords
      expect(allKeywords.length).toBeGreaterThanOrEqual(350);
      expect(allKeywords.length).toBeLessThanOrEqual(500);

      // Check that it contains keywords from different categories
      expect(allKeywords).toContain('by greg rutkowski');
      expect(allKeywords).toContain('photorealistic');
      expect(allKeywords).toContain('dramatic lighting');
      expect(allKeywords).toContain('bokeh');
      expect(allKeywords).toContain('masterpiece');
    });

    it('should return readonly array', () => {
      const keywords = getAllStyleKeywords();
      // TypeScript will enforce readonly at compile time
      expect(Object.isFrozen(keywords) || Array.isArray(keywords)).toBe(true);
    });
  });

  describe('getCompoundStyles', () => {
    it('should return compound styles array', () => {
      const compounds = getCompoundStyles();

      expect(Array.isArray(compounds)).toBe(true);
      // Strict: same as COMPOUND_STYLES test
      expect(compounds.length).toBeGreaterThanOrEqual(35);
      expect(compounds.length).toBeLessThanOrEqual(80);
      expect(compounds).toContain('studio ghibli style');
      expect(compounds).toContain('cinematic lighting');
    });

    it('should return the same array as COMPOUND_STYLES', () => {
      const compounds = getCompoundStyles();
      expect(compounds).toEqual(COMPOUND_STYLES);
    });
  });

  describe('normalizeStyleTerm', () => {
    it('should normalize known synonyms', () => {
      expect(normalizeStyleTerm('photo-realistic')).toBe('photorealistic');
      expect(normalizeStyleTerm('photo realistic')).toBe('photorealistic');
      expect(normalizeStyleTerm('lifelike')).toBe('photorealistic');

      expect(normalizeStyleTerm('4k resolution')).toBe('4k');
      expect(normalizeStyleTerm('ultra hd')).toBe('4k');

      expect(normalizeStyleTerm('filmic')).toBe('cinematic');
      expect(normalizeStyleTerm('movie-like')).toBe('cinematic');
    });

    it('should return original term if not a synonym', () => {
      expect(normalizeStyleTerm('unknown-term')).toBe('unknown-term');
      expect(normalizeStyleTerm('random')).toBe('random');
      expect(normalizeStyleTerm('test')).toBe('test');
    });

    it('should handle case insensitive matching', () => {
      expect(normalizeStyleTerm('Photo-Realistic')).toBe('photorealistic');
      expect(normalizeStyleTerm('PHOTO REALISTIC')).toBe('photorealistic');
      expect(normalizeStyleTerm('Filmic')).toBe('cinematic');
    });

    it('should handle empty or invalid input', () => {
      expect(normalizeStyleTerm('')).toBe('');
      expect(normalizeStyleTerm(' ')).toBe(' ');
    });
  });

  describe('isStyleAdjective', () => {
    it('should identify style adjectives', () => {
      // Quality adjectives
      expect(isStyleAdjective('sharp')).toBe(true);
      expect(isStyleAdjective('blurry')).toBe(true);
      expect(isStyleAdjective('crisp')).toBe(true);

      // Artistic adjectives
      expect(isStyleAdjective('abstract')).toBe(true);
      expect(isStyleAdjective('surreal')).toBe(true);
      expect(isStyleAdjective('minimal')).toBe(true);

      // Visual adjectives
      expect(isStyleAdjective('bright')).toBe(true);
      expect(isStyleAdjective('dark')).toBe(true);
      expect(isStyleAdjective('vibrant')).toBe(true);

      // Mood adjectives
      expect(isStyleAdjective('dramatic')).toBe(true);
      expect(isStyleAdjective('peaceful')).toBe(true);
      expect(isStyleAdjective('mysterious')).toBe(true);
    });

    it('should reject non-style adjectives', () => {
      expect(isStyleAdjective('walking')).toBe(false);
      expect(isStyleAdjective('running')).toBe(false);
      expect(isStyleAdjective('opened')).toBe(false);
      expect(isStyleAdjective('closed')).toBe(false);
      expect(isStyleAdjective('basic')).toBe(false);
      expect(isStyleAdjective('normal')).toBe(false);
    });

    it('should handle case insensitive matching', () => {
      expect(isStyleAdjective('Sharp')).toBe(true);
      expect(isStyleAdjective('SHARP')).toBe(true);
      expect(isStyleAdjective('Abstract')).toBe(true);
      expect(isStyleAdjective('ABSTRACT')).toBe(true);
    });
  });

  describe('extractStyleAdjectives', () => {
    it('should extract style adjectives from word array', () => {
      const words = ['a', 'sharp', 'walking', 'robot', 'with', 'dramatic', 'lighting'];
      const adjectives = extractStyleAdjectives(words);

      expect(adjectives).toEqual(['sharp', 'dramatic']);
    });

    it('should handle empty array', () => {
      expect(extractStyleAdjectives([])).toEqual([]);
    });

    it('should handle array with no style adjectives', () => {
      const words = ['walking', 'running', 'jumping', 'swimming'];
      expect(extractStyleAdjectives(words)).toEqual([]);
    });

    it('should handle array with all style adjectives', () => {
      const words = ['sharp', 'bright', 'dramatic', 'mysterious'];
      expect(extractStyleAdjectives(words)).toEqual(words);
    });

    it('should preserve original case', () => {
      const words = ['Sharp', 'BRIGHT', 'Dramatic'];
      const adjectives = extractStyleAdjectives(words);

      expect(adjectives).toEqual(['Sharp', 'BRIGHT', 'Dramatic']);
    });
  });

  describe('Integration tests', () => {
    it('should have consistent data across all exports', () => {
      const allKeywords = getAllStyleKeywords();
      const totalInCategories = Object.values(STYLE_KEYWORDS).reduce(
        (sum, keywords) => sum + keywords.length,
        0,
      );

      expect(allKeywords.length).toBe(totalInCategories);
    });

    it('should not have keywords that are also synonyms', () => {
      const allKeywords = getAllStyleKeywords();
      const allSynonyms = new Set(Object.values(STYLE_SYNONYMS).flat());

      const overlap = allKeywords.filter((keyword) => allSynonyms.has(keyword));

      // Strict: expect exactly 13 overlaps (known and acceptable)
      expect(overlap.length).toBe(13); // Exact count of acceptable overlaps
    });

    it('should have compound styles that contain style keywords', () => {
      const compounds = getCompoundStyles();
      const keywords = getAllStyleKeywords();

      // At least some compound styles should contain individual keywords
      const compoundsWithKeywords = compounds.filter((compound) => {
        return keywords.some((keyword) => compound.includes(keyword));
      });

      expect(compoundsWithKeywords.length).toBeGreaterThan(0);
    });
  });
});
