import { createStyles } from '@/components/styles';

export const useStyles = createStyles(({ token }) => ({
  actionButtonSkeleton: {
    backgroundColor: token.colorFillSecondary,
    borderRadius: token.borderRadiusLG,
    height: token.controlHeight,
  },
  actionSection: {
    marginBottom: token.marginLG,
  },
  authorInfo: {
    flex: 1,
    gap: token.marginXS,
  },
  authorSection: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: token.margin,
  },
  authorSkeleton: {
    borderRadius: token.borderRadiusXS,
    height: token.fontHeightSM,
  },
  container: {
    padding: token.padding,
  },
  descriptionSection: {
    marginBottom: token.margin,
  },

  systemRoleContent: {
    gap: token.margin,
  },
  systemRoleHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: token.marginXS,
    marginBottom: token.margin,
  },
  systemRoleSection: {
    backgroundColor: token.colorBgContainer,
    borderRadius: token.borderRadiusLG,
    paddingHorizontal: token.margin,
    paddingVertical: token.padding,
  },
  systemRoleTitleContainer: {
    flex: 1,
    marginLeft: token.marginXS,
  },

  tagSkeleton: {
    backgroundColor: token.colorFillSecondary,
    borderRadius: token.borderRadiusLG,
    height: token.controlHeightSM,
  },
  tagsSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: token.marginXXS,
    marginBottom: token.marginLG,
  },
  titleSection: {
    marginBottom: token.margin,
  },
  titleSkeleton: {
    borderRadius: token.borderRadiusSM,
    height: token.fontHeightLG,
  },
}));
