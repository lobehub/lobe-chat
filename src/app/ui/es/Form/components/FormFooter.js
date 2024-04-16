import _objectSpread from "@babel/runtime/helpers/esm/objectSpread2";
import _objectWithoutProperties from "@babel/runtime/helpers/esm/objectWithoutProperties";
var _excluded = ["className", "children"];
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';
import { jsx as _jsx } from "react/jsx-runtime";
var FormFooter = /*#__PURE__*/memo(function (_ref) {
  var className = _ref.className,
    children = _ref.children,
    rest = _objectWithoutProperties(_ref, _excluded);
  return /*#__PURE__*/_jsx(Flexbox, _objectSpread(_objectSpread({
    className: className,
    gap: 8,
    justify: 'flex-end'
  }, rest), {}, {
    horizontal: true,
    children: children
  }));
});
export default FormFooter;