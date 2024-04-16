import _taggedTemplateLiteral from "@babel/runtime/helpers/esm/taggedTemplateLiteral";
var _templateObject, _templateObject2, _templateObject3, _templateObject4, _templateObject5, _templateObject6;
import { createStyles } from 'antd-style';
export var useStyles = createStyles(function (_ref) {
  var css = _ref.css,
    token = _ref.token,
    cx = _ref.cx;
  var hover = css(_templateObject || (_templateObject = _taggedTemplateLiteral(["\n    &:hover {\n      border-color: ", ";\n      box-shadow: 0 0 0 2px ", ";\n    }\n  "])), token.colorText, token.colorText);
  var img = cx(css(_templateObject2 || (_templateObject2 = _taggedTemplateLiteral(["\n      position: relative;\n      overflow: hidden;\n      border-radius: ", "px;\n      transition: all 100ms ", ";\n\n      &::before {\n        content: '';\n\n        position: absolute;\n        inset: 0;\n\n        display: block;\n\n        width: 100%;\n        height: 100%;\n\n        border-radius: inherit;\n        box-shadow: inset 0 0 0 2px ", ";\n      }\n    "])), token.borderRadius, token.motionEaseOut, token.colorSplit), hover);
  return {
    active: css(_templateObject3 || (_templateObject3 = _taggedTemplateLiteral(["\n      color: ", ";\n    "])), token.colorText),
    container: css(_templateObject4 || (_templateObject4 = _taggedTemplateLiteral(["\n      cursor: pointer;\n      color: ", ";\n    "])), token.colorTextDescription),
    img: img,
    imgActive: css(_templateObject5 || (_templateObject5 = _taggedTemplateLiteral(["\n      box-shadow: 0 0 0 2px ", ";\n\n      .", ":before {\n        box-shadow: none;\n      }\n    "])), token.colorTextTertiary, img),
    imgCtn: css(_templateObject6 || (_templateObject6 = _taggedTemplateLiteral(["\n      background: ", ";\n      border-radius: ", "px;\n\n      ", "\n    "])), token.colorFillTertiary, token.borderRadius, hover)
  };
});