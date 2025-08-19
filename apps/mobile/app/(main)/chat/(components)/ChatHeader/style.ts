import { HEADER_HEIGHT } from '@/const/common';
import { createStyles } from '@/theme';

export const useStyles = createStyles((token) => ({
  actionButton: {
    backgroundColor: 'transparent',
    borderRadius: token.borderRadiusXS,
    padding: token.paddingXXS,
  },
  avatar: {
    borderRadius: token.borderRadiusSM,
    height: 32,
    width: 32,
  },
  avatarEmoji: {
    alignItems: 'center' as const,
    height: 32,
    justifyContent: 'center' as const,
    width: 32,
  },
  emojiText: {
    fontSize: 32,
  },
  header: {
    alignItems: 'center',
    backgroundColor: token.colorBgLayout,
    flexDirection: 'row',
    height: HEADER_HEIGHT,
    justifyContent: 'space-between',
    paddingHorizontal: token.paddingSM,
  },
  headerActions: {
    alignItems: 'center' as const,
    flexDirection: 'row' as const,
    gap: token.marginXS,
  },
  headerContent: {
    alignItems: 'center' as const,
    flex: 1,
    paddingHorizontal: token.paddingXS,
  },
  headerInfo: {
    alignItems: 'center' as const,
    flexDirection: 'row' as const,
    gap: token.marginXS,
    maxWidth: '100%',
  },
  headerSubtitle: {
    color: token.colorTextSecondary,
    fontSize: token.fontSizeSM,
    marginTop: 2,
    maxWidth: '100%',
    textAlign: 'left' as const,
  },
  headerText: {
    alignItems: 'flex-start' as const,
    flex: 1,
  },
  headerTitle: {
    color: token.colorText,
    fontSize: token.fontSizeLG,
    fontWeight: '600' as const,
    textAlign: 'left' as const,
  },
}));
