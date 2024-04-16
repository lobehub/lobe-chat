var FONT_EMOJI = "\"Segoe UI Emoji\",\"Segoe UI Symbol\",\"Apple Color Emoji\",\"Twemoji Mozilla\",\"Noto Color Emoji\",\"Android Emoji\"";
var FONT_EN = "\"HarmonyOS Sans\",\"Segoe UI\",\"SF Pro Display\",-apple-system,BlinkMacSystemFont,Roboto,Oxygen,Ubuntu,Cantarell,\"Open Sans\",\"Helvetica Neue\",sans-serif";
var FONT_CN = "\"HarmonyOS Sans SC\",\"PingFang SC\",\"Hiragino Sans GB\",\"Microsoft Yahei UI\",\"Microsoft Yahei\",\"Source Han Sans CN\",sans-serif";
var FONT_CODE = "Hack,ui-monospace,SFMono-Regular,SF Mono,Menlo,Consolas,Liberation Mono,monospace";
export var baseToken = {
  borderRadius: 5,
  borderRadiusLG: 8,
  borderRadiusSM: 3,
  borderRadiusXS: 3,
  controlHeight: 36,
  fontFamily: [FONT_EN, FONT_CN, FONT_EMOJI].join(','),
  fontFamilyCode: [FONT_CODE, FONT_CN, FONT_EMOJI].join(',')
};