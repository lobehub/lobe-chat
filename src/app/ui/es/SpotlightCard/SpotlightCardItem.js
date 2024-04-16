import _objectSpread from "@babel/runtime/helpers/esm/objectSpread2";
import _objectWithoutProperties from "@babel/runtime/helpers/esm/objectWithoutProperties";
var _excluded = ["children", "className", "style", "borderRadius", "size"];
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';
import { useStyles } from "./style";
import { jsx as _jsx } from "react/jsx-runtime";
var SpotlightCardItem = /*#__PURE__*/memo(function (_ref) {
  var children = _ref.children,
    className = _ref.className,
    style = _ref.style,
    borderRadius = _ref.borderRadius,
    size = _ref.size,
    rest = _objectWithoutProperties(_ref, _excluded);
  var _useStyles = useStyles({
      borderRadius: borderRadius,
      size: size
    }),
    styles = _useStyles.styles,
    cx = _useStyles.cx;
  return /*#__PURE__*/_jsx(Flexbox, _objectSpread(_objectSpread({
    className: cx(styles.itemContainer, className),
    style: _objectSpread({
      borderRadius: borderRadius
    }, style)
  }, rest), {}, {
    children: /*#__PURE__*/_jsx(Flexbox, {
      className: styles.content,
      children: children
    })
  }));
});
export default SpotlightCardItem;