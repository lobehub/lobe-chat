import { beforeEach, describe, expect, it, vi } from 'vitest';

import { isCommandPressed } from './keyboard';
import * as platform from './platform';

// Mock the platform module before importing keyboard
vi.mock('./platform', () => ({
  isMacOS: vi.fn(),
}));

describe('keyboard', () => {
  describe('isCommandPressed', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    describe('macOS platform', () => {
      beforeEach(() => {
        // Mock isMacOS to return true
        vi.mocked(platform.isMacOS).mockReturnValue(true);
      });

      it('should return true when metaKey is pressed on macOS', () => {
        const event = new KeyboardEvent('keydown', {
          metaKey: true,
          ctrlKey: false,
        });

        expect(isCommandPressed(event)).toBe(true);
      });

      it('should return false when metaKey is not pressed on macOS', () => {
        const event = new KeyboardEvent('keydown', {
          metaKey: false,
          ctrlKey: true,
        });

        expect(isCommandPressed(event)).toBe(false);
      });

      it('should return false when no modifier keys are pressed on macOS', () => {
        const event = new KeyboardEvent('keydown', {
          metaKey: false,
          ctrlKey: false,
        });

        expect(isCommandPressed(event)).toBe(false);
      });

      it('should handle keyboard events with multiple modifiers on macOS', () => {
        const event = new KeyboardEvent('keydown', {
          metaKey: true,
          ctrlKey: true,
          shiftKey: true,
          altKey: true,
        });

        expect(isCommandPressed(event)).toBe(true);
      });
    });

    describe('Windows/Linux platform', () => {
      beforeEach(() => {
        // Mock isMacOS to return false
        vi.mocked(platform.isMacOS).mockReturnValue(false);
      });

      it('should return true when ctrlKey is pressed on Windows/Linux', () => {
        const event = new KeyboardEvent('keydown', {
          ctrlKey: true,
          metaKey: false,
        });

        expect(isCommandPressed(event)).toBe(true);
      });

      it('should return false when ctrlKey is not pressed on Windows/Linux', () => {
        const event = new KeyboardEvent('keydown', {
          ctrlKey: false,
          metaKey: true,
        });

        expect(isCommandPressed(event)).toBe(false);
      });

      it('should return false when no modifier keys are pressed on Windows/Linux', () => {
        const event = new KeyboardEvent('keydown', {
          ctrlKey: false,
          metaKey: false,
        });

        expect(isCommandPressed(event)).toBe(false);
      });

      it('should handle keyboard events with multiple modifiers on Windows/Linux', () => {
        const event = new KeyboardEvent('keydown', {
          ctrlKey: true,
          metaKey: false,
          shiftKey: true,
          altKey: true,
        });

        expect(isCommandPressed(event)).toBe(true);
      });
    });
  });
});
