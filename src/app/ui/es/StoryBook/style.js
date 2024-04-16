import _taggedTemplateLiteral from "@babel/runtime/helpers/esm/taggedTemplateLiteral";
var _templateObject, _templateObject2, _templateObject3, _templateObject4, _templateObject5;
import { createStyles } from 'antd-style';
export var useStyles = createStyles(function (_ref, noPadding) {
  var css = _ref.css,
    token = _ref.token,
    responsive = _ref.responsive;
  return {
    editor: css(_templateObject || (_templateObject = _taggedTemplateLiteral(["\n      width: inherit;\n      min-height: inherit;\n    "]))),
    left: css(_templateObject2 || (_templateObject2 = _taggedTemplateLiteral(["\n      overflow: auto;\n      position: relative;\n\n      ", "\n    "])), !noPadding && css(_templateObject3 || (_templateObject3 = _taggedTemplateLiteral(["\n        padding-block: 40px;\n        padding-inline: 24px;\n      "])))),
    leva: css(_templateObject4 || (_templateObject4 = _taggedTemplateLiteral(["\n      --leva-sizes-controlWidth: 66%;\n      --leva-colors-elevation1: ", ";\n      --leva-colors-elevation2: transparent;\n      --leva-colors-elevation3: ", ";\n      --leva-colors-accent1: ", ";\n      --leva-colors-accent2: ", ";\n      --leva-colors-accent3: ", ";\n      --leva-colors-highlight1: ", ";\n      --leva-colors-highlight2: ", ";\n      --leva-colors-highlight3: ", ";\n      --leva-colors-vivid1: ", ";\n      --leva-shadows-level1: unset;\n      --leva-shadows-level2: unset;\n      --leva-fonts-mono: ", ";\n\n      overflow: auto;\n\n      width: 100%;\n      height: 100%;\n      padding-block: 6px;\n      padding-inline: 0;\n\n      > div {\n        background: transparent;\n\n        > div {\n          background: transparent;\n        }\n      }\n\n      input:checked + label > svg {\n        stroke: ", ";\n      }\n\n      button {\n        --leva-colors-accent2: ", ";\n      }\n    "])), token.colorFillSecondary, token.colorFillSecondary, token.colorPrimary, token.colorPrimaryHover, token.colorPrimaryActive, token.colorTextTertiary, token.colorTextSecondary, token.colorText, token.colorWarning, token.fontFamilyCode, token.colorBgLayout, token.colorFillSecondary),
    right: css(_templateObject5 || (_templateObject5 = _taggedTemplateLiteral(["\n      background: ", ";\n\n      ", " {\n        .draggable-panel-fixed {\n          width: 100% !important;\n        }\n      }\n    "])), token.colorBgLayout, responsive.mobile)
  };
});