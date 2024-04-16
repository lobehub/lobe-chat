'use client';

import _objectSpread from "@babel/runtime/helpers/esm/objectSpread2";
import _defineProperty from "@babel/runtime/helpers/esm/defineProperty";
import _slicedToArray from "@babel/runtime/helpers/esm/slicedToArray";
import { useHover } from 'ahooks';
import { ConfigProvider } from 'antd';
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp } from 'lucide-react';
import { Resizable } from 're-resizable';
import { memo, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Center } from 'react-layout-kit';
import useControlledState from 'use-merge-value';
import { useStyles } from "./style";
import { revesePlacement } from "./utils";
import { jsx as _jsx } from "react/jsx-runtime";
import { jsxs as _jsxs } from "react/jsx-runtime";
var DEFAULT_HEIGHT = 180;
var DEFAULT_WIDTH = 280;
var DraggablePanel = /*#__PURE__*/memo(function (_ref) {
  var _ref$headerHeight = _ref.headerHeight,
    headerHeight = _ref$headerHeight === void 0 ? 0 : _ref$headerHeight,
    fullscreen = _ref.fullscreen,
    maxHeight = _ref.maxHeight,
    _ref$pin = _ref.pin,
    pin = _ref$pin === void 0 ? true : _ref$pin,
    _ref$mode = _ref.mode,
    mode = _ref$mode === void 0 ? 'fixed' : _ref$mode,
    children = _ref.children,
    _ref$placement = _ref.placement,
    placement = _ref$placement === void 0 ? 'right' : _ref$placement,
    resize = _ref.resize,
    style = _ref.style,
    _ref$showHandlerWideA = _ref.showHandlerWideArea,
    showHandlerWideArea = _ref$showHandlerWideA === void 0 ? true : _ref$showHandlerWideA,
    size = _ref.size,
    customizeDefaultSize = _ref.defaultSize,
    minWidth = _ref.minWidth,
    minHeight = _ref.minHeight,
    maxWidth = _ref.maxWidth,
    onSizeChange = _ref.onSizeChange,
    onSizeDragging = _ref.onSizeDragging,
    _ref$expandable = _ref.expandable,
    expandable = _ref$expandable === void 0 ? true : _ref$expandable,
    expand = _ref.expand,
    _ref$defaultExpand = _ref.defaultExpand,
    defaultExpand = _ref$defaultExpand === void 0 ? true : _ref$defaultExpand,
    onExpandChange = _ref.onExpandChange,
    className = _ref.className,
    showHandlerWhenUnexpand = _ref.showHandlerWhenUnexpand,
    destroyOnClose = _ref.destroyOnClose,
    hanlderStyle = _ref.hanlderStyle,
    _ref$classNames = _ref.classNames,
    classNames = _ref$classNames === void 0 ? {} : _ref$classNames,
    dir = _ref.dir;
  var reference = useRef();
  var isHovering = useHover(reference);
  var isVertical = placement === 'top' || placement === 'bottom';

  // inherit direction from Ant Design ConfigProvider
  var _useContext = useContext(ConfigProvider.ConfigContext),
    antdDirection = _useContext.direction;
  var direction = dir !== null && dir !== void 0 ? dir : antdDirection;
  var internalPlacement = placement;
  // reverse the placement when dir is rtl
  if (direction === 'rtl' && ['left', 'right'].includes(placement)) {
    internalPlacement = internalPlacement === 'left' ? 'right' : 'left';
  }
  var _useStyles = useStyles({
      headerHeight: headerHeight,
      showHandlerWideArea: showHandlerWideArea
    }),
    styles = _useStyles.styles,
    cx = _useStyles.cx;
  var _useControlledState = useControlledState(defaultExpand, {
      onChange: onExpandChange,
      value: expand
    }),
    _useControlledState2 = _slicedToArray(_useControlledState, 2),
    isExpand = _useControlledState2[0],
    setIsExpand = _useControlledState2[1];
  useEffect(function () {
    if (pin) return;
    if (isHovering && !isExpand) {
      setIsExpand(true);
    } else if (!isHovering && isExpand) {
      setIsExpand(false);
    }
  }, [pin, isHovering, isExpand]);
  var _useState = useState(true),
    _useState2 = _slicedToArray(_useState, 2),
    showExpand = _useState2[0],
    setShowExpand = _useState2[1];
  var _useState3 = useState(false),
    _useState4 = _slicedToArray(_useState3, 2),
    isResizing = _useState4[0],
    setIsResizing = _useState4[1];
  var canResizing = resize !== false && isExpand;
  var resizeHandleClassNames = useMemo(function () {
    if (!canResizing) return {};
    return _defineProperty({}, revesePlacement(internalPlacement), styles["".concat(revesePlacement(internalPlacement), "Handle")]);
  }, [canResizing, internalPlacement]);
  var resizing = _objectSpread(_defineProperty({
    bottom: false,
    bottomLeft: false,
    bottomRight: false,
    left: false,
    right: false,
    top: false,
    topLeft: false,
    topRight: false
  }, revesePlacement(internalPlacement), true), resize);
  var defaultSize = useMemo(function () {
    if (isVertical) return _objectSpread({
      height: DEFAULT_HEIGHT,
      width: '100%'
    }, customizeDefaultSize);
    return _objectSpread({
      height: '100%',
      width: DEFAULT_WIDTH
    }, customizeDefaultSize);
  }, [isVertical]);
  var sizeProps = isExpand ? {
    defaultSize: defaultSize,
    maxHeight: typeof maxHeight === 'number' ? Math.max(maxHeight, 0) : maxHeight,
    maxWidth: typeof maxWidth === 'number' ? Math.max(maxWidth, 0) : maxWidth,
    minHeight: typeof minHeight === 'number' ? Math.max(minHeight, 0) : minHeight,
    minWidth: typeof minWidth === 'number' ? Math.max(minWidth, 0) : minWidth,
    size: size
  } : isVertical ? {
    minHeight: 0,
    size: {
      height: 0
    }
  } : {
    minWidth: 0,
    size: {
      width: 0
    }
  };
  var _useMemo = useMemo(function () {
      switch (internalPlacement) {
        case 'top':
          {
            return {
              Arrow: ChevronDown,
              className: 'Bottom'
            };
          }
        case 'bottom':
          {
            return {
              Arrow: ChevronUp,
              className: 'Top'
            };
          }
        case 'right':
          {
            return {
              Arrow: ChevronLeft,
              className: 'Left'
            };
          }
        case 'left':
          {
            return {
              Arrow: ChevronRight,
              className: 'Right'
            };
          }
      }
    }, [styles, internalPlacement]),
    Arrow = _useMemo.Arrow,
    arrowPlacement = _useMemo.className;
  var handler = /*#__PURE__*/_jsx(Center
  // @ts-ignore
  , {
    className: cx(styles["toggle".concat(arrowPlacement)], classNames.handle),
    style: {
      opacity: isExpand ? pin ? undefined : 0 : showHandlerWhenUnexpand ? 1 : 0
    },
    children: /*#__PURE__*/_jsx(Center, {
      onClick: function onClick() {
        setIsExpand(!isExpand);
      },
      style: hanlderStyle,
      children: /*#__PURE__*/_jsx("div", {
        className: styles.handlerIcon,
        style: {
          transform: "rotate(".concat(isExpand ? 180 : 0, "deg)")
        },
        children: /*#__PURE__*/_jsx(Arrow, {
          size: 16,
          strokeWidth: 1.5
        })
      })
    })
  });
  var inner =
  /*#__PURE__*/
  // @ts-ignore
  _jsx(Resizable, _objectSpread(_objectSpread({}, sizeProps), {}, {
    className: cx(styles.panel, classNames.content),
    enable: canResizing ? resizing : undefined,
    handleClasses: resizeHandleClassNames,
    onResize: function onResize(_, direction, reference_, delta) {
      onSizeDragging === null || onSizeDragging === void 0 || onSizeDragging(delta, {
        height: reference_.style.height,
        width: reference_.style.width
      });
    },
    onResizeStart: function onResizeStart() {
      setIsResizing(true);
      setShowExpand(false);
    },
    onResizeStop: function onResizeStop(e, direction, reference_, delta) {
      setIsResizing(false);
      setShowExpand(true);
      onSizeChange === null || onSizeChange === void 0 || onSizeChange(delta, {
        height: reference_.style.height,
        width: reference_.style.width
      });
    },
    style: _objectSpread({
      transition: isResizing ? 'unset' : undefined
    }, style),
    children: children
  }));
  if (fullscreen) return /*#__PURE__*/_jsx("div", {
    className: cx(styles.fullscreen, className),
    children: children
  });
  return /*#__PURE__*/_jsxs("aside", {
    className: cx(styles.container,
    // @ts-ignore
    styles[mode === 'fixed' ? 'fixed' : "".concat(internalPlacement, "Float")], className),
    dir: dir,
    ref: reference,
    style: isExpand ? _defineProperty({}, "border".concat(arrowPlacement, "Width"), 1) : {},
    children: [expandable && showExpand && handler, destroyOnClose ? isExpand && inner : inner]
  });
});
export default DraggablePanel;