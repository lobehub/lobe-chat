'use client';

import { Anchor } from 'antd';
import { memo } from 'react';
import { default as TocMobile, mapItems } from "./TocMobile";
import { useStyles } from "./style";
import { jsx as _jsx } from "react/jsx-runtime";
import { jsxs as _jsxs } from "react/jsx-runtime";
var Toc = /*#__PURE__*/memo(function (_ref) {
  var activeKey = _ref.activeKey,
    items = _ref.items,
    getContainer = _ref.getContainer,
    isMobile = _ref.isMobile,
    _ref$headerHeight = _ref.headerHeight,
    headerHeight = _ref$headerHeight === void 0 ? 64 : _ref$headerHeight,
    _ref$tocWidth = _ref.tocWidth,
    tocWidth = _ref$tocWidth === void 0 ? 176 : _ref$tocWidth;
  var _useStyles = useStyles({
      headerHeight: headerHeight,
      tocWidth: tocWidth
    }),
    styles = _useStyles.styles,
    cx = _useStyles.cx;
  if (isMobile) return /*#__PURE__*/_jsx(TocMobile, {
    activeKey: activeKey,
    getContainer: getContainer,
    headerHeight: headerHeight,
    items: items
  });
  return /*#__PURE__*/_jsxs("section", {
    className: cx(styles.container, styles.anchor),
    children: [/*#__PURE__*/_jsx("h4", {
      children: "Table of Contents"
    }), /*#__PURE__*/_jsx(Anchor, {
      getContainer: getContainer,
      items: mapItems(items),
      targetOffset: headerHeight + 12
    })]
  });
});
export default Toc;