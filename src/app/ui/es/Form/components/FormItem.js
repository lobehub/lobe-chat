import _objectSpread from "@babel/runtime/helpers/esm/objectSpread2";
import _objectWithoutProperties from "@babel/runtime/helpers/esm/objectWithoutProperties";
import _taggedTemplateLiteral from "@babel/runtime/helpers/esm/taggedTemplateLiteral";
var _excluded = ["desc", "tag", "minWidth", "avatar", "className", "label", "children", "divider"];
var _templateObject, _templateObject2, _templateObject3, _templateObject4, _templateObject5;
import { Form } from 'antd';
import { createStyles } from 'antd-style';
import { isNumber } from 'lodash-es';
import { memo } from 'react';
import FormDivider from "./FormDivider";
import FormTitle from "./FormTitle";
import { jsx as _jsx } from "react/jsx-runtime";
import { Fragment as _Fragment } from "react/jsx-runtime";
import { jsxs as _jsxs } from "react/jsx-runtime";
var Item = Form.Item;
export var useStyles = createStyles(function (_ref, itemMinWidth) {
  var css = _ref.css,
    responsive = _ref.responsive,
    prefixCls = _ref.prefixCls;
  return {
    item: css(_templateObject || (_templateObject = _taggedTemplateLiteral(["\n      padding-block: 16px;\n      padding-inline: 0;\n\n      .", "-row {\n        justify-content: space-between;\n\n        > div {\n          flex: unset !important;\n          flex-grow: unset !important;\n        }\n      }\n\n      .", "-form-item-required::before {\n        align-self: flex-start;\n      }\n\n      ", "\n\n      ", " {\n        padding-block: 16px;\n        padding-inline: 0;\n\n        ", "\n      }\n    "])), prefixCls, prefixCls, itemMinWidth && css(_templateObject2 || (_templateObject2 = _taggedTemplateLiteral(["\n        .", "-form-item-control {\n          width: ", ";\n        }\n      "])), prefixCls, isNumber(itemMinWidth) ? "".concat(itemMinWidth, "px") : itemMinWidth), responsive.mobile, itemMinWidth ? css(_templateObject3 || (_templateObject3 = _taggedTemplateLiteral(["\n              .", "-row {\n                flex-direction: column;\n                gap: 4px;\n              }\n\n              .", "-form-item-control {\n                flex: 1;\n                width: 100%;\n              }\n            "])), prefixCls, prefixCls) : css(_templateObject4 || (_templateObject4 = _taggedTemplateLiteral(["\n              .", "-row {\n                flex-wrap: wrap;\n                gap: 4px;\n              }\n            "])), prefixCls)),
    itemNoDivider: css(_templateObject5 || (_templateObject5 = _taggedTemplateLiteral(["\n      &:not(:first-child) {\n        padding-block-start: 0;\n      }\n    "])))
  };
});
var FormItem = /*#__PURE__*/memo(function (_ref2) {
  var desc = _ref2.desc,
    tag = _ref2.tag,
    minWidth = _ref2.minWidth,
    avatar = _ref2.avatar,
    className = _ref2.className,
    label = _ref2.label,
    children = _ref2.children,
    divider = _ref2.divider,
    rest = _objectWithoutProperties(_ref2, _excluded);
  var _useStyles = useStyles(minWidth),
    cx = _useStyles.cx,
    styles = _useStyles.styles;
  return /*#__PURE__*/_jsxs(_Fragment, {
    children: [divider && /*#__PURE__*/_jsx(FormDivider, {}), /*#__PURE__*/_jsx(Item, _objectSpread(_objectSpread({
      className: cx(styles.item, !divider && styles.itemNoDivider, className),
      label: /*#__PURE__*/_jsx(FormTitle, {
        avatar: avatar,
        desc: desc,
        tag: tag,
        title: label
      })
    }, rest), {}, {
      children: children
    }))]
  });
});
export default FormItem;