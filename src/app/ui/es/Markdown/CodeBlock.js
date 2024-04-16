import _objectSpread from "@babel/runtime/helpers/esm/objectSpread2";
import _objectWithoutProperties from "@babel/runtime/helpers/esm/objectWithoutProperties";
var _excluded = ["fullFeatured"];
import { FALLBACK_LANG } from "../hooks/useHighlight";
import Pre, { PreSingleLine } from "../mdx/Pre";
import { jsx as _jsx } from "react/jsx-runtime";
var countLines = function countLines(str) {
  var regex = /\n/g;
  var matches = str.match(regex);
  return matches ? matches.length : 1;
};
var useCode = function useCode(raw) {
  if (!raw) return;
  var _raw$props = raw.props,
    children = _raw$props.children,
    className = _raw$props.className;
  if (!children) return;
  var content = (Array.isArray(children) ? children[0] : children).trim();
  var lang = (className === null || className === void 0 ? void 0 : className.replace('language-', '')) || FALLBACK_LANG;
  var isSingleLine = countLines(content) <= 1 && content.length <= 48;
  return {
    content: content,
    isSingleLine: isSingleLine,
    lang: lang
  };
};
var CodeBlock = function CodeBlock(_ref) {
  var _rest$children;
  var fullFeatured = _ref.fullFeatured,
    rest = _objectWithoutProperties(_ref, _excluded);
  var code = useCode(rest === null || rest === void 0 || (_rest$children = rest.children) === null || _rest$children === void 0 ? void 0 : _rest$children[0]);
  if (!code) return;
  if (code.isSingleLine) return /*#__PURE__*/_jsx(PreSingleLine, {
    lang: code.lang,
    children: code.content
  });
  return /*#__PURE__*/_jsx(Pre, {
    fullFeatured: fullFeatured,
    lang: code.lang,
    children: code.content
  });
};
export var CodeLite = function CodeLite(props) {
  return /*#__PURE__*/_jsx(CodeBlock, _objectSpread({}, props));
};
export var CodeFullFeatured = function CodeFullFeatured(props) {
  return /*#__PURE__*/_jsx(CodeBlock, _objectSpread({
    fullFeatured: true
  }, props));
};