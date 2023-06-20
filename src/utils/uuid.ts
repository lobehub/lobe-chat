import { v4 } from 'uuid';

export const uuid = v4;
// generate('1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', 16); //=> "4f90d13a42"

import { customAlphabet } from 'nanoid/non-secure';

export const nanoid = customAlphabet(
  '1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
  8,
);
