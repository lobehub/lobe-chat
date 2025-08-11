import { createStyles } from '@/theme';

export const useStyles = createStyles((token) => ({
  checkMark: {
    fontSize: 18,
    fontWeight: '600',
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  manualThemeContainer: {
    marginTop: 20,
  },
  settingIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  settingItem: {
    alignItems: 'center',
    backgroundColor: token.colorBgContainer,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  settingLeft: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  themeOptionButton: {
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  themeOptionIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  themeOptionLeft: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  themeOptionTitle: {
    color: token.colorText,
    fontSize: 16,
    fontWeight: '500',
  },
}));
