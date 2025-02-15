import { encode } from 'gpt-tokenizer/encoding/o200k_base';
import { NextResponse } from 'next/server';

export const POST = async (req: Request) => {
  const str = await req.text();

  return NextResponse.json({ count: encode(str).length });
};
