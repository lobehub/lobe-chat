'use client';

import _objectSpread from "@babel/runtime/helpers/esm/objectSpread2";
import _slicedToArray from "@babel/runtime/helpers/esm/slicedToArray";
import { memo } from 'react';
import useControlledState from 'use-merge-value';
import Markdown from "../Markdown";
import MessageInput from "../MessageInput";
import MessageModal from "../MessageModal";
import { jsx as _jsx } from "react/jsx-runtime";
import { Fragment as _Fragment } from "react/jsx-runtime";
import { jsxs as _jsxs } from "react/jsx-runtime";
var EditableMessage = /*#__PURE__*/memo(function (_ref) {
  var value = _ref.value,
    onChange = _ref.onChange,
    _ref$classNames = _ref.classNames,
    classNames = _ref$classNames === void 0 ? {} : _ref$classNames,
    onEditingChange = _ref.onEditingChange,
    editing = _ref.editing,
    openModal = _ref.openModal,
    onOpenChange = _ref.onOpenChange,
    placeholder = _ref.placeholder,
    _ref$showEditWhenEmpt = _ref.showEditWhenEmpty,
    showEditWhenEmpty = _ref$showEditWhenEmpt === void 0 ? false : _ref$showEditWhenEmpt,
    stylesProps = _ref.styles,
    height = _ref.height,
    inputType = _ref.inputType,
    editButtonSize = _ref.editButtonSize,
    text = _ref.text,
    fullFeaturedCodeBlock = _ref.fullFeaturedCodeBlock,
    model = _ref.model,
    fontSize = _ref.fontSize;
  var _useControlledState = useControlledState(false, {
      onChange: onEditingChange,
      value: editing
    }),
    _useControlledState2 = _slicedToArray(_useControlledState, 2),
    isEdit = _useControlledState2[0],
    setTyping = _useControlledState2[1];
  var _useControlledState3 = useControlledState(false, {
      onChange: onOpenChange,
      value: openModal
    }),
    _useControlledState4 = _slicedToArray(_useControlledState3, 2),
    expand = _useControlledState4[0],
    setExpand = _useControlledState4[1];
  var isAutoSize = height === 'auto';
  var input = /*#__PURE__*/_jsx(MessageInput, {
    className: classNames === null || classNames === void 0 ? void 0 : classNames.input,
    classNames: {
      textarea: classNames === null || classNames === void 0 ? void 0 : classNames.textarea
    },
    defaultValue: value,
    editButtonSize: editButtonSize,
    height: height,
    onCancel: function onCancel() {
      return setTyping(false);
    },
    onConfirm: function onConfirm(text) {
      onChange === null || onChange === void 0 || onChange(text);
      setTyping(false);
    },
    placeholder: placeholder,
    style: stylesProps === null || stylesProps === void 0 ? void 0 : stylesProps.input,
    text: text,
    textareaClassname: classNames === null || classNames === void 0 ? void 0 : classNames.input,
    type: inputType
  });
  if (!value && showEditWhenEmpty) return input;
  return /*#__PURE__*/_jsxs(_Fragment, {
    children: [!expand && isEdit ? input : /*#__PURE__*/_jsx(Markdown, {
      className: classNames === null || classNames === void 0 ? void 0 : classNames.markdown,
      fontSize: fontSize,
      fullFeaturedCodeBlock: fullFeaturedCodeBlock,
      style: _objectSpread({
        height: isAutoSize ? 'unset' : height,
        overflowX: 'hidden',
        overflowY: 'auto'
      }, stylesProps === null || stylesProps === void 0 ? void 0 : stylesProps.markdown),
      variant: 'chat',
      children: value || placeholder || ''
    }), expand && /*#__PURE__*/_jsx(MessageModal, {
      editing: isEdit,
      extra: model === null || model === void 0 ? void 0 : model.extra,
      footer: model === null || model === void 0 ? void 0 : model.footer,
      height: height,
      onChange: onChange,
      onEditingChange: setTyping,
      onOpenChange: function onOpenChange(e) {
        setExpand(e);
        setTyping(false);
      },
      open: expand,
      placeholder: placeholder,
      text: text,
      value: value
    })]
  });
});
export default EditableMessage;