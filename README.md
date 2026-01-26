# IT Hulp Klantensysteem

Een modern klantensysteem met agenda en klantenbestand beheer, gekoppeld aan MySQL database.

## Functies

- 🔐 **Authenticatie**: Veilig inloggen met gebruikersnaam en wachtwoord
- 👤 **Gebruikersbeheer**: Admin kan gebruikers aanmaken, bewerken en beheren
- 📅 **Agenda**: Plan en beheer je afspraken met klanten
- 👥 **Klantenbestand**: Overzicht van alle klanten met contactgegevens
- 📋 **Opdrachten**: Bekijk en beheer vorige gewerkte opdrachten per klant
- 🔍 **Zoeken**: Zoek snel door je klantenbestand
- 🎯 **Klant Toewijzing**: Admin kan klanten toewijzen aan collega's
- 🔒 **Rollen**: Admin heeft volledige toegang, gebruikers zien alleen toegewezen klanten

## Vereisten

- Node.js (v14 of hoger)
- MySQL database server
- npm of yarn

## Installatie

1. **Installeer dependencies:**
   ```bash
   npm run install-all
   ```

2. **Configureer database:**
   Maak een `.env` bestand in de root directory met de volgende inhoud:
   ```
   DB_HOST=100.xxx.xxx.xxx  # Je Tailscale IP of localhost
   DB_USER=casaos
   DB_PASSWORD=casaos
   DB_NAME=casaos
   PORT=5000
   JWT_SECRET=jouw-geheime-sleutel-wijzig-dit-voor-productie
   ```
   
   **Voor Tailscale gebruikers:** Gebruik je Tailscale IP-adres (zie `TAILSCALE_SETUP.md`)
   
   Of gebruik: `npm run setup` om automatisch een `.env` bestand aan te maken

3. **Database schema installeren:**
   
   **Optie A - Automatisch (aanbevolen):**
   De applicatie maakt automatisch de benodigde tabellen aan bij de eerste start.
   
   **Optie B - Handmatig via SQL script:**
   Voer het SQL script uit in je MySQL database:
   ```bash
   mysql -u casaos -p casaos < database/schema.sql
   ```
   Of open `database/schema.sql` in MySQL Workbench en voer het uit.
   
   Zie `database/README.md` voor meer details.

## Gebruik

**Start de applicatie:**
```bash
npm run dev
```

Dit start zowel de backend server (poort 5000) als de frontend (poort 3000).

**Alleen backend:**
```bash
npm run server
```

**Alleen frontend:**
```bash
npm run client
```

Open je browser en ga naar: `http://localhost:3000`

## Database Schema

De applicatie maakt automatisch de volgende tabellen aan:

- **customers**: Klantgegevens (naam, email, telefoon, adres, bedrijf, opmerkingen)
- **appointments**: Afspraken (titel, beschrijving, datum/tijd, status, gekoppeld aan klant)
- **assignments**: Opdrachten (titel, beschrijving, datum, status, kosten, gekoppeld aan klant)

## Technologieën

- **Backend**: Node.js, Express, MySQL2
- **Frontend**: React, React Calendar, Axios
- **Styling**: CSS3 met moderne design

## Structuur

```
ITHulpCustomers/
├── server/
│   └── index.js          # Backend API server
├── client/
│   ├── src/
│   │   ├── components/   # React componenten
│   │   └── App.js        # Hoofdcomponent
│   └── public/
└── package.json
```

## API Endpoints

### Klanten
- `GET /api/customers` - Alle klanten
- `GET /api/customers/:id` - Klant met opdrachten
- `POST /api/customers` - Nieuwe klant
- `PUT /api/customers/:id` - Klant bijwerken
- `DELETE /api/customers/:id` - Klant verwijderen

### Afspraken
- `GET /api/appointments` - Alle afspraken
- `GET /api/appointments/range?start=&end=` - Afspraken in periode
- `POST /api/appointments` - Nieuwe afspraak
- `PUT /api/appointments/:id` - Afspraak bijwerken
- `DELETE /api/appointments/:id` - Afspraak verwijderen

### Opdrachten
- `GET /api/assignments` - Alle opdrachten
- `POST /api/assignments` - Nieuwe opdracht
- `PUT /api/assignments/:id` - Opdracht bijwerken
- `DELETE /api/assignments/:id` - Opdracht verwijderen

### Authenticatie
- `POST /api/auth/login` - Inloggen
- `POST /api/auth/register` - Nieuwe gebruiker (alleen admin)
- `GET /api/auth/me` - Huidige gebruiker ophalen

### Gebruikers (alleen admin)
- `GET /api/users` - Alle gebruikers
- `PUT /api/users/:id` - Gebruiker bijwerken
- `DELETE /api/users/:id` - Gebruiker verwijderen

### Klant Toewijzing (alleen admin)
- `POST /api/customers/:id/assign` - Klant toewijzen aan gebruikers
- `GET /api/customers/:id/users` - Gebruikers die toegang hebben tot klant

## Rollen en Toegang

- **Admin**: Volledige toegang tot alle functies, kan gebruikers beheren en klanten toewijzen
- **Gebruiker**: Ziet alleen klanten die aan hem/haar zijn toegewezen, kan afspraken en opdrachten beheren voor toegewezen klanten

## Licentie

ISC
