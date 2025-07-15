import { describe, expect, it } from 'vitest';

import { setNamespace } from './storeDebug';

describe('storeDebug utilities', () => {
  describe('setNamespace', () => {
    it('should create a namespaced action creator', () => {
      const createAction = setNamespace('user');

      expect(typeof createAction).toBe('function');
    });

    it('should return string action type when no payload provided', () => {
      const createAction = setNamespace('user');
      const actionType = createAction('login');

      expect(actionType).toBe('user/login');
      expect(typeof actionType).toBe('string');
    });

    it('should return action object when payload provided', () => {
      const createAction = setNamespace('user');
      const action = createAction('login', { email: 'test@example.com' });

      expect(action).toEqual({
        type: 'user/login',
        payload: { email: 'test@example.com' },
      });
      expect(typeof action).toBe('object');
    });

    it('should handle empty namespace', () => {
      const createAction = setNamespace('');
      const actionType = createAction('action');

      expect(actionType).toBe('action');
    });

    it('should handle truthy payload values (return objects)', () => {
      const createAction = setNamespace('data');

      // String payload
      const stringAction = createAction('update', 'hello');
      expect(stringAction).toEqual({
        type: 'data/update',
        payload: 'hello',
      });

      // Number payload
      const numberAction = createAction('increment', 42);
      expect(numberAction).toEqual({
        type: 'data/increment',
        payload: 42,
      });

      // Boolean payload
      const booleanAction = createAction('toggle', true);
      expect(booleanAction).toEqual({
        type: 'data/toggle',
        payload: true,
      });

      // Array payload
      const arrayAction = createAction('batch', [1, 2, 3]);
      expect(arrayAction).toEqual({
        type: 'data/batch',
        payload: [1, 2, 3],
      });
    });

    it('should handle falsy payload values (return strings)', () => {
      const createAction = setNamespace('data');

      // Null payload (falsy)
      const nullAction = createAction('reset', null);
      expect(nullAction).toBe('data/reset');

      // Undefined payload (falsy)
      const undefinedAction = createAction('clear', undefined);
      expect(undefinedAction).toBe('data/clear');

      // Zero payload (falsy)
      const zeroAction = createAction('setValue', 0);
      expect(zeroAction).toBe('data/setValue');

      // Empty string payload (falsy)
      const emptyStringAction = createAction('clearField', '');
      expect(emptyStringAction).toBe('data/clearField');

      // False payload (falsy)
      const falseAction = createAction('disable', false);
      expect(falseAction).toBe('data/disable');
    });

    it('should handle complex nested object payload', () => {
      const createAction = setNamespace('app');
      const complexPayload = {
        user: {
          id: 123,
          profile: {
            name: 'John Doe',
            settings: {
              theme: 'dark',
              notifications: true,
            },
          },
        },
        metadata: {
          timestamp: Date.now(),
          source: 'api',
        },
      };

      const action = createAction('userUpdate', complexPayload);

      expect(action).toEqual({
        type: 'app/userUpdate',
        payload: complexPayload,
      });
    });

    it('should create unique namespaces for different instances', () => {
      const userActions = setNamespace('user');
      const postActions = setNamespace('post');

      const userLogin = userActions('login');
      const postCreate = postActions('create');

      expect(userLogin).toBe('user/login');
      expect(postCreate).toBe('post/create');
    });

    it('should handle special characters in namespace and type', () => {
      const createAction = setNamespace('my-feature_v2');
      const actionType = createAction('save-data_with-id');

      expect(actionType).toBe('my-feature_v2/save-data_with-id');
    });

    it('should maintain type consistency across calls', () => {
      const createAction = setNamespace('counter');

      // Multiple calls should work consistently
      const increment1 = createAction('increment');
      const increment2 = createAction('increment');

      expect(increment1).toBe('counter/increment');
      expect(increment2).toBe('counter/increment');
      expect(increment1).toBe(increment2);
    });
  });
});
