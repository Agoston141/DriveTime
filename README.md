#  DriveTime
> Autósiskola időpontfoglaló program

---

## Előfeltételek

A program futtatásához az alábbi szoftverek szükségesek:

- **Node.js** – JavaScript futtatási környezet
- **pnpm** – csomagkezelő
- **Docker Desktop** – a MySQL adatbázis virtualizálásához
- **PowerShell** script futtatási engedély (Windows esetén)

---

## Telepítés és indítás

> Ajánlott az állományt **Visual Studio Code**-dal megnyitni, és azon belül kezelni a Frontend és Backend mappákat.

### 1. Backend

**1.1. Docker-alapú adatbázis indítása**

Nyisd meg a Docker Desktopot, majd PowerShellben futtasd:

```bash
docker run --name drivetimedb -d -p 3307:3306 \
  -e MYSQL_ROOT_PASSWORD=123 \
  -e MYSQL_DATABASE=drivetimedb \
  mysql:8.4
```

**1.2. Függőségek telepítése és adatbázis migrálása**

```bash
pnpm i
pnpx prisma generate
pnpx prisma migrate dev
```

**1.3. Szerver indítása**

```bash
pnpm run start:dev
```

**1.4. Adatbázis feltöltése tesztadatokkal**

A szerver sikeres elindítása után nyisd meg böngészőben:

```
http://localhost:3000/docs
```

A Swagger felületen keresd a **(GET) /user/seed** végpontot, kattints a **Try it out**, majd az **Execute** gombra.

---

### 2. Frontend

```bash
pnpm i         # vagy: npm i
pnpm run dev   # vagy: npm run dev
```

---

## Kész!

A DriveTime program telepítése és konfigurálása ezzel véget ért.
