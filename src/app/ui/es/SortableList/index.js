'use client';

import _objectSpread from "@babel/runtime/helpers/esm/objectSpread2";
import _slicedToArray from "@babel/runtime/helpers/esm/slicedToArray";
import _objectWithoutProperties from "@babel/runtime/helpers/esm/objectWithoutProperties";
var _excluded = ["items", "onChange", "renderItem", "gap"];
import { DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { restrictToVerticalAxis, restrictToWindowEdges } from '@dnd-kit/modifiers';
import { SortableContext, arrayMove, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Fragment, memo, useMemo, useState } from 'react';
import { Flexbox } from 'react-layout-kit';
import DragHandle from "./DragHandle";
import SortableItem from "./SortableItem";
import SortableOverlay from "./SortableOverlay";
import { useStyles } from "./style";
import { jsx as _jsx } from "react/jsx-runtime";
import { jsxs as _jsxs } from "react/jsx-runtime";
var SortableListParent = /*#__PURE__*/memo(function (_ref) {
  var items = _ref.items,
    onChange = _ref.onChange,
    renderItem = _ref.renderItem,
    _ref$gap = _ref.gap,
    gap = _ref$gap === void 0 ? 8 : _ref$gap,
    rest = _objectWithoutProperties(_ref, _excluded);
  var _useState = useState(null),
    _useState2 = _slicedToArray(_useState, 2),
    active = _useState2[0],
    setActive = _useState2[1];
  var _useStyles = useStyles(),
    styles = _useStyles.styles;
  var activeItem = useMemo(function () {
    return items.find(function (item) {
      return item.id === (active === null || active === void 0 ? void 0 : active.id);
    });
  }, [active, items]);
  var sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, {
    coordinateGetter: sortableKeyboardCoordinates
  }));
  return /*#__PURE__*/_jsxs(DndContext, {
    modifiers: [restrictToVerticalAxis, restrictToWindowEdges],
    onDragCancel: function onDragCancel() {
      setActive(null);
    },
    onDragEnd: function onDragEnd(_ref2) {
      var active = _ref2.active,
        over = _ref2.over;
      if (over && active.id !== (over === null || over === void 0 ? void 0 : over.id)) {
        var activeIndex = items.findIndex(function (_ref3) {
          var id = _ref3.id;
          return id === active.id;
        });
        var overIndex = items.findIndex(function (_ref4) {
          var id = _ref4.id;
          return id === over.id;
        });
        onChange(arrayMove(items, activeIndex, overIndex));
      }
      setActive(null);
    },
    onDragStart: function onDragStart(_ref5) {
      var active = _ref5.active;
      setActive(active);
    },
    sensors: sensors,
    children: [/*#__PURE__*/_jsx(SortableContext, {
      items: items,
      strategy: verticalListSortingStrategy,
      children: /*#__PURE__*/_jsx(Flexbox, _objectSpread(_objectSpread({
        as: 'ul',
        className: styles.container,
        gap: gap
      }, rest), {}, {
        children: items.map(function (item) {
          return /*#__PURE__*/_jsx(Fragment, {
            children: renderItem(item)
          }, item.id);
        })
      }))
    }), /*#__PURE__*/_jsx(SortableOverlay, {
      children: activeItem ? renderItem(activeItem) : null
    })]
  });
});
var SortableList = SortableListParent;
SortableList.Item = SortableItem;
SortableList.DragHandle = DragHandle;
export default SortableList;