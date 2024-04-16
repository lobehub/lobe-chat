import { Loader2 } from 'lucide-react';
import { memo } from 'react';
import { Center } from 'react-layout-kit';
import Icon from "../Icon";
import { jsx as _jsx } from "react/jsx-runtime";
var Loading = /*#__PURE__*/memo(function (_ref) {
  var _ref$size = _ref.size,
    size = _ref$size === void 0 ? 32 : _ref$size;
  return /*#__PURE__*/_jsx(Center, {
    height: '100%',
    justify: 'center',
    style: {
      position: 'absolute'
    },
    width: '100%',
    children: /*#__PURE__*/_jsx(Icon, {
      icon: Loader2,
      size: {
        fontSize: size
      },
      spin: true
    })
  });
});
export default Loading;