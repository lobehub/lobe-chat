const dns = require('dns').promises;
const fs = require('fs').promises;
const tls = require('tls');
const { spawn } = require('child_process');

// Set file paths
const DB_MIGRATION_SCRIPT_PATH = '/app/docker.cjs';
const SERVER_SCRIPT_PATH = '/app/server.js';
const PROXYCHAINS_CONF_PATH = '/etc/proxychains4.conf';

// Function to check if a string is a valid IP address
const isValidIP = (ip, version = 4) => {
  const ipv4Regex = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/;
  const ipv6Regex = /^(([0-9a-f]{1,4}:){7,7}[0-9a-f]{1,4}|([0-9a-f]{1,4}:){1,7}:|([0-9a-f]{1,4}:){1,6}:[0-9a-f]{1,4}|([0-9a-f]{1,4}:){1,5}(:[0-9a-f]{1,4}){1,2}|([0-9a-f]{1,4}:){1,4}(:[0-9a-f]{1,4}){1,3}|([0-9a-f]{1,4}:){1,3}(:[0-9a-f]{1,4}){1,4}|([0-9a-f]{1,4}:){1,2}(:[0-9a-f]{1,4}){1,5}|[0-9a-f]{1,4}:((:[0-9a-f]{1,4}){1,6})|:((:[0-9a-f]{1,4}){1,7}|:)|fe80:(:[0-9a-f]{0,4}){0,4}%[0-9a-z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-f]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/;

  switch (version) {
    case 4:
      return ipv4Regex.test(ip);
    case 6:
      return ipv6Regex.test(ip);
    default:
      return ipv4Regex.test(ip) || ipv6Regex.test(ip);
  }
};

// Function to check TLS validity of a URL
const isValidTLS = (url = '') => {
  if (!url) {
    console.log('⚠️ TLS Check: No URL provided. Skipping TLS check. Ensure correct setting ENV.');
    console.log('-------------------------------------');
    return Promise.resolve();
  }

  const { protocol, host, port } = parseUrl(url);
  if (protocol !== 'https') {
    console.log(`⚠️ TLS Check: Non-HTTPS protocol (${protocol}). Skipping TLS check for ${url}.`);
    console.log('-------------------------------------');
    return Promise.resolve();
  }

  const options = { host, port, servername: host };
  return new Promise((resolve, reject) => {
    const socket = tls.connect(options, () => {
      if (socket.authorized) {
        console.log(`✅ TLS Check: Valid certificate for ${host}:${port}.`);
        console.log('-------------------------------------');
        resolve();
      }
      socket.end();
    });

    socket.on('error', (err) => {
      const errMsg = `❌ TLS Check: Error for ${host}:${port}. Details:`;
      switch (err.code) {
        case 'CERT_HAS_EXPIRED':
        case 'DEPTH_ZERO_SELF_SIGNED_CERT':
          console.error(`${errMsg} Certificate is not valid. Consider setting NODE_TLS_REJECT_UNAUTHORIZED="0" or mapping /etc/ssl/certs/ca-certificates.crt.`);
          break;
        case 'UNABLE_TO_GET_ISSUER_CERT_LOCALLY':
          console.error(`${errMsg} Unable to verify issuer. Ensure correct mapping of /etc/ssl/certs/ca-certificates.crt.`);
          break;
        default:
          console.error(`${errMsg} Network issue. Check firewall or DNS.`);
          break;
      }
      reject(err);
    });
  });
};

// Function to check TLS connections for OSS and Auth Issuer
const checkTLSConnections = async () => {
  await Promise.all([
    isValidTLS(process.env.S3_ENDPOINT),
    isValidTLS(process.env.S3_PUBLIC_DOMAIN),
    isValidTLS(getEnvVarsByKeyword('_ISSUER')),
  ]);
};

// Function to get environment variable by keyword
const getEnvVarsByKeyword = (keyword) => {
  return Object.entries(process.env)
    .filter(([key, value]) => key.includes(keyword) && value)
    .map(([, value]) => value)[0] || null;
};

// Function to parse protocol, host and port from a URL
const parseUrl = (url) => {
  const { protocol, hostname: host, port } = new URL(url);
  return { protocol: protocol.replace(':', ''), host, port: port || 443 };
};

// Function to resolve host IP via DNS
const resolveHostIP = async (host, version = 4) => {
  try {
    const { address } = await dns.lookup(host, { family: version });

    if (!isValidIP(address, version)) {
      console.error(`❌ DNS Error: Invalid resolved IP: ${address}. IP address must be IPv${version}.`);
      process.exit(1);
    }

    return address;
  } catch (err) {
    console.error(`❌ DNS Error: Could not resolve ${host}. Check DNS server:`);
    console.error(err);
    process.exit(1);
  }
};

// Function to generate proxychains configuration
const runProxyChainsConfGenerator = async (url) => {
  const { protocol, host, port } = parseUrl(url);

  if (!['http', 'socks4', 'socks5'].includes(protocol)) {
    console.error(`❌ ProxyChains: Invalid protocol (${protocol}). Protocol must be 'http', 'socks4' and 'socks5'.`);
    process.exit(1);
  }

  const validPort = parseInt(port, 10);
  if (isNaN(validPort) || validPort <= 0 || validPort > 65535) {
    console.error(`❌ ProxyChains: Invalid port (${port}). Port must be a number between 1 and 65535.`);
    process.exit(1);
  }

  let ip = isValidIP(host, 4) ? host : await resolveHostIP(host, 4);

  const configContent = `
localnet 127.0.0.0/255.0.0.0
localnet ::1/128
proxy_dns
remote_dns_subnet 224
strict_chain
tcp_connect_time_out 8000
tcp_read_time_out 15000
[ProxyList]
${protocol} ${ip} ${port}
`.trim();

  await fs.writeFile(PROXYCHAINS_CONF_PATH, configContent);
  console.log(`✅ ProxyChains: All outgoing traffic routed via ${protocol}://${ip}:${port}.`);
  console.log('-------------------------------------');
};

// Function to execute a script with child process spawn
const runScript = (scriptPath, useProxy = false) => {
  const command = useProxy ? ['/bin/proxychains', '-q', '/bin/node', scriptPath] : ['/bin/node', scriptPath];
  return new Promise((resolve, reject) => {
    const process = spawn(command.shift(), command, { stdio: 'inherit' });
    process.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`🔴 Process exited with code ${code}`))));
  });
};

// Main function to run the server with optional proxy
const runServer = async () => {
  const PROXY_URL = process.env.PROXY_URL || ''; // Default empty string to avoid undefined errors

  if (PROXY_URL) {
    await runProxyChainsConfGenerator(PROXY_URL);
    return runScript(SERVER_SCRIPT_PATH, true);
  }
  return runScript(SERVER_SCRIPT_PATH);
};

// Main execution block
(async () => {
  console.log('🌐 DNS Server:', dns.getServers());
  console.log('-------------------------------------');

  if (process.env.DATABASE_DRIVER) {
    try {
      try {
        await fs.access(DB_MIGRATION_SCRIPT_PATH);

        await runScript(DB_MIGRATION_SCRIPT_PATH);
      } catch (err) {
        if (err.code === 'ENOENT') {
          console.log(`⚠️ DB Migration: Not found ${DB_MIGRATION_SCRIPT_PATH}. Skipping DB migration. Ensure to migrate database manually.`);
          console.log('-------------------------------------');
        } else {
          console.error('❌ Error during DB migration:');
          console.error(err);
          process.exit(1);
        }
      }

      await checkTLSConnections();
    } catch (err) {
      console.error('❌ Error during TLS connection check:');
      console.error(err);
      process.exit(1);
    }
  }

  // Run the server in either database or non-database mode
  await runServer();
})();
