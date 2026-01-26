# Database Setup

## Database Schema Installeren

### Optie 1: Via MySQL Command Line

1. Open MySQL command line of MySQL Workbench
2. Voer het schema.sql bestand uit:
   ```bash
   mysql -u casaos -p casaos < database/schema.sql
   ```
   Of in MySQL:
   ```sql
   source database/schema.sql;
   ```

### Optie 2: Via MySQL Workbench

1. Open MySQL Workbench
2. Verbind met je MySQL server
3. Open het bestand `database/schema.sql`
4. Voer het script uit (Execute)

### Optie 3: Handmatig kopiëren

1. Open `database/schema.sql`
2. Kopieer de inhoud
3. Plak in je MySQL client en voer uit

## Database Configuratie

Zorg dat je `.env` bestand de juiste database gegevens bevat:

```
DB_HOST=localhost
DB_USER=casaos
DB_PASSWORD=casaos
DB_NAME=casaos
PORT=5000
```

## Test Data

Het schema.sql bestand bevat uit-gecommentarieerde test data. Als je deze wilt gebruiken:

1. Open `database/schema.sql`
2. Verwijder de `--` voor de INSERT statements
3. Voer het script opnieuw uit

## Tabellen Overzicht

- **customers**: Klantgegevens
- **appointments**: Afspraken met klanten
- **assignments**: Uitgevoerde opdrachten per klant

Alle tabellen hebben automatische timestamps (created_at, updated_at) en zijn gekoppeld met foreign keys.
