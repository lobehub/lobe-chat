'use client';

import _slicedToArray from "@babel/runtime/helpers/esm/slicedToArray";
import { Button, Select } from 'antd';
import isEqual from 'fast-deep-equal';
import { Plus, Trash } from 'lucide-react';
import { memo, useEffect, useReducer } from 'react';
import { Flexbox } from 'react-layout-kit';
import ActionIcon from "../ActionIcon";
import Icon from "../Icon";
import { ControlInput } from "../components/ControlInput";
import { messagesReducer } from "./messageReducer";
import { jsx as _jsx } from "react/jsx-runtime";
import { jsxs as _jsxs } from "react/jsx-runtime";
export var EditableMessageList = /*#__PURE__*/memo(function (_ref) {
  var disabled = _ref.disabled,
    dataSources = _ref.dataSources,
    onChange = _ref.onChange;
  var _useReducer = useReducer(messagesReducer, dataSources),
    _useReducer2 = _slicedToArray(_useReducer, 2),
    chatMessages = _useReducer2[0],
    dispatch = _useReducer2[1];
  useEffect(function () {
    if (!isEqual(dataSources, chatMessages)) {
      onChange === null || onChange === void 0 || onChange(chatMessages);
    }
  }, [chatMessages]);
  return dataSources ? /*#__PURE__*/_jsxs(Flexbox, {
    gap: 12,
    children: [chatMessages.map(function (item, index) {
      return /*#__PURE__*/_jsxs(Flexbox, {
        align: 'center',
        gap: 8,
        horizontal: true,
        width: '100%',
        children: [/*#__PURE__*/_jsx(Select, {
          disabled: disabled,
          dropdownStyle: {
            zIndex: 100
          },
          onChange: function onChange(value) {
            dispatch({
              index: index,
              role: value,
              type: 'updateMessageRole'
            });
          },
          options: [{
            label: 'System',
            value: 'system'
          }, {
            label: 'Input',
            value: 'user'
          }, {
            label: 'Output',
            value: 'assistant'
          }],
          style: {
            width: 120
          },
          value: item.role
        }), /*#__PURE__*/_jsx(ControlInput, {
          disabled: disabled,
          onChange: function onChange(e) {
            dispatch({
              index: index,
              message: e,
              type: 'updateMessage'
            });
          },
          placeholder: item.role === 'user' ? '请填入输入的样例内容' : '请填入输出的样例',
          value: item.content
        }), /*#__PURE__*/_jsx(ActionIcon, {
          icon: Trash,
          onClick: function onClick() {
            dispatch({
              index: index,
              type: 'deleteMessage'
            });
          },
          placement: "right",
          size: {
            fontSize: 16
          },
          title: "Delete"
        })]
      }, "".concat(index, "-").concat(item.content));
    }), /*#__PURE__*/_jsx(Button, {
      block: true,
      disabled: disabled,
      icon: /*#__PURE__*/_jsx(Icon, {
        icon: Plus
      }),
      onClick: function onClick() {
        var lastMeg = chatMessages.at(-1);
        dispatch({
          message: {
            content: '',
            role: (lastMeg === null || lastMeg === void 0 ? void 0 : lastMeg.role) === 'user' ? 'assistant' : 'user'
          },
          type: 'addMessage'
        });
      },
      children: "Add Props"
    })]
  }) : undefined;
}, isEqual);
export default EditableMessageList;