import _objectSpread from "@babel/runtime/helpers/esm/objectSpread2";
import _objectWithoutProperties from "@babel/runtime/helpers/esm/objectWithoutProperties";
import _taggedTemplateLiteral from "@babel/runtime/helpers/esm/taggedTemplateLiteral";
var _excluded = ["className", "style", "classNames", "expand", "setExpand", "bottomAddons", "topAddons", "onSizeChange", "heights", "onSend"];
var _templateObject, _templateObject2, _templateObject3;
import { createStyles } from 'antd-style';
import { forwardRef, memo } from 'react';
import DraggablePanel from "../../DraggablePanel";
import ChatInputAreaInner from "../ChatInputAreaInner";
import { jsx as _jsx } from "react/jsx-runtime";
import { jsxs as _jsxs } from "react/jsx-runtime";
var useStyles = createStyles(function (_ref) {
  var css = _ref.css;
  return {
    container: css(_templateObject || (_templateObject = _taggedTemplateLiteral(["\n      position: relative;\n\n      display: flex;\n      flex-direction: column;\n      gap: 8px;\n\n      height: 100%;\n      padding-block: 12px 16px;\n      padding-inline: 0;\n    "]))),
    textarea: css(_templateObject2 || (_templateObject2 = _taggedTemplateLiteral(["\n      height: 100% !important;\n      padding-block: 0;\n      padding-inline: 24px;\n      line-height: 1.5;\n    "]))),
    textareaContainer: css(_templateObject3 || (_templateObject3 = _taggedTemplateLiteral(["\n      position: relative;\n      flex: 1;\n    "])))
  };
});
var ChatInputArea = /*#__PURE__*/forwardRef(function (_ref2, ref) {
  var className = _ref2.className,
    style = _ref2.style,
    classNames = _ref2.classNames,
    _ref2$expand = _ref2.expand,
    expand = _ref2$expand === void 0 ? true : _ref2$expand,
    setExpand = _ref2.setExpand,
    bottomAddons = _ref2.bottomAddons,
    topAddons = _ref2.topAddons,
    onSizeChange = _ref2.onSizeChange,
    heights = _ref2.heights,
    _onSend = _ref2.onSend,
    rest = _objectWithoutProperties(_ref2, _excluded);
  var _useStyles = useStyles(),
    styles = _useStyles.styles;
  return /*#__PURE__*/_jsx(DraggablePanel, {
    className: className,
    classNames: classNames,
    fullscreen: expand,
    headerHeight: heights === null || heights === void 0 ? void 0 : heights.headerHeight,
    maxHeight: heights === null || heights === void 0 ? void 0 : heights.maxHeight,
    minHeight: heights === null || heights === void 0 ? void 0 : heights.minHeight,
    onSizeChange: onSizeChange,
    placement: "bottom",
    size: {
      height: heights === null || heights === void 0 ? void 0 : heights.inputHeight,
      width: '100%'
    },
    style: _objectSpread({
      zIndex: 10
    }, style),
    children: /*#__PURE__*/_jsxs("section", {
      className: styles.container,
      style: {
        minHeight: heights === null || heights === void 0 ? void 0 : heights.minHeight
      },
      children: [topAddons, /*#__PURE__*/_jsx("div", {
        className: styles.textareaContainer,
        children: /*#__PURE__*/_jsx(ChatInputAreaInner, _objectSpread({
          className: styles.textarea,
          onSend: function onSend() {
            _onSend === null || _onSend === void 0 || _onSend();
            setExpand === null || setExpand === void 0 || setExpand(false);
          },
          ref: ref,
          type: 'pure'
        }, rest))
      }), bottomAddons]
    })
  });
});
export default /*#__PURE__*/memo(ChatInputArea);