import { HEADER_HEIGHT } from '@/const/common';
import { createStyles } from '@/theme';

export const useStyles = createStyles((token) => ({
  container: {
    backgroundColor: token.colorBgLayout,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    height: HEADER_HEIGHT,
    justifyContent: 'space-between',
    paddingHorizontal: token.paddingSM,
  },
  left: {
    alignItems: 'flex-start',
    justifyContent: 'center',
    width: 44,
  },
  right: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    width: 44,
  },
  title: {
    color: token.colorTextHeading,
    flex: 1,
    fontSize: 17,
    fontWeight: token.fontWeightStrong,
    textAlign: 'center',
  },
}));
