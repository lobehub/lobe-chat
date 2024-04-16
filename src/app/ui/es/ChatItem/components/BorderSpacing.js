import { memo } from 'react';
import { jsx as _jsx } from "react/jsx-runtime";
var BorderSpacing = /*#__PURE__*/memo(function (_ref) {
  var borderSpacing = _ref.borderSpacing;
  if (!borderSpacing) return null;
  return /*#__PURE__*/_jsx("div", {
    style: {
      flex: 'none',
      width: borderSpacing
    }
  });
});
export default BorderSpacing;