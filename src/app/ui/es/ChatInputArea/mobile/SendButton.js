import { useTheme } from 'antd-style';
import { Loader2, SendHorizonal } from 'lucide-react';
import { readableColor } from 'polished';
import { memo } from 'react';
import ActionIcon from "../../ActionIcon";
import { jsx as _jsx } from "react/jsx-runtime";
var MobileChatSendButton = /*#__PURE__*/memo(function (_ref) {
  var loading = _ref.loading,
    onStop = _ref.onStop,
    onSend = _ref.onSend;
  var theme = useTheme();
  var size = {
    blockSize: 36,
    fontSize: 16
  };
  return loading ? /*#__PURE__*/_jsx(ActionIcon, {
    active: true,
    icon: Loader2,
    onClick: onStop,
    size: size,
    spin: true
  }) : /*#__PURE__*/_jsx(ActionIcon, {
    icon: SendHorizonal,
    onClick: onSend,
    size: size,
    style: {
      background: theme.colorPrimary,
      color: readableColor(theme.colorPrimary),
      flex: 'none'
    }
  });
});
export default MobileChatSendButton;