import _taggedTemplateLiteral from "@babel/runtime/helpers/esm/taggedTemplateLiteral";
var _templateObject;
import { createStyles } from 'antd-style';
export var useStyles = createStyles(function (_ref, _ref2) {
  var _offset$x, _offset$y;
  var css = _ref.css,
    token = _ref.token,
    isDarkMode = _ref.isDarkMode;
  var offset = _ref2.offset,
    outside = _ref2.outside,
    size = _ref2.size;
  var spotlightX = ((_offset$x = offset === null || offset === void 0 ? void 0 : offset.x) !== null && _offset$x !== void 0 ? _offset$x : 0) + 'px';
  var spotlightY = ((_offset$y = offset === null || offset === void 0 ? void 0 : offset.y) !== null && _offset$y !== void 0 ? _offset$y : 0) + 'px';
  var spotlightOpacity = outside ? '0' : '.1';
  var spotlightSize = size + 'px';
  return css(_templateObject || (_templateObject = _taggedTemplateLiteral(["\n      pointer-events: none;\n\n      position: absolute;\n      z-index: 1;\n      inset: 0;\n\n      opacity: ", ";\n      background: radial-gradient(\n        ", " circle at ", " ", ",\n        ", ",\n        ", "\n      );\n      border-radius: inherit;\n\n      transition: all 0.2s;\n    "])), spotlightOpacity, spotlightSize, spotlightX, spotlightY, isDarkMode ? token.colorText : '#fff', isDarkMode ? 'transparent' : token.colorTextQuaternary);
});