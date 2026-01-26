# Troubleshooting - "Kon afspraken niet laden"

## Probleem
Na deployment op CasaOS krijg je de melding "Kon afspraken niet laden" terwijl het lokaal wel werkt.

## Mogelijke Oorzaken

### 1. API Routes worden niet bereikt
**Symptoom:** Frontend kan niet verbinden met `/api/appointments`

**Oplossing:**
- Controleer of de server draait: `docker logs ithulp-customers`
- Test API direct: `curl http://localhost:5000/api/appointments` (moet 401 geven zonder token)
- Controleer browser console (F12) voor exacte error

### 2. Authenticatie Token Probleem
**Symptoom:** Token wordt niet correct meegestuurd

**Oplossing:**
- Open browser console (F12)
- Check Network tab → zie je 401 errors?
- Controleer localStorage: `localStorage.getItem('token')`
- Log uit en log weer in

### 3. CORS Probleem
**Symptoom:** CORS errors in browser console

**Oplossing:**
- CORS is al geconfigureerd in server
- Als je via een ander domein toegang hebt, voeg toe aan `.env`:
  ```
  CORS_ORIGIN=https://jouw-domein.nl
  ```

### 4. Database Connectie
**Symptoom:** Server kan niet verbinden met database

**Oplossing:**
- Check logs: `docker logs ithulp-customers`
- Verifieer database credentials in `.env`
- Test database connectie: `mysql -h 100.116.74.88 -u casaos -p`

### 5. Static File Serving Probleem
**Symptoom:** Frontend laadt maar API calls werken niet

**Oplossing:**
- De static serving staat nu NA alle API routes (correct)
- Rebuild de Docker image:
  ```bash
  docker-compose down
  docker-compose build --no-cache
  docker-compose up -d
  ```

## Debug Stappen

1. **Check server logs:**
   ```bash
   docker logs -f ithulp-customers
   ```

2. **Test API direct (vanaf server):**
   ```bash
   curl -H "Authorization: Bearer <jouw-token>" http://localhost:5000/api/appointments
   ```

3. **Check browser console:**
   - Open F12 → Console tab
   - Kijk naar errors bij API calls
   - Check Network tab voor failed requests

4. **Verifieer environment:**
   ```bash
   docker exec ithulp-customers env | grep DB_
   ```

## Snelle Fix

Als het nog steeds niet werkt:

1. **Herstart container:**
   ```bash
   docker-compose restart
   ```

2. **Check of alle routes werken:**
   - Login werkt? → Auth werkt
   - Klanten laden? → Database werkt
   - Alleen afspraken niet? → Specifiek appointments probleem

3. **Clear browser cache:**
   - Hard refresh: Ctrl+Shift+R
   - Of clear localStorage en log opnieuw in

## Meest Waarschijnlijke Oorzaak

Het probleem is waarschijnlijk dat:
- De authenticatie token niet correct wordt meegestuurd
- Of de API routes worden niet correct bereikt door de static file serving

De fix die ik heb gemaakt zorgt dat:
- Static files NA alle API routes worden geserveerd
- API routes altijd voorrang hebben
- De catch-all route alleen voor non-API routes wordt gebruikt

**Herstart de container na de fix:**
```bash
docker-compose restart
```
