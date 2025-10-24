import { createStyles } from '@/components/styles';

// React Native 不支持 CSS background-image，所以我们用简化的透明背景
export const alphaBg = {
  dark: '#000000',
  light: '#ffffff',
};

export const useStyles = createStyles(({ token }) => ({
  alphaBackground: {
    // 为透明色添加棋盘格效果的近似实现
    borderColor: token.colorBorder,
    borderStyle: 'dashed' as const,
    borderWidth: 1,
  },
  colorBox: {
    height: 32,
    position: 'relative' as const,
    width: '100%',
  },
  colorColumn: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingInline: 2,
  },
  colorItem: {
    height: '100%',
    width: '100%',
  },
  colorRow: {
    alignItems: 'center',
    flexDirection: 'row' as const,
    marginVertical: 1,
    paddingBlock: 2,
  },
  container: {
    padding: 16,
  },
  content: {
    alignSelf: 'stretch',
  },
  headerRow: {
    alignItems: 'center',
    borderBottomColor: token.colorBorder,
    borderBottomWidth: 1,
    flexDirection: 'row' as const,
    paddingBottom: 8,
    paddingTop: 4,
  },
  headerText: {
    color: token.colorText,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center' as const,
  },

  indexColumn: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 40,
    paddingInline: 4,
  },
  indexText: {
    fontSize: 12,
    fontWeight: '400',
    textAlign: 'center' as const,
  },
}));
