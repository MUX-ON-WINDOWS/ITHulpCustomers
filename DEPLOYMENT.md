# Deployment Guide - IT Hulp Klantensysteem op CasaOS

Dit document beschrijft hoe je de IT Hulp Klantensysteem applicatie deployt op je CasaOS server.

## Vereisten

- CasaOS server met Docker ondersteuning
- MySQL database (kan op dezelfde server of extern)
- Toegang tot CasaOS web interface
- Git (optioneel, voor code deployment)

## Stappenplan

### Stap 1: Voorbereiding

1. **Zorg dat je MySQL database draait**
   - Controleer of je MySQL database bereikbaar is
   - Noteer je database credentials:
     - Host (bijv. `100.116.74.88` of `localhost`)
     - Port (standaard `3306`)
     - Username
     - Password
     - Database naam

2. **Maak een JWT secret aan**
   - Genereer een willekeurige string voor JWT_SECRET
   - Bijvoorbeeld: `openssl rand -base64 32`

### Stap 2: Code uploaden naar CasaOS

**Optie A: Via Git (aanbevolen)**
```bash
# Op je CasaOS server
cd /DATA/AppData
git clone <jouw-repository-url> ithulp-customers
cd ithulp-customers
```

**Optie B: Via SCP/SFTP**
- Upload de hele project folder naar je CasaOS server
- Bijvoorbeeld naar: `/DATA/AppData/ithulp-customers`

**Optie C: Via CasaOS File Manager**
- Gebruik de web interface om bestanden te uploaden

### Stap 3: Environment variabelen configureren

1. Maak een `.env` bestand in de project root:
```bash
cd /DATA/AppData/ithulp-customers
nano .env
```

2. Voeg de volgende variabelen toe:
```env
NODE_ENV=production
PORT=5000
DB_HOST=100.116.74.88
DB_PORT=3306
DB_USER=casaos
DB_PASSWORD=casaos
DB_NAME=casaos
JWT_SECRET=jouw-geheime-jwt-sleutel-minimaal-32-karakters-lang
```

**Belangrijk:** 
- Vervang de database credentials met je eigen waarden
- Gebruik een sterke JWT_SECRET (minimaal 32 karakters)

### Stap 4: Database initialiseren

1. **Maak de database aan (als deze nog niet bestaat):**
```sql
CREATE DATABASE IF NOT EXISTS casaos CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. **Importeer het database schema:**
```bash
mysql -h 100.116.74.88 -u casaos -p casaos < database/schema.sql
```

3. **Optioneel: Importeer klanten:**
```bash
mysql -h 100.116.74.88 -u casaos -p casaos < database/import-klanten.sql
```

### Stap 5: Docker Image bouwen

**Optie A: Via CasaOS App Store (Aanbevolen)**

1. Ga naar CasaOS App Store
2. Klik op "Custom App" of "Add App"
3. Selecteer "Docker Compose" of "Dockerfile"
4. Upload of plak de `docker-compose.yml` inhoud
5. Configureer de environment variabelen
6. Start de container

**Optie B: Via Terminal (SSH)**

```bash
cd /DATA/AppData/ithulp-customers

# Build de Docker image
docker build -t ithulp-customers:latest .

# Start met docker-compose
docker-compose up -d

# Of start direct met docker run
docker run -d \
  --name ithulp-customers \
  --restart unless-stopped \
  -p 5000:5000 \
  --env-file .env \
  ithulp-customers:latest
```

### Stap 6: Verificatie

1. **Controleer of de container draait:**
```bash
docker ps | grep ithulp-customers
```

2. **Check de logs:**
```bash
docker logs ithulp-customers
```

3. **Test de applicatie:**
   - Open je browser en ga naar: `http://<casaos-ip>:5000`
   - Je zou de login pagina moeten zien

### Stap 7: Reverse Proxy configureren (Optioneel)

Voor productie gebruik is het aanbevolen om een reverse proxy (Nginx/Caddy) te gebruiken:

**Nginx configuratie:**
```nginx
server {
    listen 80;
    server_name ithulp.jouwdomein.nl;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Troubleshooting

### Container start niet
- Check logs: `docker logs ithulp-customers`
- Controleer environment variabelen
- Verifieer database connectiviteit

### Database connectie fout
- Controleer of MySQL draait
- Verifieer database credentials in `.env`
- Test connectie: `mysql -h <host> -u <user> -p`

### Port al in gebruik
- Wijzig poort in `docker-compose.yml` en `.env`
- Of stop de service die poort 5000 gebruikt

### Frontend laadt niet
- Controleer of de build succesvol was
- Check of `client/build` folder bestaat
- Verifieer NODE_ENV=production

## Updates uitvoeren

```bash
cd /DATA/AppData/ithulp-customers

# Pull nieuwe code
git pull  # of upload nieuwe bestanden

# Rebuild en restart
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

## Backup

Maak regelmatig backups van:
- Database: `mysqldump -u casaos -p casaos > backup.sql`
- Environment file: `.env`
- Optioneel: Docker volumes

## Support

Voor problemen, check:
1. Docker logs: `docker logs ithulp-customers`
2. Database logs
3. CasaOS logs
