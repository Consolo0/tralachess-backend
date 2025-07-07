# Los_tralaleros_backend_25-1

**Proyecto Backend - Sección 25-1**

---

## 📚 Documentación BDD (Base de Datos)

### 🛠️ Requisitos previos

Este proyecto utiliza **PostgreSQL** como motor de base de datos y **Sequelize** como ORM. Para ejecutar el backend correctamente, debes tener una base de datos configurada y un archivo `.env` con las variables necesarias.

---

### 🐘 Creación de Usuario y Base de Datos en PostgreSQL

Si estás trabajando localmente (sin Docker), puedes configurar la base de datos ejecutando los siguientes comandos en `psql`:

```sql
-- Crear usuario
CREATE USER tralalero WITH PASSWORD 'tralapass';

-- Crear base de datos
CREATE DATABASE traladb OWNER tralalero;

-- Otorgar privilegios
GRANT ALL PRIVILEGES ON DATABASE traladb TO tralalero;

```

---

### ⚙️ Archivo `.env` de ejemplo

Crea un archivo `.env` en la raíz del backend con el siguiente contenido:

```env
# PostgreSQL
POSTGRES_USER=tralalero
POSTGRES_PASSWORD=tralapass
POSTGRES_DB=traladb
DB_PORT=5432
DB_HOST=db

# Auth0
AUTH0_DOMAIN=dev-yfcmuz3447miezig.us.auth0.com
AUTH0_AUDIENCE=https://chess-backend.tralaleros.com
```

> 📌 Este archivo `.env` es **esencial** para levantar correctamente el backend.  
> Sequelize utiliza estas variables de entorno para establecer la conexión con la base de datos.

---

## 🐳 Migraciones con Docker

Como el proyecto utiliza `docker-compose`, las migraciones deben ejecutarse dentro del contenedor del backend.

### 🔧 Comandos útiles

#### ✅ Crear una nueva migración

```bash
docker exec -it <container_name> npx sequelize-cli migration:generate --name <migration_name>
```

📌 **Nota:**  
Reemplaza `<container_name>` por el nombre del contenedor (por ejemplo, `los-tralaleros-api`) y `<migration_name>` por un nombre representativo para tu migración (por ejemplo, `create-user` o `add-email-column`).

#### ✅ Ejecutar las migraciones pendientes

```bash
docker exec -it backend_container npx sequelize-cli db:migrate
```

💡 Asegúrate de que el contenedor `backend_container` esté en ejecución antes de usar estos comandos. Puedes verificarlo con:

```bash
docker ps
```

O visualmente en **Docker Desktop**.

---

## 🚀 Cómo ejecutar las migraciones paso a paso

Para reflejar los cambios en el esquema de la base de datos (por ejemplo, nuevas tablas o columnas), sigue estos pasos:

1. **Genera la migración** con un nombre claro y descriptivo:
   ```bash
   docker exec -it backend_container npx sequelize-cli migration:generate --name create-nombre-tabla
   ```

2. **Edita el archivo de migración generado** en la carpeta `migrations/`, completando las funciones `up` (para aplicar cambios) y `down` (para revertirlos).

3. **Aplica la migración**:
   ```bash
   docker exec -it backend_container npx sequelize-cli db:migrate
   ```

4. **(Opcional)** Revertir la última migración:
   ```bash
   docker exec -it backend_container npx sequelize-cli db:migrate:undo
   ```

---

## 🐳 Configuración Docker (si aplica)

Si estás utilizando Docker, asegúrate de que tu archivo `docker-compose.yml` incluya un servicio para la base de datos como el siguiente:


```yaml
services:
  db:
    image: postgres:15
    restart: always
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

---

## 📦 Sequelize: Inicializar y migrar
Si aún no lo hiciste, puedes inicializar Sequelize y correr las migraciones con los siguientes comandos:

```bash
npx sequelize-cli init        # (solo la primera vez)
npx sequelize-cli db:migrate  # ejecutar migraciones
```

> 📌 Verifica que `config/config.js` obtenga los valores de conexión desde `process.env`. Esto es fundamental para que Sequelize se conecte correctamente usando el archivo `.env`.

```js
const dotenv = require('dotenv');
dotenv.config();

const user = process.env.POSTGRES_USER;
const password = process.env.POSTGRES_PASSWORD;
const db = process.env.POSTGRES_DB;
const port = process.env.DB_PORT;
const host = process.env.DB_HOST;

const config =
{
  "development": {
    "username": user,
    "password": password,
    "database": db,
    "port": port,
    "host": host,
    "dialect": "postgres"
  },
  "test": {
    "username": user,
    "password": password,
    "database": db,
    "port": port,
    "host": host,
    "dialect": "postgres"
  },
  "production": {
    "username": user,
    "password": password,
    "database": db,
    "port": port,
    "host": host,
    "dialect": "postgres",
    "dialectOptions": {
      "ssl": {
        "require": true,
        "rejectUnauthorized": false
      }
    }
  }
}

module.exports=config;
```

---

## 🤖 Documentación API

---

### 🧑‍💼 Entidad **User**

#### **GET** `/users/:auth0_id`
Este método utiliza el parámetro `auth0_id` para buscar y retornar un usuario en específico.  
- Si no hay `auth0_id` se retorna el código **400**.  
- Si no se encuentra un usuario con el parámetro indicado, se retorna el código **404**.  
- Ambos retornan un JSON indicando el error.  
- Si se encuentra el usuario, se retorna el código **200** con un JSON con la información del usuario.  
- Si ocurre cualquier otro error durante la ejecución, se retorna el código **500** con un mensaje de error.

---

#### **DELETE** `/users/:auth0_id`
Este método utiliza el parámetro `auth0_id` para eliminar un usuario en específico.  
- Si no hay `auth0_id` se retorna el código **400**.  
- Si no se encuentra un usuario con el parámetro indicado, se retorna el código **404**.  
- Ambos retornan un JSON indicando el error.  
- Si se encuentra y elimina el usuario, se retorna el código **200** con un JSON con la información del usuario.  
- Si ocurre cualquier otro error durante la ejecución, se retorna el código **500** con un mensaje de error.

---

#### **PATCH** `/users/:auth0_id`
Este método utiliza el parámetro `auth0_id` junto a los parámetros indicados en el cuerpo de la request para actualizar un usuario en específico.  
- Si no hay `auth0_id`, se retorna el código **400**.  
- Si en el cuerpo se intenta cambiar el `auth0_id`, se retorna el código **401**.  
- Si no se encuentra el usuario, se retorna el código **404**.  
- Todos retornan un JSON indicando el error.  
- Si se encuentra y actualiza el usuario, se retorna el código **200** con el usuario actualizado.  
- Si ocurre cualquier otro error, se retorna el código **500** con un mensaje de error.

---

#### **POST** `/users/create`
Este método requiere que el cuerpo contenga los parámetros `auth0_id`, `username` y `description` para crear un usuario.  
- `profileImage` es opcional; si no se incluye, se usa una imagen por defecto.  
- Si falta algún parámetro obligatorio, se retorna el código **400** con un JSON indicando el error.  
- Si se crea el usuario, se retorna el código **201** con su información.  
- Si ocurre cualquier otro error, se retorna el código **500** con un mensaje de error.

---

### ♟️ Entidad **Match**

#### **POST**

- **`/matches/create/:auth0_id`**  
  Crea la partida de ajedrez: tablero, piezas y movimientos posibles.  
  - Si no hay `auth0_id`, retorna **400**.  
  - Si falla algún componente, retorna **500** con un JSON del error.  
  - Si se crea exitosamente, retorna **201** con la información de todas las entidades creadas.

- **`/matches/join/:auth0_id`**  
  Permite a un usuario unirse a una partida que busca oponente.  
  - Si no hay `auth0_id`, retorna **400**.  
  - Si no encuentra partida, retorna **404**.  
  - Si falla la ejecución, retorna **500** con un JSON del error.  
  - Si se une correctamente, retorna **201** con la información de la partida.

- **`/matches/invalid-move`**  
  Verifica si un movimiento es válido.  
  - Requiere en el cuerpo: `auth0_id`, `match_id`, `origin_x`, `origin_y`, `destiny_x`, `destiny_y`, `candidate_moves`. Si cualquiera de estos campos no se agrega a la request, retorna un estado **400**, indicando cual es el campo faltante.
  - Si no encuntra la partida o la relación entre el usuario y la partida, retornara un estado **404**.
  - Si ocurre cualquier error en el servidor, retorna un estado **500** con un JSON del error
  - Si verifica exitosamente el movimiento, retorna **201** con bool indicando si el movimiento es inválido

---

#### **GET**

- **`/matches/all/:auth0_id`**  
  Busca todas las partidas del usuario con `auth0_id`.  
  - Si no hay `auth0_id`, retorna **400**.  
  - Si no encuentra partidas, retorna **404**.  
  - Si falla la ejecución, retorna **500** con mensaje de error.  
  - Si encuentra partidas, retorna **200** con su información.

- **`/matches/context`**  
  Obtiene el estado actual de una partida.  
  - Requiere en el query: `auth0_id`, `match_id`.  
  - Si falta alguno de los parámetros, retorna **400** con un mensaje de error.  
  - Si no se encuentra la partida, retorna **404**.  
  - Si no se encuentra la relación entre el usuario y la partida, retorna **500** con un mensaje de error.  
  - Si no se encuentran las posiciones del tablero, retorna **404**.  
  - Si se obtiene exitosamente la información, retorna **200** con un JSON que incluye:  
    - `positions`: matriz con la disposición actual del tablero  
    - `turn`: color del jugador que debe mover (`'w'` o `'b'`)  
    - `status`: estado actual de la partida (`'ongoing'`, `'promotion'`, `'check'`, etc.)  
    - `color_assigned`: color asignado al usuario  
    - `movesList`: lista de movimientos realizados en notación  
    - `promotionSquare`: casilla de promoción si corresponde

- **`/matches/is-my-turn`**  
  Verifica si es el turno del usuario para mover la pieza indicada.  
  - Requiere en el query: `auth0_id`, `match_id`, `piece`.  
  - Si falta alguno de los parámetros, retorna **400** con un mensaje indicando el campo faltante.  
  - Si no se encuentra la partida o la relación entre el usuario y la partida, retorna **400** con un mensaje de error.  
  - Si ocurre un error en el servidor, retorna **500** con un JSON del error.  
  - Si la validación se realiza correctamente, retorna **200** con un booleano `result` indicando si es el turno del usuario (`true` o `false`).

- **`/matches/get-candidate-moves`**  
  Obtiene los movimientos posibles de una pieza específica en el tablero.  
  - Requiere en el query: `auth0_id`, `match_id`, `rank`, `tile`.  
  - Si falta alguno de los parámetros o si `rank` o `tile` no son válidos (NaN o fuera del rango 0-7), retorna **400** con el error correspondiente.  
  - Si no se encuentra la relación del usuario con la partida (`userMatch`), retorna **404**.  
  - Si ocurre un error interno del servidor, retorna **500** con un JSON del error.  
  - Si la operación es exitosa, retorna **200** con un objeto que contiene el array `candidate_moves`.

- **`/matches/en-passant`**  
  Verifica si un movimiento es un en passant válido.  
  - Requiere en el query: `piece`, `match_id`, `destiny_x`, `destiny_y`.  
  - Si falta alguno de estos campos o si `destiny_x` o `destiny_y` no son números válidos, retorna **400** con el error correspondiente.  
  - Si no encuentra el tablero asociado a la partida, retorna **400** con el error correspondiente.  
  - Si ocurre un error interno en el servidor, retorna **500** con un JSON del error.  
  - Si la verificación es exitosa, retorna **200** con un booleano `result` indicando si el movimiento es un en passant.

- **`/matches/get-promotion-box`**  
  Obtiene el promotion box (casilla de promoción) de una partida.  
  - Requiere en el query: `match_id`, `auth0_id`.  
  - Si falta alguno de estos campos, retorna **400** con el error correspondiente.  
  - Si no encuentra la relación usuario-partida (`userMatch`), retorna **400** con el error correspondiente.  
  - Si ocurre un error interno, retorna **500** con un JSON del error.  
  - Si la consulta es exitosa, retorna **200** con la casilla de promoción en `result`.

---

#### **PATCH**

- **`/matches/update-moves-list`**  
  Añade un movimiento en notación ajedrecística a la lista de movimientos de la partida.  
  - Requiere en el cuerpo: `matchId`, `origin_x`, `origin_y`, `destiny_x`, `destiny_y`.  
  - Si falta alguno de estos campos o son inválidos, retorna **400** indicando cuál.  
  - Si no encuentra el tablero de ajedrez, retorna **400**.  
  - Si ocurre un error interno, retorna **500** con un JSON del error.  
  - Si el movimiento se añade correctamente, retorna **200** con la notación del movimiento.

- **`/matches/update-board`**  
  Actualiza el tablero con un nuevo movimiento, aplicando lógica especial como en passant y enroque.  
  - Requiere en el cuerpo: `matchId`, `auth0_id`, `origin_x`, `origin_y`, `destiny_x`, `destiny_y`, `en_passant`.  
  - Valida que todos los parámetros estén presentes y sean válidos, retornando **400** si falta alguno.  
  - Retorna **400** si no encuentra la partida del usuario o el tablero.  
  - Realiza actualizaciones especiales:  
    - Captura en passant si corresponde.  
    - Movimiento de torre durante enroque.  
    - Actualización del estado de enroque según la pieza movida.  
    - Marca piezas capturadas.  
    - Actualiza posición de la pieza movida.  
  - Crea un nuevo estado del tablero con sus piezas y estadísticas actualizadas.  
  - Actualiza el turno para el próximo jugador.  
  - En caso de error interno, retorna **500** con detalles.  
  - Si la actualización es exitosa, retorna **200** con el nuevo estado del tablero.

- **`/matches/update-status`**  
  Actualiza el estado de la partida luego de un movimiento.  
  - Requiere en el cuerpo: `auth0_id`, `match_id`, `destiny_x`, `destiny_y`.  
  - Valida que todos los parámetros estén presentes y sean válidos, retornando **400** si falta alguno.  
  - Busca el registro `userMatch` para el jugador y los tableros actuales y previos de la partida.  
  - Busca el oponente en la partida (si no está, continúa con un log sin error).  
  - Calcula el nuevo estado de la partida llamando a `StatusUpdate` con: tablero previo, tablero actual, pieza movida, posición destino, estado de enroque del oponente, y id del tablero actual.  
  - Actualiza el estado de la partida en la base de datos.  
  - Retorna **200** con el estado actualizado.  
  - En caso de error interno, retorna **500** con detalles.


- **`/matches/update-status-directly`**  
  Actualiza directamente el estado de la partida tras una promoción u otra acción que cambia el estado.  
  - Requiere en el cuerpo: `status`, `match_id`.  
  - Valida que ambos parámetros estén presentes, retorna **400** si falta alguno.  
  - Actualiza el estado de la partida con el valor recibido.  
  - Retorna **200** con mensaje `"OK"` si la actualización fue exitosa.  
  - En caso de error interno, retorna **500** con detalles del error.


- **`/matches/update-board-directly`**  
  Actualiza directamente el tablero tras una promoción u otra modificación que requiera reemplazar la posición completa.  
  - Requiere en el cuerpo: `newPosition` (matriz del nuevo tablero), `match_id`.  
  - Valida que ambos parámetros estén presentes, retorna **400** si falta alguno.  
  - Crea un nuevo registro de tablero actualizado con la nueva posición.  
  - Recorre el nuevo tablero para crear las piezas y sus estadísticas correspondientes.  
  - En caso de fallo en la creación de estadísticas o piezas, arroja error y retorna **500**.  
  - Retorna **200** con mensaje `"OK"` si la actualización fue exitosa.  
  - En caso de error interno, retorna **500** con detalles del error.


- **`/matches/set-promotion-box`**  
  Define la casilla del promotion box para una partida y usuario específicos.  
  - Requiere en el cuerpo: `match_id`, `auth0_id`, `x`, `y`.  
  - Convierte `x` y `y` a números y valida que sean válidos.  
  - Valida que `match_id` y `auth0_id` estén presentes.  
  - Llama a `SetPromotionBox(match_id, auth0_id, x, y)` para actualizar la posición de promoción.  
  - Retorna **200** con mensaje `"OK"` si la operación es exitosa.  
  - Retorna **400** con mensaje de error si faltan parámetros o son inválidos.  
  - Retorna **500** con detalles en caso de error interno.


### 📘 API Routes Documentation

La documentación de las nuevas rutas incorporadas estan el el siguiente link, con ejemplos de las respuestas:

🔗 [https://documenter.getpostman.com/view/33621822/2sB2xFf84Y](https://documenter.getpostman.com/view/33621822/2sB2xFf84Y)
