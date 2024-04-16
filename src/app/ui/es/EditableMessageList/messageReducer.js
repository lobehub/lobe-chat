import _toConsumableArray from "@babel/runtime/helpers/esm/toConsumableArray";
import { produce } from 'immer';
export var messagesReducer = function messagesReducer(state, payload) {
  switch (payload.type) {
    case 'addMessage':
      {
        return [].concat(_toConsumableArray(state), [payload.message]);
      }
    case 'insertMessage':
      {
        return produce(state, function (draftState) {
          draftState.splice(payload.index, 0, payload.message);
        });
      }
    case 'deleteMessage':
      {
        return state.filter(function (_, index) {
          return index !== payload.index;
        });
      }
    case 'resetMessages':
      {
        return [];
      }
    case 'updateMessage':
      {
        return produce(state, function (draftState) {
          var index = payload.index,
            message = payload.message;
          draftState[index].content = message;
        });
      }
    case 'updateMessageRole':
      {
        return produce(state, function (draftState) {
          var index = payload.index,
            role = payload.role;
          draftState[index].role = role;
        });
      }
    case 'addUserMessage':
      {
        return produce(state, function (draftState) {
          draftState.push({
            content: payload.message,
            role: 'user'
          });
        });
      }
    case 'updateLatestBotMessage':
      {
        return produce(state, function () {
          var responseStream = payload.responseStream;
          var newMessage = {
            content: responseStream.join(''),
            role: 'assistant'
          };
          return [].concat(_toConsumableArray(state.slice(0, -1)), [newMessage]);
        });
      }
    case 'setErrorMessage':
      {
        return produce(state, function (draftState) {
          var index = payload.index,
            error = payload.error;

          // @ts-ignore
          draftState[index].error = error;
        });
      }
    default:
      {
        throw new Error('暂未实现的 type，请检查 reducer');
      }
  }
};