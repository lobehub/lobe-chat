import { createStyles } from 'antd-style';

export const MIN_IMAGE_SIZE = 64;
export const MAX_SIZE_DESKTOP = 640;
export const MAX_SIZE_MOBILE = 280;
export const useStyles = createStyles(
  ({ css }, { col, gap, max, min }: { col: number; gap: number; max: number; min: number }) => ({
    container: css`
      display: grid;
      grid-gap: ${gap}px;
      grid-template-columns: repeat(${col}, 1fr);

      width: 100%;
      max-width: ${max}px;

      & > div {
        width: 100%;
        min-width: ${min}px;
        min-height: ${min}px;
        max-height: ${(max - gap * (col - 1)) / col}px;
      }
    `,
  }),
);
