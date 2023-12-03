import { Imgur } from './imgur';

const updateByImgur = async ({ url, blob }: { blob?: Blob; url?: string }) => {
  let imageBlob: Blob;

  if (url) {
    const res = await fetch(url);
    imageBlob = await res.blob();
  } else if (blob) {
    imageBlob = blob;
  } else {
    // TODO: error handle
    return;
  }

  const imgur = new Imgur();

  return await imgur.upload(imageBlob);
};

export const POST = async (req: Request) => {
  const { url } = await req.json();

  const cdnUrl = await updateByImgur({ url });

  return new Response(JSON.stringify({ url: cdnUrl }));
};
// import { Imgur } from './imgur';

export const runtime = 'edge';

// export const POST = async (req: Request) => {
//   const { url } = await req.json();
//
//   const imgur = new Imgur();
//
//   const image = await fetch(url);
//
//   const cdnUrl = await imgur.upload(await image.blob());
//
//   return new Response(JSON.stringify({ url: cdnUrl }));
// };
