import _taggedTemplateLiteral from "@babel/runtime/helpers/esm/taggedTemplateLiteral";
var _templateObject, _templateObject2, _templateObject3, _templateObject4, _templateObject5, _templateObject6;
import { createStyles } from 'antd-style';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';
import { jsx as _jsx } from "react/jsx-runtime";
import { jsxs as _jsxs } from "react/jsx-runtime";
var useStyles = createStyles(function (_ref) {
  var css = _ref.css,
    token = _ref.token;
  return {
    container: css(_templateObject || (_templateObject = _taggedTemplateLiteral(["\n    position: relative;\n    overflow: hidden;\n    flex: 1;\n    max-width: 100%;\n  "]))),
    desc: css(_templateObject2 || (_templateObject2 = _taggedTemplateLiteral(["\n    overflow: hidden;\n\n    width: 100%;\n\n    font-size: 12px;\n    line-height: 1;\n    color: ", ";\n    text-overflow: ellipsis;\n    white-space: nowrap;\n  "])), token.colorTextTertiary),
    tag: css(_templateObject3 || (_templateObject3 = _taggedTemplateLiteral(["\n    flex: none;\n    align-items: baseline;\n  "]))),
    title: css(_templateObject4 || (_templateObject4 = _taggedTemplateLiteral(["\n    overflow: hidden;\n\n    font-size: 16px;\n    font-weight: bold;\n    line-height: 1;\n    text-overflow: ellipsis;\n    white-space: nowrap;\n  "]))),
    titleContainer: css(_templateObject5 || (_templateObject5 = _taggedTemplateLiteral(["\n    flex: 1;\n    line-height: 1;\n  "]))),
    titleWithDesc: css(_templateObject6 || (_templateObject6 = _taggedTemplateLiteral(["\n    overflow: hidden;\n    font-weight: bold;\n    text-overflow: ellipsis;\n    white-space: nowrap;\n  "])))
  };
});
var ChatHeaderTitle = /*#__PURE__*/memo(function (_ref2) {
  var title = _ref2.title,
    desc = _ref2.desc,
    tag = _ref2.tag;
  var _useStyles = useStyles(),
    styles = _useStyles.styles;
  var tagContent = tag && /*#__PURE__*/_jsx(Flexbox, {
    align: 'center',
    className: styles.tag,
    horizontal: true,
    children: tag
  });
  if (desc) return /*#__PURE__*/_jsxs(Flexbox, {
    className: styles.container,
    gap: 4,
    children: [/*#__PURE__*/_jsxs(Flexbox, {
      align: 'center',
      className: styles.titleContainer,
      gap: 8,
      horizontal: true,
      children: [/*#__PURE__*/_jsx("div", {
        className: styles.titleWithDesc,
        children: title
      }), tagContent]
    }), /*#__PURE__*/_jsx(Flexbox, {
      align: 'center',
      className: styles.desc,
      horizontal: true,
      children: desc
    })]
  });
  return /*#__PURE__*/_jsxs(Flexbox, {
    align: 'center',
    className: styles.container,
    gap: 8,
    horizontal: true,
    children: [/*#__PURE__*/_jsx("div", {
      className: styles.title,
      children: title
    }), tagContent]
  });
});
export default ChatHeaderTitle;