import _taggedTemplateLiteral from "@babel/runtime/helpers/esm/taggedTemplateLiteral";
var _templateObject, _templateObject2, _templateObject3, _templateObject4, _templateObject5;
import { createStyles } from 'antd-style';
export var useStyles = createStyles(function (_ref) {
  var css = _ref.css,
    token = _ref.token,
    cx = _ref.cx;
  var _ref2 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
    minSize = _ref2.minSize,
    size = _ref2.size,
    borderless = _ref2.borderless;
  var SIZE = typeof size === 'number' ? "".concat(size, "px") : size;
  var MIN_SIZE = typeof minSize === 'number' ? "".concat(minSize, "px") : minSize;
  var preview = cx(css(_templateObject || (_templateObject = _taggedTemplateLiteral(["\n      pointer-events: none;\n\n      position: absolute;\n      z-index: 1;\n      inset: 0;\n\n      width: 100%;\n      height: auto;\n\n      opacity: 0;\n      background: rgba(0, 0, 0, 50%);\n\n      transition: opacity 0.3s;\n    "]))));
  return {
    preview: preview,
    video: css(_templateObject2 || (_templateObject2 = _taggedTemplateLiteral(["\n        cursor: pointer;\n        width: 100%;\n      "]))),
    videoWrapper: cx(borderless ? css(_templateObject3 || (_templateObject3 = _taggedTemplateLiteral(["\n              box-shadow: inset 0 0 0 1px ", ";\n            "])), token.colorBorderSecondary) : css(_templateObject4 || (_templateObject4 = _taggedTemplateLiteral(["\n              box-shadow: 0 0 0 1px ", ";\n            "])), token.colorBorderSecondary), css(_templateObject5 || (_templateObject5 = _taggedTemplateLiteral(["\n          position: relative;\n\n          overflow: hidden;\n\n          width: 100%;\n          min-width: ", ";\n          max-width: ", ";\n          height: auto;\n          min-height: ", ";\n          max-height: ", ";\n          margin-block: 0 1em;\n\n          background: ", ";\n          border-radius: ", "px;\n\n          &:hover {\n            .", " {\n              opacity: 1;\n            }\n          }\n        "])), MIN_SIZE, SIZE, MIN_SIZE, SIZE, token.colorFillTertiary, token.borderRadiusLG, preview))
  };
});