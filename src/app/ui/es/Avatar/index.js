'use client';

import _objectSpread from "@babel/runtime/helpers/esm/objectSpread2";
import _objectWithoutProperties from "@babel/runtime/helpers/esm/objectWithoutProperties";
var _excluded = ["className", "avatar", "title", "animation", "size", "shape", "background", "style", "unoptimized"];
import { Avatar as AntAvatar } from 'antd';
import { isValidElement, memo, useMemo } from 'react';
import FluentEmoji from "../FluentEmoji";
import Img from "../Img";
import { getEmoji } from "../utils/getEmojiByCharacter";
import { useStyles } from "./style";
import { jsx as _jsx } from "react/jsx-runtime";
var Avatar = /*#__PURE__*/memo(function (_ref) {
  var className = _ref.className,
    avatar = _ref.avatar,
    title = _ref.title,
    animation = _ref.animation,
    _ref$size = _ref.size,
    size = _ref$size === void 0 ? 40 : _ref$size,
    _ref$shape = _ref.shape,
    shape = _ref$shape === void 0 ? 'circle' : _ref$shape,
    _ref$background = _ref.background,
    background = _ref$background === void 0 ? 'rgba(0,0,0,0)' : _ref$background,
    style = _ref.style,
    unoptimized = _ref.unoptimized,
    rest = _objectWithoutProperties(_ref, _excluded);
  var isStringAvatar = typeof avatar === 'string';
  var isDefaultAntAvatar = Boolean(avatar && (['/', 'http', 'data:'].some(function (index) {
    return isStringAvatar && avatar.startsWith(index);
  }) || /*#__PURE__*/isValidElement(avatar)));
  var emoji = useMemo(function () {
    return avatar && !isDefaultAntAvatar && isStringAvatar && getEmoji(avatar);
  }, [avatar]);
  var _useStyles = useStyles({
      background: background,
      isEmoji: Boolean(emoji),
      size: size
    }),
    styles = _useStyles.styles,
    cx = _useStyles.cx;
  var text = String(isDefaultAntAvatar ? title : avatar);
  var avatarProps = _objectSpread({
    className: cx(styles.avatar, className),
    shape: shape,
    size: size,
    style: rest !== null && rest !== void 0 && rest.onClick ? style : _objectSpread({
      cursor: 'default'
    }, style)
  }, rest);
  return isDefaultAntAvatar ? /*#__PURE__*/_jsx(AntAvatar, _objectSpread({
    src: typeof avatar === 'string' ? /*#__PURE__*/_jsx(Img, {
      alt: title,
      height: size,
      src: avatar,
      width: size
    }) : avatar
  }, avatarProps)) : /*#__PURE__*/_jsx(AntAvatar, _objectSpread(_objectSpread({}, avatarProps), {}, {
    children: emoji ? /*#__PURE__*/_jsx(FluentEmoji, {
      emoji: emoji,
      size: size * 0.8,
      type: animation ? 'anim' : '3d',
      unoptimized: unoptimized
    }) : text === null || text === void 0 ? void 0 : text.toUpperCase().slice(0, 2)
  }));
});
export default Avatar;