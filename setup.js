const fs = require('fs');
const path = require('path');

// Create .env file if it doesn't exist
const envPath = path.join(__dirname, '.env');
const envExamplePath = path.join(__dirname, '.env.example');

if (!fs.existsSync(envPath)) {
  if (fs.existsSync(envExamplePath)) {
    fs.copyFileSync(envExamplePath, envPath);
    console.log('✅ .env bestand aangemaakt van .env.example');
  } else {
    // Tailscale IP - Vervang dit met je eigen Tailscale IP van je CasaOS server
    // Je vindt je Tailscale IP in de Tailscale admin console of met: tailscale ip
    const envContent = `DB_HOST=100.116.74.88
DB_USER=casaos
DB_PASSWORD=casaos
DB_NAME=casaos
PORT=5000
JWT_SECRET=jouw-geheime-sleutel-wijzig-dit-voor-productie
`;
    fs.writeFileSync(envPath, envContent);
    console.log('✅ .env bestand aangemaakt met standaard waarden');
  }
} else {
  console.log('ℹ️  .env bestand bestaat al');
}

// Create client/.env file for React
const clientEnvPath = path.join(__dirname, 'client', '.env');
if (!fs.existsSync(clientEnvPath)) {
  const clientEnvContent = `SKIP_PREFLIGHT_CHECK=true
DANGEROUSLY_DISABLE_HOST_CHECK=true
`;
  fs.writeFileSync(clientEnvPath, clientEnvContent);
  console.log('✅ client/.env bestand aangemaakt voor React');
} else {
  console.log('ℹ️  client/.env bestand bestaat al');
}
