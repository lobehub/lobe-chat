import { createStyles } from '@/theme';

export const useStyles = createStyles((token) => ({
  backButton: {
    marginRight: 8,
  },
  container: {
    backgroundColor: token.colorBgContainer,
    flex: 1,
    paddingBottom: 16, // 底部留白
  },
  content: {
    padding: 16,
  },
  eyeButton: {
    alignItems: 'center',
    bottom: 0,
    justifyContent: 'center',
    position: 'absolute',
    right: 8,
    top: 0,
    width: 36,
  },
  header: {
    alignItems: 'center',
    borderBottomWidth: 1,
    flexDirection: 'row',
    paddingHorizontal: 16,
  },
  headerTitle: {
    color: token.colorText,
    flex: 1,
    fontSize: 17,
    fontWeight: '600',
    marginRight: 40,
    textAlign: 'center',
  },
  hint: {
    color: token.colorTextSecondary,
    fontSize: 12,
    marginTop: 8,
  },
  input: {
    backgroundColor: token.colorBgContainer,
    borderColor: token.colorBorder,
    borderRadius: 8,
    borderWidth: 1,
    color: token.colorText,
    fontSize: 16,
    height: 44,
    paddingHorizontal: 12,
  },
  inputContainer: {
    marginBottom: 16,
    position: 'relative',
  },
  inputWithIcon: {
    paddingRight: 44,
  },
  label: {
    color: token.colorText,
    fontSize: 14,
    marginBottom: 8,
  },
  // Section样式 - 对标web端
  sectionHeader: {
    backgroundColor: token.colorBgContainer,
    paddingBottom: 8,
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  sectionSeparator: {
    backgroundColor: token.colorBgContainer,
    height: 16, // 增加section间距
  },
  sectionTitle: {
    color: token.colorText,
    fontSize: 18, // 对标web端字体大小
    fontWeight: '600',
  },
  // 卡片间分隔 - 对标web端Grid gap
  separator: {
    backgroundColor: 'transparent',
    height: 16, // 对标web端16px gap
  },
  validateButton: {
    marginTop: 16,
  },
}));
