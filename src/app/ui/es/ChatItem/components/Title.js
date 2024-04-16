import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';
import { formatTime } from "../../utils/formatTime";
import { useStyles } from "../style";
import { jsx as _jsx } from "react/jsx-runtime";
import { jsxs as _jsxs } from "react/jsx-runtime";
var Title = /*#__PURE__*/memo(function (_ref) {
  var showTitle = _ref.showTitle,
    placement = _ref.placement,
    time = _ref.time,
    avatar = _ref.avatar;
  var _useStyles = useStyles({
      placement: placement,
      showTitle: showTitle,
      time: time
    }),
    styles = _useStyles.styles;
  return /*#__PURE__*/_jsxs(Flexbox, {
    className: styles.name,
    direction: placement === 'left' ? 'horizontal' : 'horizontal-reverse',
    gap: 4,
    children: [showTitle ? avatar.title || 'untitled' : undefined, time && /*#__PURE__*/_jsx("time", {
      children: formatTime(time)
    })]
  });
});
export default Title;