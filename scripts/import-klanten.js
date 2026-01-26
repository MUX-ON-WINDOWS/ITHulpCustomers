const mysql = require('mysql2/promise');
require('dotenv').config();

const klanten = [
  { naam: 'Ad Claassen', email: null, telefoon: '0624560210', adres: 'Rosariopark 47, 5104HW Dongen' },
  { naam: 'Elly van Bree', email: null, telefoon: '0625264850', adres: 'Hazelaarstraat 7, 5104CX Dongen' },
  { naam: 'Eva Buursema', email: 'evaarie@xs4all.nl', telefoon: '0624566280', adres: 'Schweitzerstraat 64, 5101TP Dongen' },
  { naam: 'Evert', email: null, telefoon: '0637660807', adres: 'Glorieux 24, 5101 XT Dongen' },
  { naam: 'Evert Steenhagen', email: null, telefoon: '0637660807', adres: 'Glorieux 24, 5101 XT Dongen' },
  { naam: 'Ineke', email: null, telefoon: '0653376669', adres: 'Provincialeweg 237, 4909 AJ Oosteind' },
  { naam: 'Peter Vreijsen', email: null, telefoon: '0615870533', adres: 'Cimbaalpad 7, 5101 AN Dongen' },
  { naam: 'René van Strien', email: null, telefoon: '0625365518', adres: 'Tramstraat 46, 5104 GM Dongen' },
  { naam: 'Richard', email: null, telefoon: '0640863965', adres: 'Raamsdonkveer' },
  { naam: 'Ton en Trudy', email: 'trudy2453@gmail.com', telefoon: '0651394753', adres: 'Schweitzerstraat 70, 5101TP Dongen' },
  { naam: 'Yvonne', email: null, telefoon: '0653944761', adres: 'Rosariopark 100, 5104 HW Dongen' }
];

async function importKlanten() {
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

    let toegevoegd = 0;
    let overgeslagen = 0;

    for (const klant of klanten) {
      // Controleer of klant al bestaat
      const [existing] = await connection.query(
        'SELECT id FROM customers WHERE naam = ? AND telefoon = ?',
        [klant.naam, klant.telefoon]
      );

      if (existing.length > 0) {
        console.log(`⏭️  Overgeslagen: ${klant.naam} (bestaat al)`);
        overgeslagen++;
        continue;
      }

      // Voeg klant toe
      await connection.query(
        'INSERT INTO customers (naam, email, telefoon, adres) VALUES (?, ?, ?, ?)',
        [klant.naam, klant.email, klant.telefoon, klant.adres]
      );
      console.log(`✅ Toegevoegd: ${klant.naam}`);
      toegevoegd++;
    }

    console.log(`\n📊 Resultaat:`);
    console.log(`   ✅ Toegevoegd: ${toegevoegd}`);
    console.log(`   ⏭️  Overgeslagen: ${overgeslagen}`);
    console.log(`   📝 Totaal: ${klanten.length}`);

    await connection.end();
    console.log('\n✅ Klaar!');
  } catch (error) {
    console.error('❌ Fout:', error.message);
    process.exit(1);
  }
}

importKlanten();
