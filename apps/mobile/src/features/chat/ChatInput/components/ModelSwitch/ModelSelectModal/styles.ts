import { createStyles } from '@/theme';

export const useStyles = createStyles((token) => ({
  abilitiesContainer: {
    flexDirection: 'row',
    gap: 6,
    marginTop: token.marginXXS,
  },
  abilityTag: {
    borderRadius: token.borderRadiusSM,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  checkIcon: {
    marginLeft: token.marginSM,
  },
  closeButton: {
    backgroundColor: token.colorFillTertiary,
    borderRadius: 20,
    padding: token.paddingXS,
  },
  container: {
    backgroundColor: token.colorBgContainer,
    flex: 1,
  },
  emptyContent: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: token.marginXS,
    justifyContent: 'center',
  },
  emptyModelItem: {
    alignItems: 'center',
    marginHorizontal: token.margin,
    marginVertical: token.marginXS,
    paddingHorizontal: token.padding,
    paddingVertical: token.paddingSM,
  },
  emptyProviderItem: {
    alignItems: 'center',
    marginVertical: token.marginXS,
    paddingHorizontal: token.padding,
    paddingVertical: token.paddingSM,
  },
  emptyText: {
    color: token.colorTextTertiary,
    fontSize: token.fontSizeLG,
    textAlign: 'center',
  },
  errorText: {
    color: token.colorError,
    fontSize: token.fontSizeLG,
    textAlign: 'center',
  },
  functionTag: {
    backgroundColor: token.colorSuccessBg,
  },
  functionTagText: {
    color: token.colorSuccess,
    fontSize: 10,
  },
  header: {
    alignItems: 'center',
    borderBottomColor: token.colorBorder,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: token.padding,
    paddingVertical: token.paddingSM,
  },
  headerTitle: {
    color: token.colorText,
    fontSize: 18,
    fontWeight: token.fontWeightStrong,
  },
  loadingText: {
    color: token.colorTextSecondary,
    fontSize: token.fontSizeLG,
    textAlign: 'center',
  },
  modelInfo: {
    flex: 1,
  },
  modelItem: {
    alignItems: 'center',
    borderRadius: token.borderRadiusLG,
    flexDirection: 'row',
    marginBottom: token.marginXXS,
    marginHorizontal: token.margin,
    paddingHorizontal: token.padding,
    paddingVertical: token.paddingSM,
    position: 'relative',
  },
  modelItemNormal: {
    backgroundColor: 'transparent',
  },
  modelItemSelected: {
    backgroundColor: token.colorPrimaryBg,
  },
  modelList: {
    paddingTop: token.paddingXS,
  },
  modelName: {
    fontSize: token.fontSizeLG,
  },
  modelNameNormal: {
    color: token.colorText,
    fontWeight: '400',
  },
  modelNameSelected: {
    color: token.colorPrimaryText,
    fontWeight: token.fontWeightStrong,
  },
  providerGroup: {
    marginBottom: token.marginLG,
  },
  providerHeader: {
    flexDirection: 'row',
    itemsAlign: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: token.padding,
    paddingVertical: token.paddingXS,
  },
  providerTitle: {
    color: token.colorTextSecondary,
    fontSize: token.fontSize,
    fontWeight: token.fontWeightStrong,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: token.padding,
  },
  selectedIndicator: {
    backgroundColor: token.colorPrimary,
    borderRadius: token.borderRadiusXS,
    height: 4,
    position: 'absolute',
    right: token.marginXS,
    top: '50%',
    transform: [{ translateY: -2 }],
    width: 4,
  },
  statusContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 60,
  },
  subText: {
    color: token.colorTextQuaternary,
    fontSize: token.fontSize,
    marginTop: token.marginXS,
    textAlign: 'center',
  },
  visionTag: {
    backgroundColor: token.colorInfoBg,
  },
  visionTagText: {
    color: token.colorInfo,
    fontSize: 10,
  },
}));
