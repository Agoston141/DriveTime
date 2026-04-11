
# DriveTime
Autósiskola időpontfoglaló program

A program indításához, teszteléséhez az alábbiakat kell megtennünk:

 - A letöltött állományt ki kell csomagolni
 - A letöltött állományon belül két mappának kell lennie, Frontend és Backend címen, a mellékes vele járó fájlokkal együtt. 
 - Az állományt érdemes valamilyen IDE-vel (Visual Studio Code) megnyitni, majd betallózni a két mappát.
 - A program futtatásához szükséges engedélyezni PowerShell scripteket, illetve telepítenie kell a NodeJS futtatási keretrendszert.
 - Ahhoz hogy a backend kommunikálni tudjon a SQL szerverrel, szükségünk van a Docker Desktop nevű virtualizációs programra.
 - A fentiek telepítése után PowerShellből, vagy Git CLI-ben kell az alábbi parancsokat kiadni:
	 - a Backend telepítése és konfigurálása és elindítása sorban: 
		 Docker Desktop elindítása után adjuk ki PowerShell parancssorban az alábbiakat:
		- docker run --name drivetimedb -d -p 3307:3306 -e MYSQL_ROOT_PASSWORD=123 -e 		  MYSQL_DATABASE=drivetimedb mysql:8.4
		 - pnpm i 
		 - pnpx prisma generate 
		 - pnpx prisma migrate dev
		 - pnpm run start:dev  

A szerver sikeres elindítása után:
 - böngészőben nyissa meg az alábbi URL címet: http://localhost:3000/docs
 - Swagger felületen  (GET) /user/seed menüpontnál található "Try it out" -> "Execute" gombra rákattintva felöltheti séma adatokkal az adatbázist.

	 - a Frontend telepítése és konfigurálása és elindítása sorban: 
		 -   npm i vagy pnpm i
		 - 	 npm run dev vagy pnpm run dev


A DriveTime program telepítése, konfigurálása innentől véget ért. 

