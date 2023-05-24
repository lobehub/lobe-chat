import { OpenAIStream, OpenAIStreamPayload } from './OpenAIStream';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing env var from OpenAI');
}

export const config = {
  runtime: 'edge',
};

export default async function handler(request: Request) {
  const payload = (await request.json()) as OpenAIStreamPayload;

  return new Response(OpenAIStream(payload));
}
