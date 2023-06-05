import generate from 'nanoid/generate';

export const uuid = () => generate('1234567890abcdefghijklmnopqrstuvwxyz', 16); //=> "4f90d13a42"
