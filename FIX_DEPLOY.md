# Fix voor "Kon afspraken niet laden" op CasaOS

## Probleem
De API routes werden niet bereikt omdat static file serving vóór de API routes stond.

## Oplossing
De static file serving is verplaatst naar NA alle API routes.

## Stappen om te fixen:

1. **Stop de huidige container:**
   ```bash
   docker-compose down
   ```

2. **Rebuild de Docker image (met de nieuwe code):**
   ```bash
   docker-compose build --no-cache
   ```

3. **Start de container opnieuw:**
   ```bash
   docker-compose up -d
   ```

4. **Check de logs:**
   ```bash
   docker logs -f ithulp-customers
   ```

5. **Test de applicatie:**
   - Open de app in je browser
   - Log in opnieuw in
   - Probeer de afspraken te laden

## Wat is er veranderd?

- Static file serving (`express.static`) staat nu NA alle API routes
- De catch-all route (`app.get('*')`) staat nu helemaal onderaan
- API routes hebben nu altijd voorrang

## Als het nog steeds niet werkt:

Zie `TROUBLESHOOTING.md` voor meer debug stappen.
