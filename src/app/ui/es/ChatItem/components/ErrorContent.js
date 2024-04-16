import _objectSpread from "@babel/runtime/helpers/esm/objectSpread2";
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';
import Alert from "../../Alert";
import { useStyles } from "../style";
import { jsx as _jsx } from "react/jsx-runtime";
var ErrorContent = /*#__PURE__*/memo(function (_ref) {
  var message = _ref.message,
    error = _ref.error,
    placement = _ref.placement;
  var _useStyles = useStyles({
      placement: placement
    }),
    styles = _useStyles.styles;
  return /*#__PURE__*/_jsx(Flexbox, {
    className: styles.errorContainer,
    children: /*#__PURE__*/_jsx(Alert, _objectSpread({
      closable: false,
      extra: message,
      showIcon: true,
      type: 'error'
    }, error))
  });
});
export default ErrorContent;