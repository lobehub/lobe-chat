import _objectSpread from "@babel/runtime/helpers/esm/objectSpread2";
import _slicedToArray from "@babel/runtime/helpers/esm/slicedToArray";
import _objectWithoutProperties from "@babel/runtime/helpers/esm/objectWithoutProperties";
var _excluded = ["children", "language", "className", "style", "allowChangeLanguage", "fileName", "icon"];
import { Select } from 'antd';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { memo, useState } from 'react';
import { Flexbox } from 'react-layout-kit';
import ActionIcon from "../ActionIcon";
import CopyButton from "../CopyButton";
import { languageMap } from "../hooks/useHighlight";
import SyntaxHighlighter from "./SyntaxHighlighter";
import { useStyles } from "./style";
import { jsx as _jsx } from "react/jsx-runtime";
import { jsxs as _jsxs } from "react/jsx-runtime";
var options = languageMap.map(function (item) {
  return {
    label: item,
    value: item.toLowerCase()
  };
});
export var Highlighter = /*#__PURE__*/memo(function (_ref) {
  var children = _ref.children,
    _ref$language = _ref.language,
    language = _ref$language === void 0 ? 'markdown' : _ref$language,
    className = _ref.className,
    style = _ref.style,
    _ref$allowChangeLangu = _ref.allowChangeLanguage,
    allowChangeLanguage = _ref$allowChangeLangu === void 0 ? true : _ref$allowChangeLangu,
    fileName = _ref.fileName,
    icon = _ref.icon,
    rest = _objectWithoutProperties(_ref, _excluded);
  var _useState = useState(true),
    _useState2 = _slicedToArray(_useState, 2),
    expand = _useState2[0],
    setExpand = _useState2[1];
  var _useState3 = useState(language),
    _useState4 = _slicedToArray(_useState3, 2),
    lang = _useState4[0],
    setLang = _useState4[1];
  var _useStyles = useStyles('block'),
    styles = _useStyles.styles,
    cx = _useStyles.cx;
  var container = cx(styles.container, className);
  return /*#__PURE__*/_jsxs("div", _objectSpread(_objectSpread({
    className: container,
    "data-code-type": "highlighter",
    style: style
  }, rest), {}, {
    children: [/*#__PURE__*/_jsxs(Flexbox, {
      align: 'center',
      className: styles.header,
      horizontal: true,
      justify: 'space-between',
      children: [/*#__PURE__*/_jsx(ActionIcon, {
        icon: expand ? ChevronDown : ChevronRight,
        onClick: function onClick() {
          return setExpand(!expand);
        },
        size: {
          blockSize: 24,
          fontSize: 14,
          strokeWidth: 3
        }
      }), allowChangeLanguage && !fileName ? /*#__PURE__*/_jsx(Select, {
        className: styles.select,
        onSelect: setLang,
        options: options,
        size: 'small',
        suffixIcon: false,
        value: lang.toLowerCase(),
        variant: 'borderless'
      }) : /*#__PURE__*/_jsxs(Flexbox, {
        align: 'center',
        className: styles.select,
        gap: 2,
        horizontal: true,
        children: [icon, /*#__PURE__*/_jsx("span", {
          children: fileName || lang
        })]
      }), /*#__PURE__*/_jsx(CopyButton, {
        content: children,
        placement: "left",
        size: {
          blockSize: 24,
          fontSize: 14,
          strokeWidth: 2
        }
      })]
    }), /*#__PURE__*/_jsx(SyntaxHighlighter, {
      language: lang === null || lang === void 0 ? void 0 : lang.toLowerCase(),
      style: expand ? {} : {
        height: 0,
        overflow: 'hidden'
      },
      children: children
    })]
  }));
});
export default Highlighter;
export { default as SyntaxHighlighter } from "./SyntaxHighlighter";