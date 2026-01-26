const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { authenticateToken, requireAdmin, JWT_SECRET } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MySQL Database Connection
const dbConfig = {
  host: process.env.DB_HOST || '100.116.74.88',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'casaos',
  password: process.env.DB_PASSWORD || 'casaos',
  database: process.env.DB_NAME || 'casaos',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

let pool;

async function initDatabase() {
  try {
    // Create connection pool
    pool = mysql.createPool(dbConfig);
    
    // Test connection
    const connection = await pool.getConnection();
    console.log('✅ MySQL database verbonden');
    console.log(`   Host: ${dbConfig.host}:${dbConfig.port || 3306}`);
    console.log(`   Database: ${dbConfig.database}`);
    connection.release();
    
    // Initialize database schema
    await initializeSchema();
  } catch (error) {
    console.error('❌ Database verbindingsfout:');
    console.error('   Error:', error.message);
    console.error('   Code:', error.code);
    console.error('   Config:', {
      host: dbConfig.host,
      port: dbConfig.port || 3306,
      user: dbConfig.user,
      database: dbConfig.database
    });
    console.error('\n   Controleer:');
    console.error('   - Is MySQL draaiend op', dbConfig.host, '?');
    console.error('   - Bestaat de database', dbConfig.database, '?');
    console.error('   - Zijn de credentials correct?');
    console.error('   - Is poort 3306 open in de firewall?');
    process.exit(1);
  }
}

async function initializeSchema() {
  const connection = await pool.getConnection();
  
  try {
    // Create customers table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS customers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        naam VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        telefoon VARCHAR(50),
        adres TEXT,
        bedrijf VARCHAR(255),
        opmerkingen TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    
    // Create appointments table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS appointments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        customer_id INT NOT NULL,
        titel VARCHAR(255) NOT NULL,
        beschrijving TEXT,
        start_datum DATETIME NOT NULL,
        eind_datum DATETIME,
        status VARCHAR(50) DEFAULT 'gepland',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
      )
    `);
    
    // Create assignments table (opdrachten)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS assignments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        customer_id INT NOT NULL,
        titel VARCHAR(255) NOT NULL,
        beschrijving TEXT,
        start_datum DATE NOT NULL,
        eind_datum DATE,
        status VARCHAR(50) DEFAULT 'voltooid',
        kosten DECIMAL(10, 2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
      )
    `);
    
    // Create users table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        gebruikersnaam VARCHAR(100) NOT NULL UNIQUE,
        email VARCHAR(255) NOT NULL UNIQUE,
        wachtwoord VARCHAR(255) NOT NULL,
        voornaam VARCHAR(100),
        achternaam VARCHAR(100),
        rol VARCHAR(50) DEFAULT 'gebruiker',
        actief BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    
    // Create user_customers table (klant toewijzingen)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS user_customers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        customer_id INT NOT NULL,
        toegewezen_door INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
        FOREIGN KEY (toegewezen_door) REFERENCES users(id) ON DELETE SET NULL,
        UNIQUE KEY unique_user_customer (user_id, customer_id)
      )
    `);
    
    // Create default admin user if not exists
    const [existingAdmin] = await connection.query('SELECT id FROM users WHERE gebruikersnaam = ?', ['admin']);
    if (existingAdmin.length === 0) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await connection.query(
        'INSERT INTO users (gebruikersnaam, email, wachtwoord, voornaam, achternaam, rol) VALUES (?, ?, ?, ?, ?, ?)',
        ['admin', 'admin@ithulp.nl', hashedPassword, 'Admin', 'Gebruiker', 'admin']
      );
      console.log('✅ Standaard admin gebruiker aangemaakt (gebruikersnaam: admin, wachtwoord: admin123)');
    }
    
    console.log('✅ Database schema geïnitialiseerd');
  } catch (error) {
    console.error('❌ Schema initialisatie fout:', error.message);
  } finally {
    connection.release();
  }
}

// Root route for development
if (process.env.NODE_ENV !== 'production') {
  app.get('/', (req, res) => {
    res.json({
      message: 'IT Hulp Klantensysteem API',
      version: '1.0.0',
      endpoints: {
        auth: '/api/auth',
        customers: '/api/customers',
        appointments: '/api/appointments',
        assignments: '/api/assignments',
        users: '/api/users'
      }
    });
  });
}

// ========== AUTHENTICATION API ==========

// Register new user (alleen admin)
app.post('/api/auth/register', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { gebruikersnaam, email, wachtwoord, voornaam, achternaam, rol } = req.body;
    
    // Check if user already exists
    const [existing] = await pool.query(
      'SELECT id FROM users WHERE gebruikersnaam = ? OR email = ?',
      [gebruikersnaam, email]
    );
    
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Gebruikersnaam of email bestaat al' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(wachtwoord, 10);
    
    // Insert user
    const [result] = await pool.query(
      'INSERT INTO users (gebruikersnaam, email, wachtwoord, voornaam, achternaam, rol) VALUES (?, ?, ?, ?, ?, ?)',
      [gebruikersnaam, email, hashedPassword, voornaam, achternaam, rol || 'gebruiker']
    );
    
    const [newUser] = await pool.query('SELECT id, gebruikersnaam, email, voornaam, achternaam, rol FROM users WHERE id = ?', [result.insertId]);
    res.json(newUser[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { gebruikersnaam, wachtwoord } = req.body;
    
    console.log('🔐 Login poging:', { gebruikersnaam, wachtwoordLengte: wachtwoord?.length });
    
    // Find user
    const [users] = await pool.query(
      'SELECT id, gebruikersnaam, email, wachtwoord, voornaam, achternaam, rol, actief FROM users WHERE gebruikersnaam = ? OR email = ?',
      [gebruikersnaam, gebruikersnaam]
    );
    
    console.log('👤 Gebruiker gevonden:', users.length > 0 ? 'Ja' : 'Nee');
    
    if (users.length === 0) {
      console.log('❌ Geen gebruiker gevonden');
      return res.status(401).json({ error: 'Ongeldige gebruikersnaam of wachtwoord' });
    }
    
    const user = users[0];
    console.log('👤 Gebruiker:', { id: user.id, gebruikersnaam: user.gebruikersnaam, actief: user.actief });
    console.log('🔑 Wachtwoord hash lengte:', user.wachtwoord?.length);
    
    // Check if user is active
    if (!user.actief) {
      console.log('❌ Account is gedeactiveerd');
      return res.status(403).json({ error: 'Account is gedeactiveerd' });
    }
    
    // Verify password
    const validPassword = await bcrypt.compare(wachtwoord, user.wachtwoord);
    console.log('🔐 Wachtwoord verificatie:', validPassword ? '✅ Correct' : '❌ Incorrect');
    
    if (!validPassword) {
      console.log('❌ Wachtwoord incorrect');
      return res.status(401).json({ error: 'Ongeldige gebruikersnaam of wachtwoord' });
    }
    
    // Generate token
    const token = jwt.sign(
      { id: user.id, gebruikersnaam: user.gebruikersnaam, rol: user.rol },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({
      token,
      user: {
        id: user.id,
        gebruikersnaam: user.gebruikersnaam,
        email: user.email,
        voornaam: user.voornaam,
        achternaam: user.achternaam,
        rol: user.rol
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get current user
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  console.log('👤 GET /api/auth/me - Request ontvangen');
  try {
    const [users] = await pool.query(
      'SELECT id, gebruikersnaam, email, voornaam, achternaam, rol FROM users WHERE id = ?',
      [req.user.id]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ error: 'Gebruiker niet gevonden' });
    }
    
    res.json(users[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========== USERS API ==========

// Get all users (alleen admin)
app.get('/api/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, gebruikersnaam, email, voornaam, achternaam, rol, actief, created_at FROM users ORDER BY achternaam ASC'
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user (alleen admin)
app.put('/api/users/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { gebruikersnaam, email, voornaam, achternaam, rol, actief, wachtwoord } = req.body;
    
    let updateQuery = 'UPDATE users SET gebruikersnaam = ?, email = ?, voornaam = ?, achternaam = ?, rol = ?, actief = ?';
    let params = [gebruikersnaam, email, voornaam, achternaam, rol, actief];
    
    if (wachtwoord) {
      const hashedPassword = await bcrypt.hash(wachtwoord, 10);
      updateQuery += ', wachtwoord = ?';
      params.push(hashedPassword);
    }
    
    updateQuery += ' WHERE id = ?';
    params.push(req.params.id);
    
    await pool.query(updateQuery, params);
    res.json({ message: 'Gebruiker bijgewerkt' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete user (alleen admin)
app.delete('/api/users/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM users WHERE id = ?', [req.params.id]);
    res.json({ message: 'Gebruiker verwijderd' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========== CUSTOMERS API ==========

// Get all customers (filtered by user access)
app.get('/api/customers', authenticateToken, async (req, res) => {
  try {
    let query, params;
    
    if (req.user.rol === 'admin') {
      // Admin ziet alle klanten
      query = 'SELECT * FROM customers ORDER BY naam ASC';
      params = [];
    } else {
      // Gebruiker ziet alleen toegewezen klanten
      query = `
        SELECT DISTINCT c.* 
        FROM customers c
        INNER JOIN user_customers uc ON c.id = uc.customer_id
        WHERE uc.user_id = ?
        ORDER BY c.naam ASC
      `;
      params = [req.user.id];
    }
    
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single customer with assignments and completed appointments
app.get('/api/customers/:id', authenticateToken, async (req, res) => {
  try {
    const [customers] = await pool.query('SELECT * FROM customers WHERE id = ?', [req.params.id]);
    if (customers.length === 0) {
      return res.status(404).json({ error: 'Klant niet gevonden' });
    }
    
    // Get assignments
    const [assignments] = await pool.query(
      'SELECT * FROM assignments WHERE customer_id = ? ORDER BY start_datum DESC',
      [req.params.id]
    );
    
    // Get completed appointments (voltooide afspraken)
    const [completedAppointments] = await pool.query(
      `SELECT 
        id,
        customer_id,
        titel,
        beschrijving,
        DATE(start_datum) as start_datum,
        DATE(eind_datum) as eind_datum,
        status,
        created_at,
        updated_at,
        'appointment' as source
      FROM appointments 
      WHERE customer_id = ? AND status = 'voltooid' 
      ORDER BY start_datum DESC`,
      [req.params.id]
    );
    
    // Combine assignments and completed appointments
    // Convert appointments to assignment-like format
    const allAssignments = [
      ...assignments.map(a => ({ ...a, source: 'assignment' })),
      ...completedAppointments.map(apt => ({
        id: `apt_${apt.id}`, // Prefix to avoid ID conflicts
        customer_id: apt.customer_id,
        titel: apt.titel,
        beschrijving: apt.beschrijving,
        start_datum: apt.start_datum,
        eind_datum: apt.eind_datum,
        status: apt.status,
        kosten: null, // Appointments don't have costs
        created_at: apt.created_at,
        updated_at: apt.updated_at,
        source: 'appointment',
        appointment_id: apt.id // Keep original appointment ID
      }))
    ].sort((a, b) => {
      // Sort by date descending
      const dateA = new Date(a.start_datum);
      const dateB = new Date(b.start_datum);
      return dateB - dateA;
    });
    
    res.json({ ...customers[0], assignments: allAssignments });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create customer (alleen admin)
app.post('/api/customers', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { naam, email, telefoon, adres, bedrijf, opmerkingen } = req.body;
    const [result] = await pool.query(
      'INSERT INTO customers (naam, email, telefoon, adres, bedrijf, opmerkingen) VALUES (?, ?, ?, ?, ?, ?)',
      [naam, email, telefoon, adres, bedrijf, opmerkingen]
    );
    res.json({ id: result.insertId, ...req.body });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update customer (alleen admin)
app.put('/api/customers/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { naam, email, telefoon, adres, bedrijf, opmerkingen } = req.body;
    await pool.query(
      'UPDATE customers SET naam = ?, email = ?, telefoon = ?, adres = ?, bedrijf = ?, opmerkingen = ? WHERE id = ?',
      [naam, email, telefoon, adres, bedrijf, opmerkingen, req.params.id]
    );
    res.json({ message: 'Klant bijgewerkt' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete customer (alleen admin)
app.delete('/api/customers/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    await pool.query('DELETE FROM customers WHERE id = ?', [req.params.id]);
    res.json({ message: 'Klant verwijderd' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Assign customer to user(s) (alleen admin)
app.post('/api/customers/:id/assign', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { user_ids } = req.body; // Array van user IDs
    const customerId = req.params.id;
    const assignedBy = req.user.id;
    
    // Verwijder bestaande toewijzingen voor deze klant
    await pool.query('DELETE FROM user_customers WHERE customer_id = ?', [customerId]);
    
    // Voeg nieuwe toewijzingen toe
    if (user_ids && user_ids.length > 0) {
      const values = user_ids.map(userId => [userId, customerId, assignedBy]);
      await pool.query(
        'INSERT INTO user_customers (user_id, customer_id, toegewezen_door) VALUES ?',
        [values]
      );
    }
    
    res.json({ message: 'Klant toegewezen aan gebruikers' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get users assigned to customer
app.get('/api/customers/:id/users', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT u.id, u.gebruikersnaam, u.email, u.voornaam, u.achternaam, u.rol
      FROM users u
      INNER JOIN user_customers uc ON u.id = uc.user_id
      WHERE uc.customer_id = ?
    `, [req.params.id]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========== APPOINTMENTS API ==========

// Get all appointments (filtered by user access)
app.get('/api/appointments', authenticateToken, async (req, res) => {
  console.log('📅 GET /api/appointments - Request ontvangen');
  try {
    let query, params;
    
    if (req.user.rol === 'admin') {
      query = `
        SELECT a.*, c.naam as customer_naam 
        FROM appointments a 
        LEFT JOIN customers c ON a.customer_id = c.id 
        ORDER BY a.start_datum ASC
      `;
      params = [];
    } else {
      query = `
        SELECT DISTINCT a.*, c.naam as customer_naam 
        FROM appointments a 
        LEFT JOIN customers c ON a.customer_id = c.id
        INNER JOIN user_customers uc ON c.id = uc.customer_id
        WHERE uc.user_id = ?
        ORDER BY a.start_datum ASC
      `;
      params = [req.user.id];
    }
    
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get appointments for date range
app.get('/api/appointments/range', authenticateToken, async (req, res) => {
  try {
    const { start, end } = req.query;
    const [rows] = await pool.query(`
      SELECT a.*, c.naam as customer_naam 
      FROM appointments a 
      LEFT JOIN customers c ON a.customer_id = c.id 
      WHERE a.start_datum >= ? AND a.start_datum <= ?
      ORDER BY a.start_datum ASC
    `, [start, end]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create appointment (authenticated users)
app.post('/api/appointments', authenticateToken, async (req, res) => {
  try {
    const { customer_id, titel, beschrijving, start_datum, eind_datum, status } = req.body;
    const [result] = await pool.query(
      'INSERT INTO appointments (customer_id, titel, beschrijving, start_datum, eind_datum, status) VALUES (?, ?, ?, ?, ?, ?)',
      [customer_id, titel, beschrijving, start_datum, eind_datum, status || 'gepland']
    );
    res.json({ id: result.insertId, ...req.body });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update appointment (authenticated users)
app.put('/api/appointments/:id', authenticateToken, async (req, res) => {
  try {
    const { customer_id, titel, beschrijving, start_datum, eind_datum, status } = req.body;
    
    // Get current appointment to check if status changed to 'voltooid'
    const [currentAppointments] = await pool.query(
      'SELECT * FROM appointments WHERE id = ?',
      [req.params.id]
    );
    
    if (currentAppointments.length === 0) {
      return res.status(404).json({ error: 'Afspraak niet gevonden' });
    }
    
    const currentAppointment = currentAppointments[0];
    const wasVoltooid = currentAppointment.status === 'voltooid';
    const isNowVoltooid = status === 'voltooid';
    
    // Update appointment
    await pool.query(
      'UPDATE appointments SET customer_id = ?, titel = ?, beschrijving = ?, start_datum = ?, eind_datum = ?, status = ? WHERE id = ?',
      [customer_id, titel, beschrijving, start_datum, eind_datum, status, req.params.id]
    );
    
    // If status changed to 'voltooid', create assignment automatically
    if (!wasVoltooid && isNowVoltooid) {
      // Convert DATETIME to DATE for assignments
      const startDate = start_datum ? start_datum.split(' ')[0] : null;
      const endDate = eind_datum ? eind_datum.split(' ')[0] : null;
      
      // Check if assignment already exists for this appointment (prevent duplicates)
      const [existingAssignments] = await pool.query(
        'SELECT id FROM assignments WHERE customer_id = ? AND titel = ? AND DATE(start_datum) = ?',
        [customer_id, titel, startDate]
      );
      
      if (existingAssignments.length === 0) {
        // Create assignment from appointment data
        await pool.query(
          'INSERT INTO assignments (customer_id, titel, beschrijving, start_datum, eind_datum, status) VALUES (?, ?, ?, ?, ?, ?)',
          [customer_id, titel, beschrijving || '', startDate, endDate, 'voltooid']
        );
        console.log(`✅ Assignment automatisch aangemaakt voor voltooide afspraak: ${titel} (Klant ID: ${customer_id})`);
      } else {
        console.log(`ℹ️ Assignment bestaat al voor deze afspraak: ${titel}`);
      }
    }
    
    res.json({ message: 'Afspraak bijgewerkt' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete appointment (authenticated users)
app.delete('/api/appointments/:id', authenticateToken, async (req, res) => {
  try {
    await pool.query('DELETE FROM appointments WHERE id = ?', [req.params.id]);
    res.json({ message: 'Afspraak verwijderd' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========== ASSIGNMENTS API ==========

// Get all assignments (filtered by user access)
app.get('/api/assignments', authenticateToken, async (req, res) => {
  try {
    let query, params;
    
    if (req.user.rol === 'admin') {
      query = `
        SELECT a.*, c.naam as customer_naam 
        FROM assignments a 
        LEFT JOIN customers c ON a.customer_id = c.id 
        ORDER BY a.start_datum DESC
      `;
      params = [];
    } else {
      query = `
        SELECT DISTINCT a.*, c.naam as customer_naam 
        FROM assignments a 
        LEFT JOIN customers c ON a.customer_id = c.id
        INNER JOIN user_customers uc ON c.id = uc.customer_id
        WHERE uc.user_id = ?
        ORDER BY a.start_datum DESC
      `;
      params = [req.user.id];
    }
    
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create assignment (authenticated users)
app.post('/api/assignments', authenticateToken, async (req, res) => {
  try {
    const { customer_id, titel, beschrijving, start_datum, eind_datum, status, kosten } = req.body;
    const [result] = await pool.query(
      'INSERT INTO assignments (customer_id, titel, beschrijving, start_datum, eind_datum, status, kosten) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [customer_id, titel, beschrijving, start_datum, eind_datum, status || 'voltooid', kosten]
    );
    res.json({ id: result.insertId, ...req.body });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update assignment (authenticated users)
app.put('/api/assignments/:id', authenticateToken, async (req, res) => {
  try {
    const { customer_id, titel, beschrijving, start_datum, eind_datum, status, kosten } = req.body;
    await pool.query(
      'UPDATE assignments SET customer_id = ?, titel = ?, beschrijving = ?, start_datum = ?, eind_datum = ?, status = ?, kosten = ? WHERE id = ?',
      [customer_id, titel, beschrijving, start_datum, eind_datum, status, kosten, req.params.id]
    );
    res.json({ message: 'Opdracht bijgewerkt' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete assignment (authenticated users)
app.delete('/api/assignments/:id', authenticateToken, async (req, res) => {
  try {
    await pool.query('DELETE FROM assignments WHERE id = ?', [req.params.id]);
    res.json({ message: 'Opdracht verwijderd' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Serve static files from React app in production (MOET NA ALLE API ROUTES)
if (process.env.NODE_ENV === 'production') {
  const path = require('path');
  const staticPath = path.join(__dirname, '../client/build');
  
  // Create static middleware
  const staticMiddleware = express.static(staticPath);
  
  // Serve static files ONLY for non-API routes
  app.use((req, res, next) => {
    if (req.path.startsWith('/api')) {
      // Skip static serving for API routes - they should be handled by API routes above
      console.log(`🔍 Static middleware: Skipping API route ${req.method} ${req.path}`);
      return next();
    }
    // For non-API routes, use static file serving
    console.log(`📁 Static middleware: Serving static for ${req.method} ${req.path}`);
    staticMiddleware(req, res, next);
  });
  
  // Serve React app for all non-API routes (catch-all moet als laatste)
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api')) {
      return res.status(404).json({ error: 'API endpoint not found' });
    }
    res.sendFile(path.join(staticPath, 'index.html'));
  });
}

// Start server
initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server draait op http://localhost:${PORT}`);
    if (process.env.NODE_ENV === 'production') {
      console.log('📦 Productie modus: React app wordt geserveerd');
    }
  });
});
