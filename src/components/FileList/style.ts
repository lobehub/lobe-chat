import { createStyles } from 'antd-style';

export const MAX_SIZE = 640;
export const MIN_IMAGE_SIZE = 64;
export const GAP = 8;

export const useStyles = createStyles(({ css }) => ({
  container: css`
    display: grid;
    grid-gap: ${GAP}px;
    grid-template-columns: repeat(6, 1fr);

    width: 100%;
    max-width: ${MAX_SIZE}px;

    & > div {
      grid-column: span 2;

      width: 100%;
      min-width: ${MIN_IMAGE_SIZE}px;
      min-height: ${MIN_IMAGE_SIZE}px;
      max-height: ${(MAX_SIZE - GAP) / 2}px;
    }

    & > div:nth-child(1):nth-last-child(2),
    & > div:nth-child(2):nth-last-child(1) {
      grid-column: span 3;
      max-height: ${(MAX_SIZE - 2 * GAP) / 3}px;
    }

    & > :nth-child(1):nth-last-child(1) {
      grid-column: span 6;
      max-height: ${MAX_SIZE}px;
    }
  `,
}));
