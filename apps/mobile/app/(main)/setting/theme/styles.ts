import { createStyles } from '@/theme';

export const useStyles = createStyles((token) => ({
  avatar: {
    borderRadius: 5,
    height: 10,
    marginRight: 4,
    width: 10,
  },
  avatarSection: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 4,
  },
  backgroundHalf: {
    flex: 1,
  },
  chatBubble: {
    borderRadius: 4,
    height: 8,
    marginBottom: 2,
    width: '75%',
  },
  chatBubbleSmall: {
    borderRadius: 3,
    height: 6,
    width: '60%',
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 24,
  },
  contentSection: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  imageContainer: {
    backgroundColor: token.colorBgContainer,
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: 8,
    overflow: 'hidden',
  },
  leftHalf: {
    borderTopLeftRadius: 8,
  },
  phoneContent: {
    flex: 1,
    justifyContent: 'flex-start',
    padding: 4,
  },
  phoneFrame: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderRadius: 10,
    height: 108,
    marginBottom: -32,
    padding: 2,
    position: 'relative',
    width: 90,
    zIndex: 1,
  },
  phoneScreen: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderRadius: 8,
    flex: 1,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  previewContainer: {
    alignItems: 'center',
    borderRadius: 10,
    height: 120,
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
    width: 160,
  },
  rightHalf: {
    borderTopRightRadius: 8,
  },
  screenHalf: {
    flex: 1,
  },
  section: {
    marginBottom: 32,
  },
  sectionDescription: {
    color: token.colorTextSecondary,
    fontSize: 16,
    lineHeight: 24,
  },
  sectionTitle: {
    color: token.colorTextHeading,
    fontSize: 28,
    fontWeight: '600',
    marginBottom: 8,
  },
  splitBackground: {
    bottom: 0,
    flexDirection: 'row',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  statusBar: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  statusDot: {
    borderRadius: 1,
    height: 2,
    width: 2,
  },
  statusLine: {
    borderRadius: 0.5,
    height: 1,
    marginLeft: 2,
    width: 8,
  },
  statusRight: {
    flexDirection: 'row',
  },
  statusSignal: {
    borderRadius: 0.5,
    height: 2,
    width: 6,
  },
  textLine: {
    borderRadius: 0.75,
    flex: 1,
    height: 1.5,
  },
  themeOption: {
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  themeTitle: {
    color: token.colorText,
    fontSize: 16,
  },
  themesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
}));
