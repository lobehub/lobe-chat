import _slicedToArray from "@babel/runtime/helpers/esm/slicedToArray";
import _taggedTemplateLiteral from "@babel/runtime/helpers/esm/taggedTemplateLiteral";
var _templateObject, _templateObject2, _templateObject3, _templateObject4, _templateObject5;
import { useSize } from 'ahooks';
import { createStyles } from 'antd-style';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { rgba } from 'polished';
import { forwardRef, useCallback, useEffect, useRef, useState } from 'react';
import { Flexbox } from 'react-layout-kit';
import ActionIcon from "../../ActionIcon";
import MobileSafeArea from "../../MobileSafeArea";
import ChatInputAreaInner from "../ChatInputAreaInner";
import { jsxs as _jsxs } from "react/jsx-runtime";
import { jsx as _jsx } from "react/jsx-runtime";
var useStyles = createStyles(function (_ref) {
  var css = _ref.css,
    token = _ref.token;
  return {
    container: css(_templateObject || (_templateObject = _taggedTemplateLiteral(["\n      padding-block: 12px 12px;\n      background: ", ";\n      border-block-start: 1px solid ", ";\n    "])), token.colorFillQuaternary, rgba(token.colorBorder, 0.25)),
    expand: css(_templateObject2 || (_templateObject2 = _taggedTemplateLiteral(["\n      position: absolute;\n      height: 100%;\n      background: ", ";\n    "])), token.colorBgLayout),
    expandButton: css(_templateObject3 || (_templateObject3 = _taggedTemplateLiteral(["\n      position: absolute;\n      inset-inline-start: 14px;\n    "]))),
    expandTextArea: css(_templateObject4 || (_templateObject4 = _taggedTemplateLiteral(["\n      flex: 1;\n    "]))),
    inner: css(_templateObject5 || (_templateObject5 = _taggedTemplateLiteral(["\n      height: inherit;\n      padding-block: 0;\n      padding-inline: 8px;\n    "])))
  };
});
var MobileChatInputArea = /*#__PURE__*/forwardRef(function (_ref2, ref) {
  var className = _ref2.className,
    style = _ref2.style,
    topAddons = _ref2.topAddons,
    textAreaLeftAddons = _ref2.textAreaLeftAddons,
    textAreaRightAddons = _ref2.textAreaRightAddons,
    bottomAddons = _ref2.bottomAddons,
    _ref2$expand = _ref2.expand,
    expand = _ref2$expand === void 0 ? false : _ref2$expand,
    setExpand = _ref2.setExpand,
    onSend = _ref2.onSend,
    onInput = _ref2.onInput,
    loading = _ref2.loading,
    value = _ref2.value,
    safeArea = _ref2.safeArea;
  var containerRef = useRef(null);
  var _useStyles = useStyles(),
    cx = _useStyles.cx,
    styles = _useStyles.styles;
  var size = useSize(containerRef);
  var _useState = useState(false),
    _useState2 = _slicedToArray(_useState, 2),
    showFullscreen = _useState2[0],
    setShowFullscreen = _useState2[1];
  var _useState3 = useState(false),
    _useState4 = _slicedToArray(_useState3, 2),
    isFocused = _useState4[0],
    setIsFocused = _useState4[1];
  useEffect(function () {
    if (!(size !== null && size !== void 0 && size.height)) return;
    setShowFullscreen(size.height > 72);
  }, [size]);
  var InnerContainer = useCallback(function (_ref3) {
    var children = _ref3.children;
    return expand ? /*#__PURE__*/_jsxs(Flexbox, {
      className: styles.inner,
      gap: 8,
      children: [/*#__PURE__*/_jsxs(Flexbox, {
        gap: 8,
        horizontal: true,
        justify: 'flex-end',
        children: [textAreaLeftAddons, textAreaRightAddons]
      }), children, topAddons, bottomAddons]
    }) : /*#__PURE__*/_jsxs(Flexbox, {
      align: 'flex-end',
      className: styles.inner,
      gap: 8,
      horizontal: true,
      children: [textAreaLeftAddons, children, textAreaRightAddons]
    });
  }, [expand, loading]);
  var showAddons = !expand && !isFocused;
  return /*#__PURE__*/_jsxs(Flexbox, {
    children: [/*#__PURE__*/_jsxs(Flexbox, {
      className: cx(styles.container, expand && styles.expand, className),
      gap: 12,
      style: style,
      children: [topAddons && /*#__PURE__*/_jsx(Flexbox, {
        style: showAddons ? {} : {
          display: 'none'
        },
        children: topAddons
      }), /*#__PURE__*/_jsxs(Flexbox, {
        className: cx(expand && styles.expand),
        ref: containerRef,
        style: {
          position: 'relative'
        },
        children: [showFullscreen && /*#__PURE__*/_jsx(ActionIcon, {
          active: true,
          className: styles.expandButton,
          icon: expand ? ChevronDown : ChevronUp,
          onClick: function onClick() {
            return setExpand === null || setExpand === void 0 ? void 0 : setExpand(!expand);
          },
          size: {
            blockSize: 24,
            borderRadius: '50%',
            fontSize: 14
          },
          style: expand ? {
            top: 6
          } : {}
        }), /*#__PURE__*/_jsx(InnerContainer, {
          children: /*#__PURE__*/_jsx(ChatInputAreaInner, {
            autoSize: expand ? false : {
              maxRows: 6,
              minRows: 0
            },
            className: cx(expand && styles.expandTextArea),
            loading: loading,
            onBlur: function onBlur() {
              return setIsFocused(false);
            },
            onFocus: function onFocus() {
              return setIsFocused(true);
            },
            onInput: onInput,
            onSend: onSend,
            ref: ref,
            style: {
              height: 36,
              paddingBlock: 6
            },
            type: expand ? 'pure' : 'block',
            value: value
          })
        })]
      }), bottomAddons && /*#__PURE__*/_jsx(Flexbox, {
        style: showAddons ? {} : {
          display: 'none'
        },
        children: bottomAddons
      })]
    }), safeArea && !isFocused && /*#__PURE__*/_jsx(MobileSafeArea, {
      position: 'bottom'
    })]
  });
});
export default MobileChatInputArea;