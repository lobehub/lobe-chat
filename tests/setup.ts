/* eslint-disable import/newline-after-import,import/first */
import '@testing-library/jest-dom';
import { theme } from 'antd';
// mock indexedDB to test with dexie
// refs: https://github.com/dumbmatter/fakeIndexedDB#dexie-and-other-indexeddb-api-wrappers
import 'fake-indexeddb/auto';
import React from 'react';

// remove antd hash on test
theme.defaultConfig.hashed = false;

// 将 React 设置为全局变量，这样就不需要在每个测试文件中导入它了
(global as any).React = React;
