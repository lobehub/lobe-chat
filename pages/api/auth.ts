import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { password } = req.query;

  if (password === process.env.PASSWORD) {
    res.setHeader('Set-Cookie', `password=${password}; Max-Age=864000; Path=/`);
    res.redirect('/');
  } else {
    res.status(401).send('Invalid password');
  }
}
