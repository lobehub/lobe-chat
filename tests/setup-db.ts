// import env
import * as dotenv from 'dotenv';

dotenv.config();

process.env.TEST_SERVER_DB = '1';

// process.env.DATABASE_TEST_URL = 'postgresql://postgres:postgres@localhost:5432/postgres';
process.env.DATABASE_DRIVER = 'node';
process.env.NEXT_PUBLIC_SERVICE_MODE = 'server';
process.env.KEY_VAULTS_SECRET = 'LA7n9k3JdEcbSgml2sxfw+4TV1AzaaFU5+R176aQz4s=';
process.env.S3_PUBLIC_DOMAIN = 'https://example.com';
process.env.APP_URL = 'https://home.com';
