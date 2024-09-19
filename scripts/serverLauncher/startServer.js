const dns = require('dns').promises;
const fs = require('fs');

const { spawn } = require('child_process');

// Set file paths
const DB_MIGRATION_SCRIPT_PATH = '/app/docker.cjs';
const SERVER_SCRIPT_PATH = '/app/server.js';

const PROXYCHAINS_CONF_PATH = '/etc/proxychains4.conf';

// Read proxy URL from environment variable
const PROXY_URL = process.env.PROXY_URL;

// Function to check if a string is a valid IP address
function isValidIP(ip) {
  const IP_REGEX = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/;
  return IP_REGEX.test(ip);
}

// Function to parse protocol, host and port from a URL
function parseUrl(url) {
    const urlObj = new URL(url);
    return {
        protocol: urlObj.protocol.replace(':', ''),
        host: urlObj.hostname,
        port: urlObj.port
    };
}

// Function to run the DB Migration script
async function runDBMigrationScript() {
  const server = spawn('node', [DB_MIGRATION_SCRIPT_PATH], { stdio: 'inherit' });

  server.on('close', (code) => {
    console.log(`Server exited with code ${code}`);
  });
}

// Function to run ProxyChains conf generator
async function runProxyChainsConfGenerator(url) {
  // Parse the proxy URL
  const { protocol, host, port } = parseUrl(url);

  // assume host is an IP address
  let ip = host

  // If the host is not an IP, resolve it using DNS
  if (!isValidIP(host)) {
    try {
      const result = await dns.lookup(host, { family: 4 });
      if (isValidIP(result.address)) {
        // Get the resolved IP address
        ip = result.address;

        console.log(`✅ ProxyChains: All outgoing traffic is now routed via ${protocol}://${ip}:${port}.`);
      } else {
        console.error(`❌ ProxyChains: The host "${host}" resolved to an address "${result.address}", but it is not a valid IPv4 address. Proxy setup aborted.`);
        process.exit(1);
      }
    } catch (error) {
      console.error(`❌ ProxyChains: Unable to resolve the host "${host}". Please verify your DNS configuration. Error details:`, error);
      process.exit(1);
    }
  }

  // Generate the proxychains configuration file
  const proxyChainsConfig = `
localnet 127.0.0.0/255.0.0.0
localnet ::1/128
proxy_dns
remote_dns_subnet 224
strict_chain
tcp_connect_time_out 8000
tcp_read_time_out 15000
[ProxyList]
${protocol} ${ip} ${port}
`;

  // Write configuration to the specified path
  fs.writeFileSync(PROXYCHAINS_CONF_PATH, proxyChainsConfig.trim());
}

// Function to run the server
async function runServer() {
  let server

  if (PROXY_URL) {
    // Run ProxyChain Conf Generator first
    await runProxyChainsConfGenerator();

    // Run the server using proxychains
    server = spawn('proxychains', ['-q', 'node', SERVER_SCRIPT_PATH], { stdio: 'inherit' });
  } else {
    // No proxy, run the server directly
    server = spawn('node', [SERVER_SCRIPT_PATH], { stdio: 'inherit' });
  }

  server.on('close', (code) => {
    console.log(`Server exited with code ${code}`);
  });
}

// Main
(async () => {
  if (process.env.DATABASE_DRIVER) {
    // Run the DB Migration script first
    await runDBMigrationScript();

    // If successful, proceed to run the server
    runServer();
  } else {
    // Non-database mode: Run server directly
    runServer();
  }
})();
