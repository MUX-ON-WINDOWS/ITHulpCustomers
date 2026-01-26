const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function fixAdminPassword() {
  const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'casaos',
    password: process.env.DB_PASSWORD || 'casaos',
    database: process.env.DB_NAME || 'casaos'
  };

  try {
    const connection = await mysql.createConnection(dbConfig);
    console.log('✅ Verbonden met database');

    // Hash het wachtwoord
    const password = 'admin123'; // Standaard wachtwoord
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('✅ Wachtwoord gehashed');

    // Update admin gebruiker
    const [result] = await connection.query(
      'UPDATE users SET wachtwoord = ? WHERE gebruikersnaam = ?',
      [hashedPassword, 'admin']
    );

    if (result.affectedRows > 0) {
      console.log('✅ Admin wachtwoord bijgewerkt!');
      console.log('   Gebruikersnaam: admin');
      console.log('   Wachtwoord: admin123');
    } else {
      // Maak admin gebruiker aan als deze niet bestaat
      await connection.query(
        'INSERT INTO users (gebruikersnaam, email, wachtwoord, voornaam, achternaam, rol) VALUES (?, ?, ?, ?, ?, ?)',
        ['admin', 'admin@ithulp.nl', hashedPassword, 'Admin', 'Gebruiker', 'admin']
      );
      console.log('✅ Admin gebruiker aangemaakt!');
      console.log('   Gebruikersnaam: admin');
      console.log('   Wachtwoord: admin123');
    }

    await connection.end();
    console.log('✅ Klaar! Je kunt nu inloggen met admin/admin123');
  } catch (error) {
    console.error('❌ Fout:', error.message);
    console.error('   Stack:', error.stack);
    console.error('\n   Controleer:');
    console.error('   - Is .env bestand aanwezig?');
    console.error('   - Zijn database credentials correct?');
    console.error('   - Draait MySQL?');
    process.exit(1);
  }
}

fixAdminPassword();
