import _objectSpread from "@babel/runtime/helpers/esm/objectSpread2";
import _objectWithoutProperties from "@babel/runtime/helpers/esm/objectWithoutProperties";
var _excluded = ["style"];
import { Divider as AntDivider } from 'antd';
import { memo } from 'react';
import { jsx as _jsx } from "react/jsx-runtime";
var Divider = /*#__PURE__*/memo(function (_ref) {
  var style = _ref.style,
    rest = _objectWithoutProperties(_ref, _excluded);
  return /*#__PURE__*/_jsx(AntDivider, _objectSpread({
    style: _objectSpread({
      margin: 0,
      opacity: 0.5
    }, style)
  }, rest));
});
export default Divider;