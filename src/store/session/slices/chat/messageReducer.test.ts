test('placeholder', () => {});
// describe('messagesReducer', () => {
//   let initialState: ChatMessage[];
//
//   beforeEach(() => {
//     initialState = [
//       { role: 'user', content: 'Hello!' },
//       { role: 'assistant', content: 'Hi there!' },
//     ];
//   });
//
//   it('should add a message', () => {
//     const newMessage: ChatMessage = { role: 'user', content: 'How are you?' };
//     const action: MessageDispatch = { type: 'addMessage', message: newMessage };
//     const newState = messagesReducer(initialState, action);
//     expect(newState).toEqual([...initialState, newMessage]);
//   });
//
//   it('should delete a message', () => {
//     const action: MessageDispatch = { type: 'deleteMessage', index: 1 };
//     const newState = messagesReducer(initialState, action);
//     expect(newState).toEqual([{ role: 'user', content: 'Hello!' }]);
//   });
//
//   it('should update a message', () => {
//     const action: MessageDispatch = { type: 'updateMessage', index: 1, message: 'I am fine!' };
//     const newState = messagesReducer(initialState, action);
//     expect(newState).toEqual([
//       { role: 'user', content: 'Hello!' },
//       { role: 'assistant', content: 'I am fine!' },
//     ]);
//   });
//
//   it('should add a user message', () => {
//     const action: MessageDispatch = { type: 'addUserMessage', message: 'Goodbye!' };
//     const newState = messagesReducer(initialState, action);
//     expect(newState).toEqual([
//       { role: 'user', content: 'Hello!' },
//       { role: 'assistant', content: 'Hi there!' },
//       { role: 'user', content: 'Goodbye!' },
//     ]);
//   });
//
//   it('should set error message correctly', () => {
//     const action: MessageDispatch = {
//       type: 'setErrorMessage',
//       error: { message: 'Not Found', status: 404, type: 'chatbot' },
//       index: 0,
//     };
//     const newState = messagesReducer(initialState, action);
//     expect(newState).toEqual([
//       {
//         role: 'user',
//         content: 'Hello!',
//         error: { message: 'Not Found', status: 404, type: 'chatbot' },
//       },
//       { role: 'assistant', content: 'Hi there!' },
//     ]);
//   });
//
//   it('should update the latest bot message', () => {
//     const responseStream = ['I', ' am', ' a', ' bot.'];
//     const action: MessageDispatch = { type: 'updateLatestBotMessage', responseStream };
//     const newState = messagesReducer(initialState, action);
//     expect(newState).toEqual([
//       { role: 'user', content: 'Hello!' },
//       { role: 'assistant', content: 'I am a bot.' },
//     ]);
//   });
// });
