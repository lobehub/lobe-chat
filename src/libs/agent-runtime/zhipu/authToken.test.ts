// @vitest-environment node
import { generateApiToken } from './authToken';

describe('generateApiToken', () => {
  it('should throw an error if no apiKey is provided', async () => {
    await expect(generateApiToken()).rejects.toThrow('Invalid apiKey');
  });

  it('should throw an error if apiKey is invalid', async () => {
    await expect(generateApiToken('invalid')).rejects.toThrow('Invalid apiKey');
  });

  it('should return a token if a valid apiKey is provided', async () => {
    const apiKey = 'id.secret';
    const token = await generateApiToken(apiKey);
    expect(token).toBeDefined();
  });
});
