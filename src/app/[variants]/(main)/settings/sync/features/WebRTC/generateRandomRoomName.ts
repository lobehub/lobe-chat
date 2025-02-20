export const generateRandomRoomName = async () => {
  const { generate } = await import('random-words');
  return (generate(3) as string[]).join('-');
};
