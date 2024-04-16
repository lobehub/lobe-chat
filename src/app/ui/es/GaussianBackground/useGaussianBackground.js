import _slicedToArray from "@babel/runtime/helpers/esm/slicedToArray";
import { useCallback, useEffect, useState } from 'react';
import GaussianBackgroundClient from "./vendor/gaussianBackground";
export var useGaussianBackground = function useGaussianBackground(ref) {
  var _useState = useState(),
    _useState2 = _slicedToArray(_useState, 2),
    client = _useState2[0],
    setClient = _useState2[1];
  useEffect(function () {
    if (!ref.current) return;
    setClient(new GaussianBackgroundClient(ref.current));
  }, []);
  var handleRun = useCallback(function (layers, options) {
    if (!client) return;
    if (options) client.updateOptions(options);
    client.run(layers);
  }, [client]);
  return handleRun;
};