import _objectSpread from "@babel/runtime/helpers/esm/objectSpread2";
import _objectWithoutProperties from "@babel/runtime/helpers/esm/objectWithoutProperties";
var _excluded = ["className"];
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';
import { useStyles } from "./style";
import { jsx as _jsx } from "react/jsx-runtime";
var DraggablePanelBody = /*#__PURE__*/memo(function (_ref) {
  var className = _ref.className,
    rest = _objectWithoutProperties(_ref, _excluded);
  var _useStyles = useStyles(),
    cx = _useStyles.cx,
    styles = _useStyles.styles;
  return /*#__PURE__*/_jsx(Flexbox, _objectSpread({
    className: cx(styles.body, className),
    flex: 1
  }, rest));
});
export default DraggablePanelBody;