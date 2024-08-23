import { test } from 'vitest';

test('placeholder', () => {});
// describe('filterWithKeywords', () => {
//   const data: Record<string, BaseDataModel> = {
//     1: {
//       id: '1',
//       meta: {
//         title: 'hello world',
//         description: 'test case',
//         tag: ['a', 'b'],
//       },
//     },
//     2: {
//       id: '2',
//       meta: {
//         title: 'goodbye',
//         description: 'hello world',
//         tag: ['c', 'd'],
//       },
//     },
//   };
//
//   it('should return an empty object if map is empty', () => {
//     const result = filterWithKeywords({}, 'hello');
//     expect(result).toEqual({});
//   });
//
//   it('should return the original map if keywords is empty', () => {
//     const result = filterWithKeywords(data, '');
//     expect(result).toEqual(data);
//   });
//
//   it('should return a filtered map if keywords is not empty', () => {
//     const result = filterWithKeywords(data, 'world');
//     expect(result).toEqual({
//       1: {
//         id: '1',
//         meta: {
//           title: 'hello world',
//           description: 'test case',
//           tag: ['a', 'b'],
//         },
//       },
//       2: {
//         id: '2',
//         meta: {
//           title: 'goodbye',
//           description: 'hello world',
//           tag: ['c', 'd'],
//         },
//       },
//     });
//   });
//
//   it('should only consider title, description and tag properties if extraSearchStr is not provided', () => {
//     const result = filterWithKeywords(data, 'test');
//     expect(result).toEqual({
//       1: {
//         id: '1',
//         meta: {
//           title: 'hello world',
//           description: 'test case',
//           tag: ['a', 'b'],
//         },
//       },
//     });
//   });
//
//   it('should consider extraSearchStr in addition to title, description and tag properties if provided', () => {
//     const extraSearchStr = (item: BaseDataModel) => {
//       return item.meta.avatar || '';
//     };
//     const data: Record<string, BaseDataModel> = {
//       a: {
//         id: 'a',
//         meta: {
//           title: 'hello world',
//           description: 'test case',
//           tag: ['a', 'b'],
//           avatar: 'xxx',
//         },
//       },
//       b: {
//         id: 'b',
//         meta: {
//           title: 'goodbye',
//           description: 'hello world',
//           tag: ['c', 'd'],
//           avatar: 'yyy',
//         },
//       },
//     };
//
//     const result = filterWithKeywords(data, 'yyy', extraSearchStr);
//     expect(result).toEqual({
//       b: {
//         id: 'b',
//         meta: {
//           title: 'goodbye',
//           description: 'hello world',
//           tag: ['c', 'd'],
//           avatar: 'yyy',
//         },
//       },
//     });
//   });
//
//   it('should ensure that each filtered object has at least one property that includes the keyword or extraSearchStr', () => {
//     const result = filterWithKeywords(data, 't');
//     expect(result).toEqual({
//       1: {
//         id: '1',
//         meta: {
//           title: 'hello world',
//           description: 'test case',
//           tag: ['a', 'b'],
//         },
//       },
//     });
//   });
// });
