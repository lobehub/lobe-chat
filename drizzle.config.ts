import * as dotenv from 'dotenv';
import type { Config } from 'drizzle-kit';

// Read the .env file if it exists, or a file specified by the

// dotenv_config_path parameter that's passed to Node.js

dotenv.config();

let connectionString = process.env.DATABASE_URL;

if (process.env.NODE_ENV === 'test') {
  console.log('current ENV:', process.env.NODE_ENV);
  connectionString = process.env.DATABASE_TEST_URL;
}

if (!connectionString)
  throw new Error('`DATABASE_URL` or `DATABASE_TEST_URL` not found in environment');

export default {
  dbCredentials: {
    url: connectionString,
  },
  dialect: 'postgresql',
  out: './src/database/migrations',

  schema: './src/database/schemas',
  strict: true,
} satisfies Config;
