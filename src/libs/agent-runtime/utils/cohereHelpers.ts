export const buildCohereChatHistory = (messages) => {
  return messages.map(msg => {
    return {
      message: msg.content,
      role: msg.role === 'user' ? 'USER' : 'CHATBOT',
    };
  });
};
