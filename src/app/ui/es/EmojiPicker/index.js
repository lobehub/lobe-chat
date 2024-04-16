'use client';

import _slicedToArray from "@babel/runtime/helpers/esm/slicedToArray";
import _regeneratorRuntime from "@babel/runtime/helpers/esm/regeneratorRuntime";
import _asyncToGenerator from "@babel/runtime/helpers/esm/asyncToGenerator";
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import { Popover } from 'antd';
import { memo } from 'react';
import useSWR from 'swr';
import useMergeState from 'use-merge-value';
import Avatar from "../Avatar";
import { useStyles } from "./style";
import { jsx as _jsx } from "react/jsx-runtime";
var EmojiPicker = /*#__PURE__*/memo(function (_ref) {
  var value = _ref.value,
    _ref$defaultAvatar = _ref.defaultAvatar,
    defaultAvatar = _ref$defaultAvatar === void 0 ? '🤖' : _ref$defaultAvatar,
    _ref$backgroundColor = _ref.backgroundColor,
    backgroundColor = _ref$backgroundColor === void 0 ? 'rgba(0,0,0,0)' : _ref$backgroundColor,
    onChange = _ref.onChange,
    _ref$locale = _ref.locale,
    locale = _ref$locale === void 0 ? 'en-US' : _ref$locale;
  var _useStyles = useStyles(),
    styles = _useStyles.styles;
  var _useSWR = useSWR(locale, /*#__PURE__*/_asyncToGenerator( /*#__PURE__*/_regeneratorRuntime().mark(function _callee() {
      return _regeneratorRuntime().wrap(function _callee$(_context) {
        while (1) switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return import("@emoji-mart/data/i18n/".concat(locale.split('-')[0], ".json"));
          case 2:
            return _context.abrupt("return", _context.sent);
          case 3:
          case "end":
            return _context.stop();
        }
      }, _callee);
    })), {
      revalidateOnFocus: false
    }),
    i18n = _useSWR.data;
  var _useMergeState = useMergeState('🤖', {
      defaultValue: defaultAvatar,
      onChange: onChange,
      value: value
    }),
    _useMergeState2 = _slicedToArray(_useMergeState, 2),
    ava = _useMergeState2[0],
    setAva = _useMergeState2[1];
  return /*#__PURE__*/_jsx(Popover, {
    content: /*#__PURE__*/_jsx("div", {
      className: styles.picker,
      children: /*#__PURE__*/_jsx(Picker, {
        data: data,
        i18n: i18n,
        locale: locale.split('-')[0],
        onEmojiSelect: function onEmojiSelect(e) {
          return setAva(e.native);
        },
        skinTonePosition: 'none',
        theme: 'auto'
      })
    }),
    placement: 'left',
    rootClassName: styles.popover,
    trigger: 'click',
    children: /*#__PURE__*/_jsx("div", {
      className: styles.avatar,
      style: {
        width: 'fit-content'
      },
      children: /*#__PURE__*/_jsx(Avatar, {
        avatar: ava,
        background: backgroundColor,
        size: 44
      })
    })
  });
});
export default EmojiPicker;