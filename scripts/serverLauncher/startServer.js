const dns = require('dns').promises;
const fs = require('fs');
const tls = require('tls');

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

// Function to check if a URL using a valid TLS certificate
function isValidTLS(url) {
  if (!url) {
    console.log('⚠️ TLS Check: No URL provided, skipping TLS check. Please ensure your ENV has been set up correctly.');
    return Promise.resolve();  // Return a resolved promise to keep the function's return type consistent
  }

  let { host, port } = parseUrl(url);
  port = port || 443;

  const options = {
    host: host,
    port: Number( port ),
    servername: host
  };

  return new Promise((resolve, reject) => {
    const socket = tls.connect(options, () => {
      if (socket.authorized) {
        console.log(`✅ TLS Check: Certificate for ${host}:${port} is valid.`);
        console.log('-------------------------------------');
        resolve();
      }

      socket.end();
    });

    socket.on('error', (err) => {
      if (err.code === 'DEPTH_ZERO_SELF_SIGNED_CERT' || err.code === 'CERT_HAS_EXPIRED') {
        console.error(`❌ TLS Check: Certificate for ${host}:${port} is not valid. You can set NODE_TLS_REJECT_UNAUTHORIZED="0" or map /etc/ssl/certs/ca-certificates.crt to your Docker container. Error details:`);
      } else if (err.code === 'UNABLE_TO_GET_ISSUER_CERT_LOCALLY') {
        console.error(`❌ TLS Check: Unable to verify the issuer of the certificate for ${host}:${port}. Please ensure /etc/ssl/certs/ca-certificates.crt is correctly mapped in your Docker container. Error details:`);
      } else {
        console.error(`❌ TLS Check: Unable to connect ${host}:${port}. Please check your network connection or firewall rule. Error details:`);
      }
      reject(err);
    });
  });
}

// Function to get env vars by keyword
function getEnvVarsByKeyword(keyword) {
  const value = Object.keys(process.env)
    .filter(key => key.includes(keyword) && process.env[key]) // filter by keywords & exclude empty value
    .map(key => process.env[key]) // get matched keys
    .shift(); // get the first value

  return value || null;
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
  return new Promise((resolve, reject) => {
    const server = spawn('node', [DB_MIGRATION_SCRIPT_PATH], { stdio: 'inherit' });

    server.on('close', (code) => {
      if (code !== 0) {
        reject();
      } else {
        resolve();
      }
    });
  });
}

// Function to run OSS connection checker
async function runOSSConnChecker() {
  isValidTLS(process.env.S3_ENDPOINT);
  isValidTLS(process.env.S3_PUBLIC_DOMAIN);
}

// Function to run auth issuer connection checker
async function runAuthIssuerConnChecker() {
  isValidTLS(getEnvVarsByKeyword("_ISSUER"));
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
        ip = result.address;
        console.log(`✅ ProxyChains: All outgoing traffic is now routed via ${protocol}://${ip}:${port}.`);
        console.log('-------------------------------------');
      } else {
        console.error(`❌ ProxyChains: The host "${host}" resolved to an address "${result.address}", but it is not a valid IPv4 address. Please check your proxy server.`);
        process.exit(1);
      }
    } catch (error) {
      console.error(`❌ ProxyChains: Unable to resolve the host "${host}". Please check your DNS configuration. Error details:`);
      console.error(error);
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
    await runProxyChainsConfGenerator(PROXY_URL);

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

    // Run OSS Connection Checker
    await runOSSConnChecker();

    // Run Auth Issuer Connection Checker
    await runAuthIssuerConnChecker();

    // If successful, proceed to run the server
    runServer();
  } else {
    // Non-database mode: Run server directly
    runServer();
  }
})();
