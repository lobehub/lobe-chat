'use client';

import _objectSpread from "@babel/runtime/helpers/esm/objectSpread2";
import _slicedToArray from "@babel/runtime/helpers/esm/slicedToArray";
import { Button } from 'antd';
import { useResponsive } from 'antd-style';
import { memo, useState } from 'react';
import { Flexbox } from 'react-layout-kit';
import useControlledState from 'use-merge-value';
import { TextArea } from "../Input";
import Markdown from "../Markdown";
import { useStyles as useTextStyles } from "../MessageInput/style";
import Modal from "../Modal";
import { jsx as _jsx } from "react/jsx-runtime";
import { jsxs as _jsxs } from "react/jsx-runtime";
import { Fragment as _Fragment } from "react/jsx-runtime";
var MessageModal = /*#__PURE__*/memo(function (_ref) {
  var editing = _ref.editing,
    open = _ref.open,
    _ref$height = _ref.height,
    height = _ref$height === void 0 ? 'auto' : _ref$height,
    onOpenChange = _ref.onOpenChange,
    onEditingChange = _ref.onEditingChange,
    placeholder = _ref.placeholder,
    value = _ref.value,
    onChange = _ref.onChange,
    text = _ref.text,
    footer = _ref.footer,
    extra = _ref.extra;
  var _useResponsive = useResponsive(),
    mobile = _useResponsive.mobile;
  var _useTextStyles = useTextStyles(),
    textStyles = _useTextStyles.styles;
  var _useControlledState = useControlledState(false, {
      onChange: onEditingChange,
      value: editing
    }),
    _useControlledState2 = _slicedToArray(_useControlledState, 2),
    isEdit = _useControlledState2[0],
    setTyping = _useControlledState2[1];
  var _useControlledState3 = useControlledState(false, {
      onChange: onOpenChange,
      value: open
    }),
    _useControlledState4 = _slicedToArray(_useControlledState3, 2),
    showModal = _useControlledState4[0],
    setShowModal = _useControlledState4[1];
  var _useState = useState(value),
    _useState2 = _slicedToArray(_useState, 2),
    temporaryValue = _useState2[0],
    setValue = _useState2[1];
  var isAutoSize = height === 'auto';
  var markdownStyle = {
    height: isAutoSize ? 'unset' : height,
    overflowX: 'hidden',
    overflowY: 'auto'
  };
  var modalFooter = isEdit ? /*#__PURE__*/_jsxs(Flexbox, {
    direction: 'horizontal-reverse',
    gap: 8,
    children: [/*#__PURE__*/_jsx(Button, {
      onClick: function onClick() {
        setTyping(false);
        onChange === null || onChange === void 0 || onChange(temporaryValue);
        setValue(value);
      },
      type: "primary",
      children: (text === null || text === void 0 ? void 0 : text.confirm) || 'Confirm'
    }), /*#__PURE__*/_jsx(Button, {
      onClick: function onClick() {
        setTyping(false);
        setValue(value);
      },
      children: (text === null || text === void 0 ? void 0 : text.cancel) || 'Cancel'
    })]
  }) : footer;
  return /*#__PURE__*/_jsx(Modal, {
    allowFullscreen: true,
    cancelText: (text === null || text === void 0 ? void 0 : text.cancel) || 'Cancel',
    destroyOnClose: true,
    footer: modalFooter,
    okText: (text === null || text === void 0 ? void 0 : text.edit) || 'Edit',
    onCancel: function onCancel() {
      setShowModal(false);
      setTyping(false);
      setValue(value);
    },
    onOk: function onOk() {
      return setTyping(true);
    },
    open: showModal,
    title: text === null || text === void 0 ? void 0 : text.title,
    children: isEdit ? /*#__PURE__*/_jsx(TextArea, {
      autoSize: isAutoSize,
      className: textStyles,
      onBlur: function onBlur(e) {
        return setValue(e.target.value);
      },
      onChange: function onChange(e) {
        return setValue(e.target.value);
      },
      placeholder: placeholder,
      resize: false,
      style: {
        flex: mobile ? 1 : undefined,
        height: isAutoSize ? 'unset' : height,
        minHeight: mobile ? 'unset' : '100%'
      },
      type: mobile ? 'pure' : 'block',
      value: temporaryValue
    }) : /*#__PURE__*/_jsxs(_Fragment, {
      children: [extra, /*#__PURE__*/_jsx(Markdown, {
        style: value ? markdownStyle : _objectSpread(_objectSpread({}, markdownStyle), {}, {
          opacity: 0.5
        }),
        variant: 'chat',
        children: String(value || placeholder)
      })]
    })
  });
});
export default MessageModal;