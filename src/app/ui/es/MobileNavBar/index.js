'use client';

import { ChevronLeft } from 'lucide-react';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';
import ActionIcon from "../ActionIcon";
import MobileSafeArea from "../MobileSafeArea";
import { useStyles } from "./style";
import { jsx as _jsx } from "react/jsx-runtime";
import { jsxs as _jsxs } from "react/jsx-runtime";
var MobileNavBar = /*#__PURE__*/memo(function (_ref) {
  var className = _ref.className,
    _ref$safeArea = _ref.safeArea,
    safeArea = _ref$safeArea === void 0 ? true : _ref$safeArea,
    style = _ref.style,
    center = _ref.center,
    left = _ref.left,
    right = _ref.right,
    gap = _ref.gap,
    classNames = _ref.classNames,
    onBackClick = _ref.onBackClick,
    showBackButton = _ref.showBackButton,
    contentStyles = _ref.contentStyles;
  var _useStyles = useStyles(),
    styles = _useStyles.styles,
    cx = _useStyles.cx;
  return /*#__PURE__*/_jsxs(Flexbox, {
    className: cx(styles.container, className),
    style: style,
    children: [safeArea && /*#__PURE__*/_jsx(MobileSafeArea, {
      position: 'top'
    }), /*#__PURE__*/_jsxs(Flexbox, {
      align: 'center',
      className: styles.inner,
      flex: 1,
      horizontal: true,
      justify: 'space-between',
      children: [/*#__PURE__*/_jsxs(Flexbox, {
        align: 'center',
        className: cx(styles.left, classNames === null || classNames === void 0 ? void 0 : classNames.left),
        flex: 1,
        gap: gap === null || gap === void 0 ? void 0 : gap.left,
        horizontal: true,
        style: contentStyles === null || contentStyles === void 0 ? void 0 : contentStyles.left,
        children: [showBackButton && /*#__PURE__*/_jsx(ActionIcon, {
          icon: ChevronLeft,
          onClick: function onClick() {
            return onBackClick === null || onBackClick === void 0 ? void 0 : onBackClick();
          },
          size: {
            fontSize: 24
          }
        }), left]
      }), /*#__PURE__*/_jsx(Flexbox, {
        align: 'center',
        className: cx(styles.center, classNames === null || classNames === void 0 ? void 0 : classNames.center),
        flex: 1,
        gap: gap === null || gap === void 0 ? void 0 : gap.center,
        horizontal: true,
        justify: 'center',
        style: contentStyles === null || contentStyles === void 0 ? void 0 : contentStyles.center,
        children: center
      }), /*#__PURE__*/_jsx(Flexbox, {
        align: 'center',
        className: cx(styles.right, classNames === null || classNames === void 0 ? void 0 : classNames.right),
        flex: 1,
        gap: gap === null || gap === void 0 ? void 0 : gap.right,
        horizontal: true,
        style: contentStyles === null || contentStyles === void 0 ? void 0 : contentStyles.right,
        children: right
      })]
    })]
  });
});
export default MobileNavBar;