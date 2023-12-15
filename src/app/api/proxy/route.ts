export const runtime = 'edge';

/**
 * just for a proxy
 */
export const POST = async (req: Request) => {
  const url = await req.text();

  return fetch(url);
};
