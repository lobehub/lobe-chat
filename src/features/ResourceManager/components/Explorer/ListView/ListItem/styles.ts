import { cssVar } from '@lobehub/ui/stylex/cssVar.stylex';
import * as stylex from '@stylexjs/stylex';

// `hover` (revealed by the row's hover or an open popup) lives in `styles.module.css`.
export const styles = stylex.create({
  name: {
    overflow: 'hidden',
    flex: '1',
    minWidth: 0,
    marginInlineStart: '12px',
    color: cssVar.colorText,
    whiteSpace: 'nowrap',
  },
  nameContainer: {
    overflow: 'hidden',
    flex: '1',
    minWidth: 0,
  },
});
