import { HEADER_HEIGHT } from '@/_const/common';
import { createStyles } from '@/components/styles';

export const useStyles = createStyles(() => ({
  bottomViewport: {
    justifyContent: 'flex-end',
    paddingBottom: HEADER_HEIGHT * 2,
  },
  message: {
    flex: 1,
  },
  toast: {
    width: '100%',
  },
  toastContainer: {
    alignSelf: 'center',
    marginVertical: 4,
    position: 'absolute',
    width: '100%',
  },
  topViewport: {
    justifyContent: 'flex-start',
    paddingTop: HEADER_HEIGHT,
  },
  viewport: {
    inset: 0,
    padding: 16,
    pointerEvents: 'box-none',
    position: 'absolute',
    zIndex: 9999,
  },
}));
