const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function testLogin() {
  const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'casaos',
    password: process.env.DB_PASSWORD || 'casaos',
    database: process.env.DB_NAME || 'casaos'
  };

  try {
    const connection = await mysql.createConnection(dbConfig);
    console.log('✅ Verbonden met database\n');

    // Zoek admin gebruiker
    const [users] = await connection.query(
      'SELECT id, gebruikersnaam, email, wachtwoord, rol, actief FROM users WHERE gebruikersnaam = ?',
      ['admin']
    );

    if (users.length === 0) {
      console.log('❌ Admin gebruiker niet gevonden!');
      await connection.end();
      return;
    }

    const user = users[0];
    console.log('👤 Admin gebruiker gevonden:');
    console.log('   ID:', user.id);
    console.log('   Gebruikersnaam:', user.gebruikersnaam);
    console.log('   Email:', user.email);
    console.log('   Rol:', user.rol);
    console.log('   Actief:', user.actief);
    console.log('   Wachtwoord hash:', user.wachtwoord.substring(0, 20) + '...');
    console.log('   Hash lengte:', user.wachtwoord.length, 'karakters\n');

    // Test wachtwoord
    const testPasswords = ['admin', 'admin123'];
    
    for (const password of testPasswords) {
      const isValid = await bcrypt.compare(password, user.wachtwoord);
      console.log(`🔐 Test wachtwoord "${password}":`, isValid ? '✅ CORRECT' : '❌ INCORRECT');
    }

    await connection.end();
  } catch (error) {
    console.error('❌ Fout:', error.message);
    process.exit(1);
  }
}

testLogin();
