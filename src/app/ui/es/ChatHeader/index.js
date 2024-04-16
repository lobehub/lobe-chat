'use client';

import { ChevronLeft } from 'lucide-react';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';
import ActionIcon from "../ActionIcon";
import { useStyles } from "./style";
import { jsx as _jsx } from "react/jsx-runtime";
import { jsxs as _jsxs } from "react/jsx-runtime";
var ChatHeader = /*#__PURE__*/memo(function (_ref) {
  var left = _ref.left,
    right = _ref.right,
    className = _ref.className,
    style = _ref.style,
    contentStyles = _ref.contentStyles,
    classNames = _ref.classNames,
    showBackButton = _ref.showBackButton,
    onBackClick = _ref.onBackClick,
    gap = _ref.gap;
  var _useStyles = useStyles(),
    cx = _useStyles.cx,
    styles = _useStyles.styles;
  return /*#__PURE__*/_jsxs(Flexbox, {
    align: 'center',
    className: cx(styles.container, className),
    distribution: 'space-between',
    horizontal: true,
    paddingInline: 16,
    style: style,
    children: [/*#__PURE__*/_jsxs(Flexbox, {
      align: 'center',
      className: cx(styles.left, classNames === null || classNames === void 0 ? void 0 : classNames.left),
      gap: (gap === null || gap === void 0 ? void 0 : gap.left) || 12,
      horizontal: true,
      style: contentStyles === null || contentStyles === void 0 ? void 0 : contentStyles.left,
      children: [showBackButton && /*#__PURE__*/_jsx(ActionIcon, {
        icon: ChevronLeft,
        onClick: function onClick() {
          return onBackClick === null || onBackClick === void 0 ? void 0 : onBackClick();
        },
        size: {
          fontSize: 24
        },
        style: {
          marginRight: gap !== null && gap !== void 0 && gap.left ? -gap.left / 2 : -6
        }
      }), left]
    }), /*#__PURE__*/_jsx(Flexbox, {
      align: 'center',
      className: cx(styles.right, classNames === null || classNames === void 0 ? void 0 : classNames.right),
      gap: (gap === null || gap === void 0 ? void 0 : gap.right) || 8,
      horizontal: true,
      style: contentStyles === null || contentStyles === void 0 ? void 0 : contentStyles.right,
      children: right
    })]
  });
});
export default ChatHeader;