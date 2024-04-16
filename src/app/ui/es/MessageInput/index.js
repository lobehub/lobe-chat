'use client';

import _objectSpread from "@babel/runtime/helpers/esm/objectSpread2";
import _slicedToArray from "@babel/runtime/helpers/esm/slicedToArray";
import _objectWithoutProperties from "@babel/runtime/helpers/esm/objectWithoutProperties";
var _excluded = ["text", "type", "onCancel", "defaultValue", "onConfirm", "renderButtons", "textareaStyle", "textareaClassname", "placeholder", "height", "style", "editButtonSize", "classNames"];
import { Button } from 'antd';
import { memo, useState } from 'react';
import { Flexbox } from 'react-layout-kit';
import { TextArea } from "../Input";
import { useStyles } from "./style";
import { jsx as _jsx } from "react/jsx-runtime";
import { Fragment as _Fragment } from "react/jsx-runtime";
import { jsxs as _jsxs } from "react/jsx-runtime";
var MessageInput = /*#__PURE__*/memo(function (_ref) {
  var text = _ref.text,
    _ref$type = _ref.type,
    type = _ref$type === void 0 ? 'pure' : _ref$type,
    onCancel = _ref.onCancel,
    defaultValue = _ref.defaultValue,
    onConfirm = _ref.onConfirm,
    renderButtons = _ref.renderButtons,
    textareaStyle = _ref.textareaStyle,
    textareaClassname = _ref.textareaClassname,
    placeholder = _ref.placeholder,
    _ref$height = _ref.height,
    height = _ref$height === void 0 ? 'auto' : _ref$height,
    style = _ref.style,
    _ref$editButtonSize = _ref.editButtonSize,
    editButtonSize = _ref$editButtonSize === void 0 ? 'middle' : _ref$editButtonSize,
    classNames = _ref.classNames,
    rest = _objectWithoutProperties(_ref, _excluded);
  var _useState = useState(defaultValue || ''),
    _useState2 = _slicedToArray(_useState, 2),
    temporaryValue = _useState2[0],
    setValue = _useState2[1];
  var _useStyles = useStyles(),
    cx = _useStyles.cx,
    styles = _useStyles.styles;
  var isAutoSize = height === 'auto';
  return /*#__PURE__*/_jsxs(Flexbox, _objectSpread(_objectSpread({
    gap: 16,
    style: _objectSpread({
      flex: 1,
      width: '100%'
    }, style)
  }, rest), {}, {
    children: [/*#__PURE__*/_jsx(TextArea, {
      autoSize: isAutoSize,
      className: cx(styles, textareaClassname),
      classNames: classNames,
      onBlur: function onBlur(e) {
        return setValue(e.target.value);
      },
      onChange: function onChange(e) {
        return setValue(e.target.value);
      },
      placeholder: placeholder,
      resize: false,
      style: _objectSpread({
        height: isAutoSize ? 'unset' : height,
        minHeight: '100%'
      }, textareaStyle),
      type: type,
      value: temporaryValue
    }), /*#__PURE__*/_jsx(Flexbox, {
      direction: 'horizontal-reverse',
      gap: 8,
      children: renderButtons ? renderButtons(temporaryValue).map(function (buttonProps, index) {
        return /*#__PURE__*/_jsx(Button, _objectSpread({
          size: "small"
        }, buttonProps), index);
      }) : /*#__PURE__*/_jsxs(_Fragment, {
        children: [/*#__PURE__*/_jsx(Button, {
          onClick: function onClick() {
            onConfirm === null || onConfirm === void 0 || onConfirm(temporaryValue);
          },
          size: editButtonSize,
          type: "primary",
          children: (text === null || text === void 0 ? void 0 : text.confirm) || 'Confirm'
        }), /*#__PURE__*/_jsx(Button, {
          onClick: onCancel,
          size: editButtonSize,
          children: (text === null || text === void 0 ? void 0 : text.cancel) || 'Cancel'
        })]
      })
    })]
  }));
});
export default MessageInput;