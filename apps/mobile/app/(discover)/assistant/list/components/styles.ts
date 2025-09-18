import { createStyles } from '@/theme';

export const useStyles = createStyles((token) => ({
  card: {
    backgroundColor: token.colorBgContainer,
    borderColor: token.colorBorderSecondary,
    borderRadius: token.borderRadiusLG,
    borderWidth: token.lineWidth,
    marginBottom: token.margin,
    overflow: 'hidden',
  },
  cardContent: {
    padding: token.padding,
  },
  categoryTabSkeleton: {
    backgroundColor: token.colorFillSecondary,
    borderRadius: token.borderRadiusLG,
    height: token.controlHeightSM,
  },
  categoryTabs: {
    flexDirection: 'row',
    gap: token.marginXS,
    marginTop: token.marginSM,
  },
  descriptionSection: {
    marginBottom: token.marginSM,
  },
  header: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: token.paddingSM,
  },
  listWrapper: {
    paddingHorizontal: token.padding,
  },
  pageContainer: {
    flex: 1,
  },
  searchBar: {
    alignItems: 'center',
    backgroundColor: token.colorFillTertiary,
    borderRadius: token.borderRadiusLG,
    flexDirection: 'row',
    height: token.controlHeightLG,
    paddingHorizontal: token.paddingSM,
  },
  searchSection: {
    paddingHorizontal: token.padding,
    paddingVertical: token.paddingSM,
  },
  tagSkeleton: {
    backgroundColor: token.colorFillSecondary,
    borderRadius: token.borderRadiusLG,
    height: token.controlHeightSM,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: token.marginXXS,
  },
  titleContainer: {
    flex: 1,
    paddingRight: token.paddingSM,
  },
  titleSkeleton: {
    borderRadius: token.borderRadiusSM,
    height: token.fontHeightLG,
  },
  titleSkeletonWrapper: {
    marginBottom: token.marginXS,
  },
}));
