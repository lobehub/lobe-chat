import { createStaticStyles } from '@lobehub/ui';

export const resultStyles = createStaticStyles(({ css }) => ({
  // Result caps the subtitle at 36ch, which makes it narrower than the 32px title.
  fullWidthSubTitle: css`
    > p {
      max-width: 100%;
    }
  `,
}));
