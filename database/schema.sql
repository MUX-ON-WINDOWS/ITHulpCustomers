-- IT Hulp Klantensysteem Database Schema
-- Voer dit script uit in je MySQL database om alle tabellen aan te maken

-- Database aanmaken (als deze nog niet bestaat)
CREATE DATABASE IF NOT EXISTS casaos CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Database gebruiken
USE casaos;

-- Tabel: customers (Klanten)
CREATE TABLE IF NOT EXISTS customers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  naam VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  telefoon VARCHAR(50),
  adres TEXT,
  bedrijf VARCHAR(255),
  opmerkingen TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_naam (naam),
  INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabel: appointments (Afspraken)
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
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
  INDEX idx_customer_id (customer_id),
  INDEX idx_start_datum (start_datum),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabel: assignments (Opdrachten)
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
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
  INDEX idx_customer_id (customer_id),
  INDEX idx_start_datum (start_datum),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabel: users (Gebruikers)
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
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_gebruikersnaam (gebruikersnaam),
  INDEX idx_rol (rol)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabel: user_customers (Klant toewijzingen aan gebruikers)
CREATE TABLE IF NOT EXISTS user_customers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  customer_id INT NOT NULL,
  toegewezen_door INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
  FOREIGN KEY (toegewezen_door) REFERENCES users(id) ON DELETE SET NULL,
  UNIQUE KEY unique_user_customer (user_id, customer_id),
  INDEX idx_user_id (user_id),
  INDEX idx_customer_id (customer_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Standaard admin gebruiker aanmaken (wachtwoord: admin123)
-- Wijzig dit wachtwoord direct na installatie!
INSERT INTO users (gebruikersnaam, email, wachtwoord, voornaam, achternaam, rol) VALUES
('admin', 'admin@ithulp.nl', '$2b$10$rOzJqZqZqZqZqZqZqZqZqOqZqZqZqZqZqZqZqZqZqZqZqZqZqZq', 'Admin', 'Gebruiker', 'admin')
ON DUPLICATE KEY UPDATE gebruikersnaam=gebruikersnaam;

-- Optionele test data (uitcommentariëren als je geen test data wilt)
-- INSERT INTO customers (naam, email, telefoon, bedrijf) VALUES
-- ('Jan Jansen', 'jan@voorbeeld.nl', '0612345678', 'Voorbeeld BV'),
-- ('Piet Pietersen', 'piet@voorbeeld.nl', '0687654321', 'Test Bedrijf');

-- INSERT INTO appointments (customer_id, titel, beschrijving, start_datum, eind_datum, status) VALUES
-- (1, 'Installatie nieuwe server', 'Installeren en configureren van nieuwe server', '2024-01-15 10:00:00', '2024-01-15 14:00:00', 'gepland'),
-- (2, 'Netwerk controle', 'Periodieke controle van het netwerk', '2024-01-16 09:00:00', '2024-01-16 11:00:00', 'gepland');

-- INSERT INTO assignments (customer_id, titel, beschrijving, start_datum, eind_datum, status, kosten) VALUES
-- (1, 'Website onderhoud', 'Maandelijks onderhoud van de website', '2024-01-01', '2024-01-31', 'voltooid', 250.00),
-- (2, 'Backup systeem', 'Installatie en configuratie backup systeem', '2023-12-15', '2023-12-20', 'voltooid', 500.00);
