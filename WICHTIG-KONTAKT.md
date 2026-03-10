# Kontaktformular – So funktioniert es

## Pflicht: Genau diese Schritte

1. **Terminal öffnen**
   ```powershell
   cd c:\Users\domin\Desktop\UG
   npm start
   ```
   Warten bis "Cicero IT Backend läuft auf..." erscheint.

2. **Browser öffnen und aufrufen**
   ```
   http://localhost:3001
   ```
   Nicht über Live Server, nicht per Doppelklick. Direkt diese URL eintippen.

3. **Formular testen**
   "Jetzt anfragen" klicken, ausfüllen, senden.
   Im Terminal sollten "E-Mail an..." und "Bestätigungsmail an..." erscheinen.

## Bei Problemen

- **"Verbindung fehlgeschlagen"** → Server nicht gestartet oder CraftsbyPam blockiert Port 3001. CraftsbyPam beenden (Strg+C), dann UG neu starten.
- **Keine E-Mail angekommen** → Im Terminal nach Fehlermeldungen schauen. Gmail-App-Passwort prüfen.
