import _taggedTemplateLiteral from "@babel/runtime/helpers/esm/taggedTemplateLiteral";
var _templateObject;
import { createStyles } from 'antd-style';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';
import Tag from "../../Tag";
import { jsx as _jsx } from "react/jsx-runtime";
import { jsxs as _jsxs } from "react/jsx-runtime";
export var useStyles = createStyles(function (_ref) {
  var css = _ref.css,
    token = _ref.token,
    prefixCls = _ref.prefixCls;
  return {
    formTitle: css(_templateObject || (_templateObject = _taggedTemplateLiteral(["\n    position: relative;\n    text-align: start;\n\n    > div {\n      font-weight: 500;\n      line-height: 1;\n    }\n\n    > small {\n      display: block;\n\n      line-height: 1.2;\n      color: ", ";\n      word-wrap: break-word;\n      white-space: pre-wrap;\n    }\n\n    .", "-tag {\n      font-family: ", ";\n    }\n  "])), token.colorTextDescription, prefixCls, token.fontFamilyCode)
  };
});
var FormTitle = /*#__PURE__*/memo(function (_ref2) {
  var className = _ref2.className,
    tag = _ref2.tag,
    title = _ref2.title,
    desc = _ref2.desc,
    avatar = _ref2.avatar;
  var _useStyles = useStyles(),
    cx = _useStyles.cx,
    styles = _useStyles.styles;
  var titleNode = /*#__PURE__*/_jsxs(Flexbox, {
    className: cx(styles.formTitle, className),
    gap: 6,
    children: [/*#__PURE__*/_jsxs(Flexbox, {
      align: 'center',
      direction: 'horizontal',
      gap: 8,
      children: [title, tag && /*#__PURE__*/_jsx(Tag, {
        children: tag
      })]
    }), desc && /*#__PURE__*/_jsx("small", {
      children: desc
    })]
  });
  if (avatar) {
    return /*#__PURE__*/_jsxs(Flexbox, {
      align: "center",
      gap: 8,
      horizontal: true,
      children: [avatar, titleNode]
    });
  }
  return titleNode;
});
export default FormTitle;