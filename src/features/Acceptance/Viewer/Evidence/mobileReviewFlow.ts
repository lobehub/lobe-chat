/**
 * The phone evidence review is a three-step flow, not two loose booleans:
 * the reviewer is browsing the image, marking regions on it, or writing the
 * note that the reject carries. Only one of those is ever true.
 */
export type MobileReviewStep = 'browse' | 'draw' | 'feedback';

export type MobileReviewEvent =
  /** A region was just drawn on the image. */
  | 'region-drawn'
  /** Jump back to the image that holds a listed region, ready to adjust it. */
  | 'edit-region'
  /** Leave the note screen for the images. */
  | 'back-to-images'
  /** The draw / browse toggle under the image. */
  | 'toggle-draw'
  /** Move on to the note screen. */
  | 'write-feedback';

export const initialMobileReviewStep = (evidenceCount: number): MobileReviewStep =>
  evidenceCount > 0 ? 'browse' : 'feedback';

/**
 * `region-drawn` deliberately holds the step still. Finishing a drag used to
 * throw the reviewer onto the note screen, which froze the box at whatever
 * shape the first drag happened to produce — no way back to move, resize or
 * delete it, and no way to tell the difference between a region that landed
 * and one that missed.
 */
export const nextMobileReviewStep = (
  step: MobileReviewStep,
  event: MobileReviewEvent,
): MobileReviewStep => {
  switch (event) {
    case 'region-drawn': {
      return step;
    }
    case 'edit-region': {
      return 'draw';
    }
    case 'back-to-images': {
      return 'browse';
    }
    case 'toggle-draw': {
      return step === 'draw' ? 'browse' : 'draw';
    }
    case 'write-feedback': {
      return 'feedback';
    }
  }
};
