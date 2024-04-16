import _taggedTemplateLiteral from "@babel/runtime/helpers/esm/taggedTemplateLiteral";
var _templateObject, _templateObject2, _templateObject3, _templateObject4, _templateObject5, _templateObject6, _templateObject7, _templateObject8, _templateObject9;
import { createStyles } from 'antd-style';
export var useStyles = createStyles(function (_ref) {
  var css = _ref.css,
    token = _ref.token;
  return {
    actions: css(_templateObject || (_templateObject = _taggedTemplateLiteral(["\n      position: absolute;\n      inset-block-start: 50%;\n      inset-inline-end: 16px;\n      transform: translateY(-50%);\n    "]))),
    active: css(_templateObject2 || (_templateObject2 = _taggedTemplateLiteral(["\n      color: ", ";\n      background-color: ", ";\n\n      &:hover {\n        background-color: ", ";\n      }\n    "])), token.colorText, token.colorFillSecondary, token.colorFill),
    container: css(_templateObject3 || (_templateObject3 = _taggedTemplateLiteral(["\n      cursor: pointer;\n      color: ", ";\n      background: transparent;\n      transition: background-color 200ms ", ";\n\n      &:active {\n        background-color: ", ";\n      }\n\n      &:hover {\n        background-color: ", ";\n      }\n    "])), token.colorTextTertiary, token.motionEaseOut, token.colorFillSecondary, token.colorFillTertiary),
    content: css(_templateObject4 || (_templateObject4 = _taggedTemplateLiteral(["\n      position: relative;\n      overflow: hidden;\n      flex: 1;\n      align-self: center;\n    "]))),
    desc: css(_templateObject5 || (_templateObject5 = _taggedTemplateLiteral(["\n      overflow: hidden;\n\n      width: 100%;\n\n      font-size: 12px;\n      line-height: 1;\n      color: ", ";\n      text-overflow: ellipsis;\n      white-space: nowrap;\n    "])), token.colorTextDescription),
    pin: css(_templateObject6 || (_templateObject6 = _taggedTemplateLiteral(["\n      position: absolute;\n      inset-block-start: 6px;\n      inset-inline-end: 6px;\n    "]))),
    time: css(_templateObject7 || (_templateObject7 = _taggedTemplateLiteral(["\n      font-size: 12px;\n      color: ", ";\n    "])), token.colorTextPlaceholder),
    title: css(_templateObject8 || (_templateObject8 = _taggedTemplateLiteral(["\n      overflow: hidden;\n\n      width: 100%;\n\n      font-size: 16px;\n      line-height: 1;\n      color: ", ";\n      text-overflow: ellipsis;\n      white-space: nowrap;\n    "])), token.colorText),
    triangle: css(_templateObject9 || (_templateObject9 = _taggedTemplateLiteral(["\n      width: 10px;\n      height: 10px;\n\n      opacity: 0.5;\n      background: ", ";\n      clip-path: polygon(0% 0%, 100% 0%, 100% 100%);\n      border-radius: 2px;\n    "])), token.colorPrimaryBorder)
  };
});