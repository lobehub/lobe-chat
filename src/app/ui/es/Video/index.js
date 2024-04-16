'use client';

import _objectSpread from "@babel/runtime/helpers/esm/objectSpread2";
import _slicedToArray from "@babel/runtime/helpers/esm/slicedToArray";
import _objectWithoutProperties from "@babel/runtime/helpers/esm/objectWithoutProperties";
var _excluded = ["preload", "src", "style", "classNames", "className", "minSize", "size", "width", "height", "onMouseEnter", "onMouseLeave", "preview", "isLoading", "borderless"];
import { Skeleton } from 'antd';
import { PlayIcon } from 'lucide-react';
import { memo, useState } from 'react';
import { Flexbox } from 'react-layout-kit';
import Icon from "../Icon";
import { useStyles } from "./style";
import { jsx as _jsx } from "react/jsx-runtime";
import { jsxs as _jsxs } from "react/jsx-runtime";
var Video = /*#__PURE__*/memo(function (_ref) {
  var _ref$preload = _ref.preload,
    preload = _ref$preload === void 0 ? 'auto' : _ref$preload,
    src = _ref.src,
    style = _ref.style,
    classNames = _ref.classNames,
    className = _ref.className,
    minSize = _ref.minSize,
    _ref$size = _ref.size,
    size = _ref$size === void 0 ? '100%' : _ref$size,
    width = _ref.width,
    height = _ref.height,
    onMouseEnter = _ref.onMouseEnter,
    onMouseLeave = _ref.onMouseLeave,
    _ref$preview = _ref.preview,
    preview = _ref$preview === void 0 ? true : _ref$preview,
    isLoading = _ref.isLoading,
    borderless = _ref.borderless,
    rest = _objectWithoutProperties(_ref, _excluded);
  var _useState = useState(false),
    _useState2 = _slicedToArray(_useState, 2),
    isPlaying = _useState2[0],
    setIsPlaying = _useState2[1];
  var _useState3 = useState(false),
    _useState4 = _slicedToArray(_useState3, 2),
    showControls = _useState4[0],
    setShowControls = _useState4[1];
  var _useStyles = useStyles({
      borderless: borderless,
      minSize: minSize,
      size: size
    }),
    cx = _useStyles.cx,
    styles = _useStyles.styles,
    theme = _useStyles.theme;
  var onVideoMouseEnter = function onVideoMouseEnter(e) {
    setShowControls(true);
    onMouseEnter === null || onMouseEnter === void 0 || onMouseEnter(e);
  };
  var onVideoMouseLeave = function onVideoMouseLeave(e) {
    setShowControls(false);
    onMouseLeave === null || onMouseLeave === void 0 || onMouseLeave(e);
  };
  if (isLoading) return /*#__PURE__*/_jsx(Skeleton.Avatar, {
    active: true,
    style: {
      borderRadius: theme.borderRadius,
      height: height,
      maxHeight: size,
      maxWidth: size,
      minHeight: minSize,
      minWidth: minSize,
      width: width
    }
  });
  return /*#__PURE__*/_jsxs(Flexbox, {
    className: cx(styles.videoWrapper, classNames === null || classNames === void 0 ? void 0 : classNames.wrapper),
    style: style,
    children: [preview && !isPlaying && /*#__PURE__*/_jsx(Flexbox, {
      align: 'center',
      className: styles.preview,
      justify: 'center',
      children: /*#__PURE__*/_jsx(Icon, {
        color: '#fff',
        icon: PlayIcon,
        size: 'normal'
      })
    }), /*#__PURE__*/_jsx("video", _objectSpread(_objectSpread({
      className: cx(styles.video, classNames === null || classNames === void 0 ? void 0 : classNames.video, className),
      controls: showControls,
      height: height,
      onEnded: function onEnded() {
        return setIsPlaying(false);
      },
      onMouseEnter: onVideoMouseEnter,
      onMouseLeave: onVideoMouseLeave,
      onPause: function onPause() {
        return setIsPlaying(false);
      },
      onPlay: function onPlay() {
        return setIsPlaying(true);
      },
      onPlaying: function onPlaying() {
        return setIsPlaying(true);
      },
      preload: preload,
      style: {
        height: 'auto',
        width: '100%'
      },
      width: width
    }, rest), {}, {
      children: /*#__PURE__*/_jsx("source", {
        src: src
      })
    }))]
  });
});
export default Video;