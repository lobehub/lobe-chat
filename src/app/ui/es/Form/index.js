'use client';

import _objectSpread from "@babel/runtime/helpers/esm/objectSpread2";
import _objectWithoutProperties from "@babel/runtime/helpers/esm/objectWithoutProperties";
var _excluded = ["className", "itemMinWidth", "footer", "form", "items", "children", "itemsType", "variant"];
import { Form as AntForm } from 'antd';
import { forwardRef } from 'react';
import FormFooter from "./components/FormFooter";
import FormGroup from "./components/FormGroup";
import FormItem from "./components/FormItem";
import { useStyles } from "./style";
import { jsx as _jsx } from "react/jsx-runtime";
import { jsxs as _jsxs } from "react/jsx-runtime";
var FormParent = /*#__PURE__*/forwardRef(function (_ref, ref) {
  var className = _ref.className,
    itemMinWidth = _ref.itemMinWidth,
    footer = _ref.footer,
    form = _ref.form,
    _ref$items = _ref.items,
    items = _ref$items === void 0 ? [] : _ref$items,
    children = _ref.children,
    _ref$itemsType = _ref.itemsType,
    itemsType = _ref$itemsType === void 0 ? 'group' : _ref$itemsType,
    _ref$variant = _ref.variant,
    variant = _ref$variant === void 0 ? 'default' : _ref$variant,
    rest = _objectWithoutProperties(_ref, _excluded);
  var _useStyles = useStyles(),
    cx = _useStyles.cx,
    styles = _useStyles.styles;
  var mapFlat = function mapFlat(item, itemIndex) {
    return /*#__PURE__*/_jsx(FormItem, _objectSpread({
      divider: itemIndex !== 0,
      minWidth: itemMinWidth
    }, item), itemIndex);
  };
  var mapTree = function mapTree(group, groupIndex) {
    return /*#__PURE__*/_jsx(FormGroup, {
      defaultActive: group === null || group === void 0 ? void 0 : group.defaultActive,
      extra: group === null || group === void 0 ? void 0 : group.extra,
      icon: group === null || group === void 0 ? void 0 : group.icon,
      title: group.title,
      variant: variant,
      children: Array.isArray(group.children) ? group.children.filter(function (item) {
        return !item.hidden;
      }).map(function (item, i) {
        return mapFlat(item, i);
      }) : group.children
    }, groupIndex);
  };
  return /*#__PURE__*/_jsxs(AntForm, _objectSpread(_objectSpread({
    className: cx(styles.form, className),
    colon: false,
    form: form,
    layout: "horizontal",
    ref: ref
  }, rest), {}, {
    children: [(items === null || items === void 0 ? void 0 : items.length) > 0 ? itemsType === 'group' ? items === null || items === void 0 ? void 0 : items.map(function (item, i) {
      return mapTree(item, i);
    }) : /*#__PURE__*/_jsx(FormGroup, {
      itemsType: 'flat',
      variant: variant,
      children: items === null || items === void 0 ? void 0 : items.filter(function (item) {
        return !item.hidden;
      }).map(function (item, i) {
        return mapFlat(item, i);
      })
    }) : null, children, footer && /*#__PURE__*/_jsx(FormFooter, {
      children: footer
    })]
  }));
});
var Form = FormParent;
Form.Item = FormItem;
Form.Group = FormGroup;
export default Form;