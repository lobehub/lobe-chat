import { describe, expect, it } from 'vitest';

import { initialMobileReviewStep, nextMobileReviewStep } from './mobileReviewFlow';

describe('initialMobileReviewStep', () => {
  it('opens on the image when there is evidence to judge', () => {
    expect(initialMobileReviewStep(3)).toBe('browse');
  });

  it('opens on the note screen when there is nothing to look at', () => {
    expect(initialMobileReviewStep(0)).toBe('feedback');
  });
});

describe('nextMobileReviewStep', () => {
  it('stays on the image after a region is drawn', () => {
    // The regression: finishing a drag jumped to the note screen, so the box
    // could no longer be moved, resized or deleted.
    expect(nextMobileReviewStep('draw', 'region-drawn')).toBe('draw');
  });

  it('toggles between marking and browsing', () => {
    expect(nextMobileReviewStep('browse', 'toggle-draw')).toBe('draw');
    expect(nextMobileReviewStep('draw', 'toggle-draw')).toBe('browse');
  });

  it('reaches the note screen from either image step', () => {
    expect(nextMobileReviewStep('browse', 'write-feedback')).toBe('feedback');
    expect(nextMobileReviewStep('draw', 'write-feedback')).toBe('feedback');
  });

  it('returns to the image from the note screen', () => {
    expect(nextMobileReviewStep('feedback', 'back-to-images')).toBe('browse');
  });

  it('opens a listed region ready to adjust, not merely to look at', () => {
    expect(nextMobileReviewStep('feedback', 'edit-region')).toBe('draw');
  });
});
