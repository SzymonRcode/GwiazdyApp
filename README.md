# Projekt Gwiazdy - API

<br>

## Opis
---
API do zarządzania gwiazdami oraz pogodą

Aplikacja front-end'owa, która korzysta z API [tutaj](https://github.com/kaholk/projekt_gwiazdy)

API składa się z 3 endpoint'ów: `Calendar`, `Stars` i `Constellations`
- Endpoint `Calendar` zwiera request'y takie jak: 
    - Wyświetlenie wszystkich dat
    - Wyświetlenie konkretnej daty wraz z informacjami
    - Edycja wartości deszczu
    - Edycja wartości księżyca
    - Edycja wartości mgły
    - Edycja wartości zachmurzenia
- Endpoint `Stars` zwiera request'y takie jak: 
    - Wyświetlenie wszystkich gwiazda
    - Wyświetlenie konkretnej gwiazdy wraz z informacjami
    - Wyświetlenie konstelacji w jakich jest dana gwiazda
    - Dodanie nowej gwiazdy
    - Edycja istniejącej gwiazdy
    - Zmiana statusu gwiazdy
    - Usunięcie gwiazdy
- Endpoint `Constellations` zwiera request'y takie jak: 
    - Wyświetlenie wszystkich konstelacji
    - Wyświetlenie konkretnej konstelacji wraz z informacjami
    - Wyświetlenie gwiazd, które są w danej konstelacji
    - Dodanie nowej konstelacji
    - Dodanie gwiazdy do konstelacji
    - Zmiana statusu wszystkich gwiazd w danej konstelacji
    - Edycja istniejącej konstelacji
    - Usunięcie gwiazdy z konstelacji
    - Usunięcie konstelacji
## Uruchomienie API
---
Należy utworzyć plik .env z danymi do połączenia się z bazą oraz zabezpieczeniem Basic Auth do aplikacji Front-end'owej.

### Szablon konfiguracji
> .env
```
DB_HOST = 'host'
DB_USER = 'user'
DB_PASSWORD = 'password'
DB_NAME = 'db_name'
BASIC_AUTH_USER = 'basic_auth_user'
BASIC_AUTH_PASSWORD = 'basic_auth_pass'
PORT = 'port'
```
### Instalacja zależności
```
npm install
```
### Uruchomienie w trybie deweloperskim
```
npm run dev
```
### Uruchomienie w trybie produkcyjnym
```
npm run start
```

<br>