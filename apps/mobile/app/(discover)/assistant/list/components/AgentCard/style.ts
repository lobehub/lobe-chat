import { createStyles } from '@/theme';

export const useStyles = createStyles((token) => ({
  authorContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: token.marginXS,
  },
  authorName: {
    color: token.colorTextSecondary,
    fontSize: token.fontSizeSM,
  },
  avatar: {
    fontSize: token.fontSizeIcon,
  },
  card: {
    backgroundColor: token.colorBgContainer,
    borderColor: token.colorBorderSecondary,
    borderRadius: token.borderRadiusLG,
    borderWidth: token.lineWidth,
    overflow: 'hidden',
  },
  cardContent: {
    padding: token.margin,
  },
  cardLink: {
    marginBottom: token.margin,
    width: '100%',
  },
  date: {
    fontSize: token.fontSizeSM,
    opacity: token.opacityImage,
  },
  description: {
    color: token.colorTextSecondary,
    fontSize: token.fontSizeSM,
    lineHeight: token.lineHeightSM,
    marginBottom: token.paddingSM,
  },
  headerContainer: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: token.paddingSM,
  },
  name: {
    color: token.colorText,
    fontSize: token.fontSizeXL,
    fontWeight: token.fontWeightStrong,
    marginBottom: token.marginXS,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginLeft: -token.marginXXS,
  },
  titleContainer: {
    flex: 1,
    paddingRight: token.paddingSM,
  },
}));
