'use client';

import _objectSpread from "@babel/runtime/helpers/esm/objectSpread2";
import _slicedToArray from "@babel/runtime/helpers/esm/slicedToArray";
import _objectWithoutProperties from "@babel/runtime/helpers/esm/objectWithoutProperties";
var _excluded = ["value", "showEditIcon", "onChange", "editing", "onEditingChange"];
import { Edit3 } from 'lucide-react';
import { memo } from 'react';
import { Flexbox } from 'react-layout-kit';
import useControlledState from 'use-merge-value';
import ActionIcon from "../ActionIcon";
import { ControlInput } from "../components/ControlInput";
import { jsx as _jsx } from "react/jsx-runtime";
import { jsxs as _jsxs } from "react/jsx-runtime";
var EditableText = /*#__PURE__*/memo(function (_ref) {
  var value = _ref.value,
    _ref$showEditIcon = _ref.showEditIcon,
    showEditIcon = _ref$showEditIcon === void 0 ? true : _ref$showEditIcon,
    onChange = _ref.onChange,
    editing = _ref.editing,
    onEditingChange = _ref.onEditingChange,
    rest = _objectWithoutProperties(_ref, _excluded);
  var _useControlledState = useControlledState(false, {
      onChange: onEditingChange,
      value: editing
    }),
    _useControlledState2 = _slicedToArray(_useControlledState, 2),
    edited = _useControlledState2[0],
    setEdited = _useControlledState2[1];
  return edited ? /*#__PURE__*/_jsx(ControlInput, _objectSpread({
    onChange: onChange,
    onChangeEnd: function onChangeEnd() {
      setEdited(false);
    },
    value: value
  }, rest)) : /*#__PURE__*/_jsxs(Flexbox, {
    gap: 8,
    horizontal: true,
    children: [value, showEditIcon && /*#__PURE__*/_jsx(ActionIcon, {
      icon: Edit3,
      onClick: function onClick() {
        setEdited(!edited);
      },
      placement: "right",
      size: "small",
      title: 'Edit'
    })]
  });
});
export default EditableText;