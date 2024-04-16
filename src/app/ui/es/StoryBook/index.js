'use client';

import _objectSpread from "@babel/runtime/helpers/esm/objectSpread2";
import _objectWithoutProperties from "@babel/runtime/helpers/esm/objectWithoutProperties";
var _excluded = ["levaStore", "noPadding", "className", "children"];
import { useResponsive } from 'antd-style';
import { LevaPanel } from 'leva';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';
import DraggablePanel from "../DraggablePanel";
import { useStyles } from "./style";
import { jsx as _jsx } from "react/jsx-runtime";
import { jsxs as _jsxs } from "react/jsx-runtime";
export var StoryBook = /*#__PURE__*/memo(function (_ref) {
  var levaStore = _ref.levaStore,
    noPadding = _ref.noPadding,
    className = _ref.className,
    children = _ref.children,
    rest = _objectWithoutProperties(_ref, _excluded);
  var _useResponsive = useResponsive(),
    mobile = _useResponsive.mobile;
  var _useStyles = useStyles(Boolean(noPadding)),
    styles = _useStyles.styles,
    cx = _useStyles.cx;
  return /*#__PURE__*/_jsxs(Flexbox, _objectSpread(_objectSpread({
    align: 'stretch',
    className: cx(styles.editor, className),
    horizontal: !mobile,
    justify: 'stretch'
  }, rest), {}, {
    children: [/*#__PURE__*/_jsx(Flexbox, {
      align: 'center',
      className: styles.left,
      flex: 1,
      justify: 'center',
      children: children
    }), /*#__PURE__*/_jsx(DraggablePanel, {
      className: styles.right,
      minWidth: 280,
      placement: mobile ? 'bottom' : 'right',
      children: /*#__PURE__*/_jsxs("div", {
        className: styles.leva,
        children: [/*#__PURE__*/_jsx(LevaPanel, {
          fill: true,
          flat: true,
          store: levaStore,
          titleBar: false
        }), ' ']
      })
    })]
  }));
});
export default StoryBook;
export { useControls, useCreateStore } from 'leva';