'use client';

import _objectSpread from "@babel/runtime/helpers/esm/objectSpread2";
import _objectWithoutProperties from "@babel/runtime/helpers/esm/objectWithoutProperties";
import _taggedTemplateLiteral from "@babel/runtime/helpers/esm/taggedTemplateLiteral";
var _excluded = ["className", "gap", "rows", "children", "maxItemWidth"];
var _templateObject;
import { createStyles } from 'antd-style';
import { isString } from 'lodash-es';
import { forwardRef } from 'react';
import { Flexbox } from 'react-layout-kit';
import { jsx as _jsx } from "react/jsx-runtime";
export var useStyles = createStyles(function (_ref, _ref2) {
  var css = _ref.css;
  var rows = _ref2.rows,
    maxItemWidth = _ref2.maxItemWidth,
    gap = _ref2.gap;
  return {
    container: css(_templateObject || (_templateObject = _taggedTemplateLiteral(["\n        --rows: ", ";\n        --max-item-width: ", ";\n        --gap: ", ";\n\n        display: grid !important;\n        grid-template-columns: repeat(\n          auto-fill,\n          minmax(\n            max(var(--max-item-width), calc((100% - var(--gap) * (var(--rows) - 1)) / var(--rows))),\n            1fr\n          )\n        );\n      "])), rows, isString(maxItemWidth) ? maxItemWidth : "".concat(maxItemWidth, "px"), isString(gap) ? gap : "".concat(gap, "px"))
  };
});
var Grid = /*#__PURE__*/forwardRef(function (_ref3, ref) {
  var className = _ref3.className,
    _ref3$gap = _ref3.gap,
    gap = _ref3$gap === void 0 ? '1em' : _ref3$gap,
    _ref3$rows = _ref3.rows,
    rows = _ref3$rows === void 0 ? 3 : _ref3$rows,
    children = _ref3.children,
    _ref3$maxItemWidth = _ref3.maxItemWidth,
    maxItemWidth = _ref3$maxItemWidth === void 0 ? 240 : _ref3$maxItemWidth,
    rest = _objectWithoutProperties(_ref3, _excluded);
  var _useStyles = useStyles({
      gap: gap,
      maxItemWidth: maxItemWidth,
      rows: rows
    }),
    cx = _useStyles.cx,
    styles = _useStyles.styles;
  return /*#__PURE__*/_jsx(Flexbox, _objectSpread(_objectSpread({
    className: cx(styles.container, className),
    gap: gap,
    ref: ref
  }, rest), {}, {
    children: children
  }));
});
export default Grid;