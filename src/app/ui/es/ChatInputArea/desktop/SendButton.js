import { Button } from 'antd';
import { useTheme } from 'antd-style';
import { ArrowBigUp, CornerDownLeft, Loader2 } from 'lucide-react';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';
import Icon from "../../Icon";
import { jsx as _jsx } from "react/jsx-runtime";
import { jsxs as _jsxs } from "react/jsx-runtime";
var ChatSendButton = /*#__PURE__*/memo(function (_ref) {
  var className = _ref.className,
    style = _ref.style,
    leftAddons = _ref.leftAddons,
    rightAddons = _ref.rightAddons,
    texts = _ref.texts,
    onSend = _ref.onSend,
    loading = _ref.loading,
    onStop = _ref.onStop;
  var theme = useTheme();
  return /*#__PURE__*/_jsxs(Flexbox, {
    align: 'end',
    className: className,
    distribution: 'space-between',
    flex: 'none',
    gap: 8,
    horizontal: true,
    padding: '0 24px',
    style: style,
    children: [/*#__PURE__*/_jsx(Flexbox, {
      align: 'center',
      gap: 8,
      horizontal: true,
      children: leftAddons
    }), /*#__PURE__*/_jsxs(Flexbox, {
      align: 'center',
      gap: 8,
      horizontal: true,
      children: [/*#__PURE__*/_jsxs(Flexbox, {
        gap: 4,
        horizontal: true,
        style: {
          color: theme.colorTextDescription,
          fontSize: 12,
          marginRight: 12
        },
        children: [/*#__PURE__*/_jsx(Icon, {
          icon: CornerDownLeft
        }), /*#__PURE__*/_jsx("span", {
          children: (texts === null || texts === void 0 ? void 0 : texts.send) || 'Send'
        }), /*#__PURE__*/_jsx("span", {
          children: "/"
        }), /*#__PURE__*/_jsxs(Flexbox, {
          horizontal: true,
          children: [/*#__PURE__*/_jsx(Icon, {
            icon: ArrowBigUp
          }), /*#__PURE__*/_jsx(Icon, {
            icon: CornerDownLeft
          })]
        }), /*#__PURE__*/_jsx("span", {
          children: (texts === null || texts === void 0 ? void 0 : texts.warp) || 'Warp'
        })]
      }), rightAddons, loading ? /*#__PURE__*/_jsx(Button, {
        icon: loading && /*#__PURE__*/_jsx(Icon, {
          icon: Loader2,
          spin: true
        }),
        onClick: onStop,
        children: (texts === null || texts === void 0 ? void 0 : texts.stop) || 'Stop'
      }) : /*#__PURE__*/_jsx(Button, {
        onClick: onSend,
        type: 'primary',
        children: (texts === null || texts === void 0 ? void 0 : texts.send) || 'Send'
      })]
    })]
  });
});
export default ChatSendButton;