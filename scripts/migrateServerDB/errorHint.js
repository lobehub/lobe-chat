const PGVECTOR_HINT = `⚠️ Database migrate failed due to \`pgvector\` extension not found. Please install the \`pgvector\` extension on your postgres instance.

1) if you are using docker postgres image:
you can just use \`pgvector/pgvector:pg16\` image instead of \`postgres\`, e.g:

\`\`\`
docker run -p 5432:5432 -d --name pg -e POSTGRES_PASSWORD=mysecretpassword pgvector/pgvector:pg16
\`\`\`

2) if you are using cloud postgres instance, please contact your cloud provider for help.

if you have any other question, please open issue here: https://github.com/lobehub/lobe-chat/issues
`;

module.exports = {
  PGVECTOR_HINT,
};
