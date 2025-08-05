import { createStyles } from '@/theme';

export const useStyles = createStyles((token) => ({
  abilitiesContainer: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
  },
  abilityTag: {
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  checkIcon: {
    marginLeft: 12,
  },
  closeButton: {
    backgroundColor: token.colorFillTertiary,
    borderRadius: 20,
    padding: 8,
  },
  container: {
    backgroundColor: token.colorBgContainer,
    flex: 1,
  },
  emptyContent: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
  },
  emptyModelItem: {
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  emptyProviderItem: {
    alignItems: 'center',
    marginVertical: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  emptyText: {
    color: token.colorTextTertiary,
    fontSize: 16,
    textAlign: 'center',
  },
  errorText: {
    color: token.colorError,
    fontSize: 16,
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
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    color: token.colorText,
    fontSize: 18,
    fontWeight: '600',
  },
  loadingText: {
    color: token.colorTextSecondary,
    fontSize: 16,
    textAlign: 'center',
  },
  modelInfo: {
    flex: 1,
  },
  modelItem: {
    alignItems: 'center',
    borderRadius: 8,
    flexDirection: 'row',
    marginBottom: 4,
    marginHorizontal: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    position: 'relative',
  },
  modelItemNormal: {
    backgroundColor: 'transparent',
  },
  modelItemSelected: {
    backgroundColor: token.colorPrimaryBg,
  },
  modelList: {
    paddingTop: 8,
  },
  modelName: {
    fontSize: 16,
  },
  modelNameNormal: {
    color: token.colorText,
    fontWeight: '400',
  },
  modelNameSelected: {
    color: token.colorPrimaryText,
    fontWeight: '600',
  },
  providerGroup: {
    marginBottom: 24,
  },
  providerHeader: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  providerTitle: {
    color: token.colorTextSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 16,
  },
  selectedIndicator: {
    backgroundColor: token.colorPrimary,
    borderRadius: 2,
    height: 4,
    position: 'absolute',
    right: 8,
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
    fontSize: 14,
    marginTop: 8,
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
