import _taggedTemplateLiteral from "@babel/runtime/helpers/esm/taggedTemplateLiteral";
var _templateObject, _templateObject2, _templateObject3, _templateObject4, _templateObject5, _templateObject6;
import { createStyles } from 'antd-style';
import { rgba } from 'polished';
export var useStyles = createStyles(function (_ref) {
  var css = _ref.css,
    token = _ref.token,
    cx = _ref.cx,
    stylish = _ref.stylish;
  var _ref2 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
    minSize = _ref2.minSize,
    size = _ref2.size,
    alwaysShowActions = _ref2.alwaysShowActions,
    objectFit = _ref2.objectFit,
    borderless = _ref2.borderless;
  var SIZE = typeof size === 'number' ? "".concat(size, "px") : size;
  var MIN_SIZE = typeof minSize === 'number' ? "".concat(minSize, "px") : minSize;
  var actions = cx(css(_templateObject || (_templateObject = _taggedTemplateLiteral(["\n      cursor: pointer;\n\n      position: absolute;\n      z-index: 1;\n      inset-block-start: 0;\n      inset-inline-end: 0;\n\n      opacity: ", ";\n    "])), alwaysShowActions ? 1 : 0));
  return {
    actions: actions,
    image: css(_templateObject2 || (_templateObject2 = _taggedTemplateLiteral(["\n        position: relative;\n        overflow: hidden;\n        width: 100% !important;\n        height: auto !important;\n\n        img {\n          width: 100% !important;\n          min-width: ", " !important;\n          max-width: ", " !important;\n          height: auto !important;\n          min-height: ", " !important;\n          max-height: ", " !important;\n\n          object-fit: ", ";\n        }\n      "])), MIN_SIZE, SIZE, MIN_SIZE, SIZE, objectFit || 'cover'),
    imageWrapper: cx(borderless ? css(_templateObject3 || (_templateObject3 = _taggedTemplateLiteral(["\n              box-shadow: inset 0 0 0 1px ", ";\n            "])), token.colorBorderSecondary) : css(_templateObject4 || (_templateObject4 = _taggedTemplateLiteral(["\n              box-shadow: 0 0 0 1px ", ";\n            "])), token.colorBorderSecondary), css(_templateObject5 || (_templateObject5 = _taggedTemplateLiteral(["\n          cursor: pointer;\n\n          position: relative;\n\n          overflow: hidden;\n\n          min-width: ", ";\n          max-width: ", ";\n          min-height: ", ";\n          max-height: ", ";\n          margin-block: 0 1em;\n\n          background: ", ";\n          border-radius: ", "px;\n\n          &:hover {\n            .", " {\n              opacity: 1;\n            }\n          }\n        "])), MIN_SIZE, SIZE, MIN_SIZE, SIZE, token.colorFillTertiary, token.borderRadiusLG, actions)),
    toolbar: cx(stylish.blur, css(_templateObject6 || (_templateObject6 = _taggedTemplateLiteral(["\n          padding: 4px;\n          background: ", ";\n          border-radius: ", "px;\n        "])), rgba(token.colorBgMask, 0.1), token.borderRadiusLG))
  };
});