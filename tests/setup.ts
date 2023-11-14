import '@testing-library/jest-dom';
// remove antd hash on test
import { theme } from 'antd';
// mock indexedDB to test with dexie
// refs: https://github.com/dumbmatter/fakeIndexedDB#dexie-and-other-indexeddb-api-wrappers
import 'fake-indexeddb/auto';

theme.defaultConfig.hashed = false;
