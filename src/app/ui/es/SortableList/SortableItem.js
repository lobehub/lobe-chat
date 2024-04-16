import _objectSpread from "@babel/runtime/helpers/esm/objectSpread2";
import _objectWithoutProperties from "@babel/runtime/helpers/esm/objectWithoutProperties";
var _excluded = ["children", "id", "style"];
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { createContext, memo, useMemo } from 'react';
import { Flexbox } from 'react-layout-kit';
import { useStyles } from "./style";
import { jsx as _jsx } from "react/jsx-runtime";
export var SortableItemContext = /*#__PURE__*/createContext({
  attributes: {},
  listeners: undefined,
  ref: function ref() {}
});
var SortableItem = /*#__PURE__*/memo(function (_ref) {
  var children = _ref.children,
    id = _ref.id,
    style = _ref.style,
    rest = _objectWithoutProperties(_ref, _excluded);
  var _useStyles = useStyles(),
    styles = _useStyles.styles;
  var _useSortable = useSortable({
      id: id
    }),
    attributes = _useSortable.attributes,
    isDragging = _useSortable.isDragging,
    listeners = _useSortable.listeners,
    setNodeRef = _useSortable.setNodeRef,
    setActivatorNodeRef = _useSortable.setActivatorNodeRef,
    transform = _useSortable.transform,
    transition = _useSortable.transition;
  var context = useMemo(function () {
    return {
      attributes: attributes,
      listeners: listeners,
      ref: setActivatorNodeRef
    };
  }, [attributes, listeners, setActivatorNodeRef]);
  return /*#__PURE__*/_jsx(SortableItemContext.Provider, {
    value: context,
    children: /*#__PURE__*/_jsx(Flexbox, _objectSpread(_objectSpread({
      align: 'center',
      as: 'li',
      className: styles.item,
      gap: 4,
      horizontal: true,
      ref: setNodeRef,
      style: _objectSpread({
        opacity: isDragging ? 0.4 : undefined,
        transform: CSS.Translate.toString(transform),
        transition: transition
      }, style)
    }, rest), {}, {
      children: children
    }))
  });
});
export default SortableItem;