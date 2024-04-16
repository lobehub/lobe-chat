import { useThemeMode } from 'antd-style';
import { Loader2 } from 'lucide-react';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';
import Icon from "../../Icon";
import { useHighlight } from "../../hooks/useHighlight";
import { useStyles } from "./style";
import { jsx as _jsx } from "react/jsx-runtime";
import { Fragment as _Fragment } from "react/jsx-runtime";
import { jsxs as _jsxs } from "react/jsx-runtime";
var SyntaxHighlighter = /*#__PURE__*/memo(function (_ref) {
  var children = _ref.children,
    language = _ref.language,
    className = _ref.className,
    style = _ref.style;
  var _useStyles = useStyles(),
    styles = _useStyles.styles,
    cx = _useStyles.cx;
  var _useThemeMode = useThemeMode(),
    isDarkMode = _useThemeMode.isDarkMode;
  var _useHighlight = useHighlight(children.trim(), language, isDarkMode),
    data = _useHighlight.data,
    isLoading = _useHighlight.isLoading;
  return /*#__PURE__*/_jsxs(_Fragment, {
    children: [isLoading ? /*#__PURE__*/_jsx("div", {
      className: cx(styles.unshiki, className),
      style: style,
      children: /*#__PURE__*/_jsx("pre", {
        children: /*#__PURE__*/_jsx("code", {
          children: children.trim()
        })
      })
    }) : /*#__PURE__*/_jsx("div", {
      className: cx(styles.shiki, className),
      dangerouslySetInnerHTML: {
        __html: data
      },
      style: style
    }), isLoading && /*#__PURE__*/_jsx(Flexbox, {
      align: 'center',
      className: styles.loading,
      gap: 8,
      horizontal: true,
      justify: 'center',
      children: /*#__PURE__*/_jsx(Icon, {
        icon: Loader2,
        spin: true
      })
    })]
  });
});
export default SyntaxHighlighter;