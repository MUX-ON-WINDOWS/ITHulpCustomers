# Klanten Importeren

## Optie 1: Via SQL Script (Handmatig)

1. Open MySQL Workbench of je MySQL client
2. Verbind met je database
3. Open het bestand `database/import-klanten.sql`
4. Voer het script uit

Of via command line:
```bash
mysql -h 100.116.74.88 -u casaos -p casaos < database/import-klanten.sql
```

## Optie 2: Via Node.js Script (Aanbevolen)

Voer uit vanuit de project root:
```bash
npm run import-klanten
```

Dit script:
- Controleert of klanten al bestaan (voorkomt duplicaten)
- Voegt alleen nieuwe klanten toe
- Toont een overzicht van wat is toegevoegd

## Klanten in de lijst

Het script voegt de volgende 11 klanten toe:
1. Ad Claassen
2. Elly van Bree
3. Eva Buursema
4. Evert
5. Evert Steenhagen
6. Ineke
7. Peter Vreijsen
8. René van Strien
9. Richard
10. Ton en Trudy
11. Yvonne

## Opmerkingen

- Klanten met dezelfde naam en telefoon worden overgeslagen (duplicaat check)
- Lege email velden worden als NULL opgeslagen
- Alle klanten worden toegevoegd zonder bedrijf of opmerkingen (kan later worden toegevoegd)
