import _objectSpread from "@babel/runtime/helpers/esm/objectSpread2";
import _objectWithoutProperties from "@babel/runtime/helpers/esm/objectWithoutProperties";
var _excluded = ["resize", "onCompositionEnd", "onPressEnter", "onCompositionStart", "className", "onInput", "loading", "onSend", "onBlur", "onChange"];
import { forwardRef, memo, useRef } from 'react';
import { TextArea } from "../Input";
import { jsx as _jsx } from "react/jsx-runtime";
var ChatInputAreaInner = /*#__PURE__*/forwardRef(function (_ref, ref) {
  var _ref$resize = _ref.resize,
    resize = _ref$resize === void 0 ? false : _ref$resize,
    _onCompositionEnd = _ref.onCompositionEnd,
    _onPressEnter = _ref.onPressEnter,
    _onCompositionStart = _ref.onCompositionStart,
    className = _ref.className,
    onInput = _ref.onInput,
    loading = _ref.loading,
    onSend = _ref.onSend,
    _onBlur = _ref.onBlur,
    _onChange = _ref.onChange,
    rest = _objectWithoutProperties(_ref, _excluded);
  var isChineseInput = useRef(false);
  return /*#__PURE__*/_jsx(TextArea, _objectSpread({
    className: className,
    onBlur: function onBlur(e) {
      onInput === null || onInput === void 0 || onInput(e.target.value);
      _onBlur === null || _onBlur === void 0 || _onBlur(e);
    },
    onChange: function onChange(e) {
      onInput === null || onInput === void 0 || onInput(e.target.value);
      _onChange === null || _onChange === void 0 || _onChange(e);
    },
    onCompositionEnd: function onCompositionEnd(e) {
      isChineseInput.current = false;
      _onCompositionEnd === null || _onCompositionEnd === void 0 || _onCompositionEnd(e);
    },
    onCompositionStart: function onCompositionStart(e) {
      isChineseInput.current = true;
      _onCompositionStart === null || _onCompositionStart === void 0 || _onCompositionStart(e);
    },
    onPressEnter: function onPressEnter(e) {
      _onPressEnter === null || _onPressEnter === void 0 || _onPressEnter(e);
      if (!loading && !e.shiftKey && !isChineseInput.current) {
        e.preventDefault();
        onSend === null || onSend === void 0 || onSend();
      }
    },
    ref: ref,
    resize: resize
  }, rest));
});
export default /*#__PURE__*/memo(ChatInputAreaInner);