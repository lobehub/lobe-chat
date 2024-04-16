import _taggedTemplateLiteral from "@babel/runtime/helpers/esm/taggedTemplateLiteral";
var _templateObject, _templateObject2, _templateObject3, _templateObject4, _templateObject5;
import { createStyles } from 'antd-style';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';
import { jsx as _jsx } from "react/jsx-runtime";
import { jsxs as _jsxs } from "react/jsx-runtime";
var useStyles = createStyles(function (_ref) {
  var css = _ref.css,
    token = _ref.token;
  return {
    desc: css(_templateObject || (_templateObject = _taggedTemplateLiteral(["\n    overflow: hidden;\n\n    width: 100%;\n\n    font-size: 12px;\n    line-height: 1;\n    color: ", ";\n    text-overflow: ellipsis;\n    white-space: nowrap;\n  "])), token.colorTextTertiary),
    tag: css(_templateObject2 || (_templateObject2 = _taggedTemplateLiteral(["\n    flex: none;\n  "]))),
    title: css(_templateObject3 || (_templateObject3 = _taggedTemplateLiteral(["\n    overflow: hidden;\n\n    font-size: 16px;\n    font-weight: bold;\n    line-height: 1;\n    text-overflow: ellipsis;\n    white-space: nowrap;\n  "]))),
    titleContainer: css(_templateObject4 || (_templateObject4 = _taggedTemplateLiteral(["\n    flex: 1;\n  "]))),
    titleWithDesc: css(_templateObject5 || (_templateObject5 = _taggedTemplateLiteral(["\n    overflow: hidden;\n\n    font-weight: bold;\n    line-height: 1;\n    text-overflow: ellipsis;\n    white-space: nowrap;\n  "])))
  };
});
var MobileNavBarTitle = /*#__PURE__*/memo(function (_ref2) {
  var title = _ref2.title,
    desc = _ref2.desc,
    tag = _ref2.tag;
  var _useStyles = useStyles(),
    styles = _useStyles.styles;
  if (desc) return /*#__PURE__*/_jsxs(Flexbox, {
    align: 'center',
    flex: 1,
    gap: 4,
    justify: 'center',
    children: [/*#__PURE__*/_jsxs(Flexbox, {
      align: 'center',
      className: styles.titleContainer,
      gap: 4,
      horizontal: true,
      children: [/*#__PURE__*/_jsx("div", {
        className: styles.titleWithDesc,
        children: title
      }), tag && /*#__PURE__*/_jsx(Flexbox, {
        className: styles.tag,
        horizontal: true,
        children: tag
      })]
    }), /*#__PURE__*/_jsx(Flexbox, {
      align: 'center',
      horizontal: true,
      children: /*#__PURE__*/_jsx("div", {
        className: styles.desc,
        children: desc
      })
    })]
  });
  return /*#__PURE__*/_jsxs(Flexbox, {
    align: 'center',
    flex: 1,
    gap: 4,
    horizontal: true,
    justify: 'center',
    children: [/*#__PURE__*/_jsx("div", {
      className: styles.title,
      children: title
    }), /*#__PURE__*/_jsx(Flexbox, {
      className: styles.tag,
      horizontal: true,
      children: tag
    })]
  });
});
export default MobileNavBarTitle;