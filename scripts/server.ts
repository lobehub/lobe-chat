import dotenv from 'dotenv';

async function run() {
  dotenv.config({
    override: true,
    path: [
      '.env',
      '.env.local',
      process.env.NODE_ENV && `.env.${process.env.NODE_ENV}`,
      process.env.NODE_ENV && `.env.${process.env.NODE_ENV}.local`,
    ].filter(Boolean),
  });

  const nextCommand = await import('next/dist/lib/commands').then(({ commands }) => commands);
  const command = await nextCommand[process.argv[2] ?? 'dev']();

  if (!command) throw new Error(`Command ${process.argv[2]} not found`);

  const isDevCommand =
    ['development', 'dev'].includes(process.env.NODE_ENV) || process.argv[2] === 'dev';

  const port = [
    process.env.PORT,
    isDevCommand && process.env.DEV_PORT,
    3010, // lobe chat recommend
  ]
    .map(Number)
    .find(Boolean);

  command({
    '--port': port,
    ...process.argv.slice(2),
    '_': [],
  });
}

// eslint-disable-next-line unicorn/prefer-top-level-await
run();
