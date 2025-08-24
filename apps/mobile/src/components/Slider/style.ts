import { createStyles } from '@/theme';

export const useStyles = createStyles((token, { disabled }: { disabled: boolean }) => ({
  activeTrack: {
    backgroundColor: disabled ? token.colorPrimaryBorder : token.colorPrimary,
    borderRadius: token.borderRadiusSM,
    height: '100%',
    left: 0,
    position: 'absolute',
    top: 0,
  },
  container: {
    paddingHorizontal: token.paddingXS,
    paddingVertical: token.paddingSM,
  },
  thumb: {
    backgroundColor: disabled ? token.colorBgContainerDisabled : token.colorBgElevated,
    borderColor: disabled ? token.colorBorder : token.colorPrimary,
    borderRadius: 10,
    borderWidth: 2,
    height: 20,
    marginLeft: -10,
    marginTop: -8,
    position: 'absolute',
    shadowColor: token.colorTextSecondary,
    shadowOffset: { height: 2, width: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    top: 0,
    width: 20,
  },
  track: {
    backgroundColor: disabled ? token.colorBgContainerDisabled : token.colorBgContainer,
    borderRadius: token.borderRadiusSM,
    height: 4,
    position: 'relative',
    width: '100%',
  },
}));
