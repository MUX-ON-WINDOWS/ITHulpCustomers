# 🚀 CasaOS Deployment - IT Hulp Klantensysteem

## Snelle Start (5 stappen)

### 1️⃣ Upload code naar CasaOS
Upload de hele `ITHulpCustomers` folder naar:
```
/DATA/AppData/ithulp-customers/
```

### 2️⃣ Maak .env bestand
Maak een `.env` bestand in de root met:
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

### 3️⃣ Database setup
```bash
mysql -h 100.116.74.88 -u casaos -p casaos < database/schema.sql
```

### 4️⃣ Deploy via CasaOS App Store
1. Open CasaOS App Store
2. Klik "Custom App" → "Docker Compose"
3. Upload `docker-compose.yml`
4. Configureer environment variabelen
5. Start!

### 5️⃣ Toegang
Open: `http://<casaos-ip>:5000`

**Login:** admin / admin123

---

## Alternatief: Via Terminal

```bash
cd /DATA/AppData/ithulp-customers
docker-compose up -d
```

---

## 📋 Volledige instructies
Zie `DEPLOYMENT.md` voor gedetailleerde stappen en troubleshooting.
