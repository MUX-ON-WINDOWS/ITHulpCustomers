# CasaOS Deployment - Snelle Start

## Stap 1: Upload code naar CasaOS

Upload de hele `ITHulpCustomers` folder naar je CasaOS server:
- Locatie: `/DATA/AppData/ithulp-customers/`
- Via: File Manager, SCP, of Git

## Stap 2: Maak .env bestand

Maak een `.env` bestand in de root folder:

```env
NODE_ENV=production
PORT=5000
DB_HOST=100.116.74.88
DB_PORT=3306
DB_USER=casaos
DB_PASSWORD=casaos
DB_NAME=casaos
JWT_SECRET=vervang-met-een-lange-willekeurige-string-minimaal-32-karakters
```

## Stap 3: Database setup

```bash
# Importeer schema
mysql -h 100.116.74.88 -u casaos -p casaos < database/schema.sql
```

## Stap 4: Deploy via CasaOS

### Methode A: Docker Compose (Aanbevolen)

1. Ga naar CasaOS App Store
2. Klik op "Custom App"
3. Selecteer "Docker Compose"
4. Upload of plak de inhoud van `docker-compose.yml`
5. Configureer environment variabelen
6. Start de app

### Methode B: Via Terminal

```bash
cd /DATA/AppData/ithulp-customers
docker-compose up -d
```

## Stap 5: Toegang

Open in browser: `http://<casaos-ip>:5000`

**Standaard login:**
- Gebruikersnaam: `admin`
- Wachtwoord: `admin123`

## Belangrijk

- Zorg dat poort 5000 beschikbaar is
- Database moet bereikbaar zijn vanaf de container
- JWT_SECRET moet uniek en sterk zijn
