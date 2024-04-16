import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';
import { useStyles } from "../style";
import { jsx as _jsx } from "react/jsx-runtime";
var Actions = /*#__PURE__*/memo(function (_ref) {
  var actions = _ref.actions,
    placement = _ref.placement,
    type = _ref.type,
    editing = _ref.editing;
  var _useStyles = useStyles({
      editing: editing,
      placement: placement,
      type: type
    }),
    styles = _useStyles.styles;
  return /*#__PURE__*/_jsx(Flexbox, {
    align: 'flex-start',
    className: styles.actions,
    role: "menubar",
    children: actions
  });
});
export default Actions;