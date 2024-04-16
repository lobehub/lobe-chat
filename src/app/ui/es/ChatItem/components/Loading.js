import { Loader2 } from 'lucide-react';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';
import Icon from "../../Icon";
import { useStyles } from "../style";
import { jsx as _jsx } from "react/jsx-runtime";
var Loading = /*#__PURE__*/memo(function (_ref) {
  var loading = _ref.loading,
    placement = _ref.placement;
  var _useStyles = useStyles({
      placement: placement
    }),
    styles = _useStyles.styles;
  if (!loading) return null;
  return /*#__PURE__*/_jsx(Flexbox, {
    align: 'center',
    className: styles.loading,
    justify: 'center',
    children: /*#__PURE__*/_jsx(Icon, {
      icon: Loader2,
      size: {
        fontSize: 12,
        strokeWidth: 3
      },
      spin: true
    })
  });
});
export default Loading;