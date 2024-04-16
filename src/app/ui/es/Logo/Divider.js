import _objectSpread from "@babel/runtime/helpers/esm/objectSpread2";
import _objectDestructuringEmpty from "@babel/runtime/helpers/esm/objectDestructuringEmpty";
import { memo } from 'react';
import { jsx as _jsx } from "react/jsx-runtime";
var Divider = /*#__PURE__*/memo(function (_ref) {
  var rest = Object.assign({}, (_objectDestructuringEmpty(_ref), _ref));
  return /*#__PURE__*/_jsx("svg", _objectSpread(_objectSpread({
    fill: "none",
    shapeRendering: "geometricPrecision",
    stroke: "currentColor",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    viewBox: "0 0 24 24"
  }, rest), {}, {
    children: /*#__PURE__*/_jsx("path", {
      d: "M16.88 3.549L7.12 20.451"
    })
  }));
});
export default Divider;