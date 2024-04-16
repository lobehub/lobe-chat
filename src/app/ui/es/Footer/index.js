'use client';

import RcFooter from 'rc-footer';
import { memo } from 'react';
import { useStyles } from "./style";
import { jsx as _jsx } from "react/jsx-runtime";
var Footer = /*#__PURE__*/memo(function (_ref) {
  var columns = _ref.columns,
    bottom = _ref.bottom,
    theme = _ref.theme,
    _ref$contentMaxWidth = _ref.contentMaxWidth,
    contentMaxWidth = _ref$contentMaxWidth === void 0 ? 960 : _ref$contentMaxWidth;
  var isEmpty = !columns || (columns === null || columns === void 0 ? void 0 : columns.length) === 0;
  var _useStyles = useStyles({
      contentMaxWidth: contentMaxWidth,
      isEmpty: isEmpty
    }),
    styles = _useStyles.styles;
  return /*#__PURE__*/_jsx("section", {
    className: styles.container,
    children: /*#__PURE__*/_jsx(RcFooter, {
      bottom: bottom,
      className: styles.footer,
      columns: columns,
      theme: theme
    })
  });
});
export default Footer;