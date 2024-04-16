'use client';

import _objectSpread from "@babel/runtime/helpers/esm/objectSpread2";
import _objectWithoutProperties from "@babel/runtime/helpers/esm/objectWithoutProperties";
var _excluded = ["children", "className", "fontSize", "headerMultiple", "marginMultiple", "lineHeight"];
import { useStyles } from "./markdown.style";
import { jsx as _jsx } from "react/jsx-runtime";
export var Typography = function Typography(_ref) {
  var children = _ref.children,
    className = _ref.className,
    fontSize = _ref.fontSize,
    headerMultiple = _ref.headerMultiple,
    marginMultiple = _ref.marginMultiple,
    lineHeight = _ref.lineHeight,
    rest = _objectWithoutProperties(_ref, _excluded);
  var _useStyles = useStyles({
      fontSize: fontSize,
      headerMultiple: headerMultiple,
      lineHeight: lineHeight,
      marginMultiple: marginMultiple
    }),
    cx = _useStyles.cx,
    styles = _useStyles.styles;
  return /*#__PURE__*/_jsx("article", _objectSpread(_objectSpread({
    className: cx(styles.__root, styles.a, styles.blockquote, styles.code, styles.details, styles.header, styles.hr, styles.img, styles.kbd, styles.list, styles.p, styles.pre, styles.strong, styles.table, styles.video, className)
  }, rest), {}, {
    children: children
  }));
};