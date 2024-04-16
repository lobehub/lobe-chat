import _slicedToArray from "@babel/runtime/helpers/esm/slicedToArray";
import { useCallback, useEffect, useMemo, useState } from 'react';
export var useCopied = function useCopied() {
  var _useState = useState(false),
    _useState2 = _slicedToArray(_useState, 2),
    copied = _useState2[0],
    setCopy = _useState2[1];
  useEffect(function () {
    if (!copied) return;
    var timer = setTimeout(function () {
      setCopy(false);
    }, 2000);
    return function () {
      clearTimeout(timer);
    };
  }, [copied]);
  var setCopied = useCallback(function () {
    return setCopy(true);
  }, []);
  return useMemo(function () {
    return {
      copied: copied,
      setCopied: setCopied
    };
  }, [copied]);
};