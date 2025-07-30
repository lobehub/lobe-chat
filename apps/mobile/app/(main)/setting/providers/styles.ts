import { createStyles } from '@/mobile/theme';

export const useStyles = createStyles((token) => ({
  backButton: {
    marginRight: 8,
  },
  container: {
    backgroundColor: token.colorBgBase,
    flex: 1,
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
  validateButton: {
    marginTop: 16,
  },
}));
