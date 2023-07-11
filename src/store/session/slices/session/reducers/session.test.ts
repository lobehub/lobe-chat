// describe('sessionsReducer', () => {
//   let initialState: LobeSessions;
//
//   beforeEach(() => {
//     initialState = {};
//   });
//
//   it('adds a session to the state', () => {
//     const session: LobeAgentSession = {
//       id: '123',
//       type: LobeSessionType.Agent,
//       config: {
//         model: LanguageModel.GPT3_5,
//         params: {
//           temperature: 0.6,
//         },
//         systemRole: 'system',
//       },
//       chats: [],
//       meta: {},
//     };
//
//     const action: SessionDispatch = {
//       type: 'addSession',
//       session,
//     };
//
//     const newState = sessionsReducer(initialState, action);
//
//     expect(newState).toEqual({
//       [session.id]: session,
//     });
//   });
//
//   it('does not add a session if it already exists', () => {
//     const session: LobeAgentSession = {
//       id: '123',
//       type: LobeSessionType.Agent,
//       config: {
//         model: LanguageModel.GPT3_5,
//         params: {
//           temperature: 0.6,
//         },
//         systemRole: 'system',
//       },
//       chats: [],
//       meta: {},
//     };
//
//     initialState = {
//       [session.id]: session,
//     };
//
//     const action: SessionDispatch = {
//       type: 'addSession',
//       session,
//     };
//
//     const newState = sessionsReducer(initialState, action);
//
//     expect(newState).toEqual(initialState);
//   });
//
//   it('removes a session from the state', () => {
//     const session: LobeAgentSession = {
//       id: '123',
//       type: LobeSessionType.Agent,
//       config: {
//         model: LanguageModel.GPT3_5,
//         params: {
//           temperature: 0.6,
//         },
//         systemRole: 'system',
//       },
//       chats: [],
//       meta: {},
//     };
//
//     initialState = {
//       [session.id]: session,
//     };
//
//     const action: SessionDispatch = {
//       type: 'removeSession',
//       id: session.id,
//     };
//
//     const newState = sessionsReducer(initialState, action);
//
//     expect(newState).toEqual({});
//   });
//
//   it('does not remove a session if it does not exist', () => {
//     const session: LobeAgentSession = {
//       id: '123',
//       type: LobeSessionType.Agent,
//       config: {
//         model: LanguageModel.GPT3_5,
//         params: {
//           temperature: 0.6,
//         },
//         systemRole: 'system',
//       },
//       chats: [],
//       meta: {},
//     };
//
//     initialState = {
//       [session.id]: session,
//     };
//
//     const action: SessionDispatch = {
//       type: 'removeSession',
//       id: '456',
//     };
//
//     const newState = sessionsReducer(initialState, action);
//
//     expect(newState).toEqual(initialState);
//   });
//
//   it('updates the chat for a session', () => {
//     const session: LobeAgentSession = {
//       id: '123',
//       type: LobeSessionType.Agent,
//       config: {
//         model: LanguageModel.GPT3_5,
//         params: {
//           temperature: 0.6,
//         },
//         systemRole: 'system',
//       },
//       chats: [],
//       meta: {},
//     };
//
//     initialState = {
//       [session.id]: session,
//     };
//
//     const newChats: ChatMessage[] = [
//       {
//         id: '123',
//         content: 'Hello',
//         createAt: Date.now(),
//         role: 'user',
//         meta: {},
//       },
//       {
//         id: '456',
//         content: 'Hi there',
//         createAt: Date.now(),
//         role: 'user',
//         meta: {},
//       },
//     ];
//
//     const action: SessionDispatch = {
//       type: 'updateSessionChat',
//       id: session.id,
//       chats: newChats,
//     };
//
//     const newState = sessionsReducer(initialState, action);
//
//     expect(newState[session.id].chats).toEqual(newChats);
//   });
//
//   it('does not update the chat for a session if it does not exist', () => {
//     const session: LobeAgentSession = {
//       id: '123',
//       type: LobeSessionType.Agent,
//       config: {
//         model: LanguageModel.GPT3_5,
//         params: {
//           temperature: 0.6,
//         },
//         systemRole: 'system',
//       },
//       chats: [],
//       meta: {},
//     };
//
//     initialState = {
//       [session.id]: session,
//     };
//
//     const newChats: ChatMessage[] = [
//       {
//         id: '123',
//         content: 'Hello',
//         createAt: Date.now(),
//         role: 'user',
//         meta: {},
//       },
//       {
//         id: '456',
//         content: 'Hi there',
//         createAt: Date.now(),
//         role: 'user',
//         meta: {},
//       },
//     ];
//
//     const action: SessionDispatch = {
//       type: 'updateSessionChat',
//       id: '456',
//       chats: newChats,
//     };
//
//     const newState = sessionsReducer(initialState, action);
//
//     expect(newState).toEqual(initialState);
//   });
//
//   it('updates the meta for a session', () => {
//     const session: LobeAgentSession = {
//       id: '123',
//       type: LobeSessionType.Agent,
//       config: {
//         model: LanguageModel.GPT3_5,
//         params: {
//           temperature: 0.6,
//         },
//         systemRole: 'system',
//       },
//       chats: [],
//       meta: {
//         title: 'Session 1',
//         description: 'This is session 1',
//       },
//     };
//
//     initialState = {
//       [session.id]: session,
//     };
//
//     const newMetaValue = 'Session 2';
//
//     const action: SessionDispatch = {
//       type: 'updateSessionMeta',
//       id: session.id,
//       key: 'title',
//       value: newMetaValue,
//     };
//
//     const newState = sessionsReducer(initialState, action);
//
//     expect(newState[session.id].meta.title).toEqual(newMetaValue);
//   });
//
//   it('does not update the meta for a session if it does not exist', () => {
//     const session: LobeAgentSession = {
//       id: '123',
//       type: LobeSessionType.Agent,
//       config: {
//         model: LanguageModel.GPT3_5,
//         params: {
//           temperature: 0.6,
//         },
//         systemRole: 'system',
//       },
//       chats: [],
//       meta: {
//         title: 'Session 1',
//         description: 'This is session 1',
//       },
//     };
//
//     initialState = {
//       [session.id]: session,
//     };
//
//     const newMetaValue = 'Session 2';
//
//     const action: SessionDispatch = {
//       type: 'updateSessionMeta',
//       id: '456',
//       key: 'title',
//       value: newMetaValue,
//     };
//
//     const newState = sessionsReducer(initialState, action);
//
//     expect(newState).toEqual(initialState);
//   });
//
//   it('returns the initial state if the action type is invalid', () => {
//     // @ts-ignore
//     const action: SessionDispatch = { type: 'invalidAction' };
//
//     const initialState = {};
//     const newState = sessionsReducer(initialState, action);
//
//     expect(newState).toEqual(initialState);
//   });
// });
