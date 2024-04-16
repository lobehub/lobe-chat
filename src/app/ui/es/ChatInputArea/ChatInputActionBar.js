import _taggedTemplateLiteral from "@babel/runtime/helpers/esm/taggedTemplateLiteral";
var _templateObject, _templateObject2, _templateObject3;
import { createStyles, useResponsive } from 'antd-style';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';
import { jsx as _jsx } from "react/jsx-runtime";
import { jsxs as _jsxs } from "react/jsx-runtime";
var useStyles = createStyles(function (_ref) {
  var css = _ref.css,
    cx = _ref.cx,
    stylish = _ref.stylish;
  return {
    container: css(_templateObject || (_templateObject = _taggedTemplateLiteral(["\n    position: relative;\n    overflow: hidden;\n    width: 100%;\n  "]))),
    left: cx(stylish.noScrollbar, css(_templateObject2 || (_templateObject2 = _taggedTemplateLiteral(["\n      overflow: auto hidden;\n    "])))),
    right: css(_templateObject3 || (_templateObject3 = _taggedTemplateLiteral([""])))
  };
});
var ChatInputActionBar = /*#__PURE__*/memo(function (_ref2) {
  var _ref2$padding = _ref2.padding,
    padding = _ref2$padding === void 0 ? '0 16px' : _ref2$padding,
    leftAddons = _ref2.leftAddons,
    rightAddons = _ref2.rightAddons;
  var _useResponsive = useResponsive(),
    mobile = _useResponsive.mobile;
  var _useStyles = useStyles(),
    styles = _useStyles.styles;
  return /*#__PURE__*/_jsxs(Flexbox, {
    align: 'center',
    className: styles.container,
    flex: 'none',
    horizontal: true,
    justify: 'space-between',
    padding: padding,
    children: [/*#__PURE__*/_jsx(Flexbox, {
      align: 'center',
      className: styles.left,
      flex: 1,
      gap: mobile ? 0 : 4,
      horizontal: true,
      children: leftAddons
    }), /*#__PURE__*/_jsx(Flexbox, {
      align: 'center',
      className: styles.right,
      flex: 0,
      gap: mobile ? 0 : 4,
      horizontal: true,
      justify: 'flex-end',
      children: rightAddons
    })]
  });
});
export default ChatInputActionBar;