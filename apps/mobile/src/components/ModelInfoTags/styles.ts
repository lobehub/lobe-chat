import { createStyles } from '@/components/styles';

export const useStyles = createStyles(({ token }) => ({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  cyanIcon: {
    color: token.colorInfo,
  },
  // 青色标签 - search
  cyanTag: {
    backgroundColor: token.colorInfoBg, // 使用信息色作为青色的替代
  },
  infoIcon: {
    color: token.colorInfo,
  },
  // 信息类型标签（蓝色）- functionCall
  infoTag: {
    backgroundColor: token.colorInfoBg,
  },
  purpleIcon: {
    color: 'rgb(189, 84, 198)',
  },
  // 紫色标签 - reasoning
  purpleTag: {
    // backgroundColor: token.colorBgElevated, // 使用主色作为紫色的替代
    backgroundColor: 'rgba(255, 15, 235, 0.08)', // 使用主色作为紫色的替代
  },
  successIcon: {
    color: token.colorSuccess,
  },
  // 成功类型标签（绿色）- files, imageOutput, vision
  successTag: {
    backgroundColor: token.colorSuccessBg,
  },
  // 基础标签样式
  tag: {
    alignItems: 'center',
    borderRadius: 4,
    height: 20,
    justifyContent: 'center',
    width: 20,
  },
  // Token 标签样式
  tokenTag: {
    backgroundColor: token.colorFillTertiary,
    marginBottom: 0,
    marginLeft: 0,
    paddingBlock: 2,
    paddingInline: 6,
  },
  tokenText: {
    color: token.colorTextSecondary,
    fontSize: 11,
    fontWeight: '500',
  },
}));
