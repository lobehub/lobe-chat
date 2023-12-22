export const runtime = 'edge';

/**
 * just for a proxy
 */
export const POST = async (req: Request) => {
  const url = await req.text();

  const res = await fetch(url);

  return new Response(res.body, { headers: res.headers });
};
