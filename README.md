# Pharmacy Sales & Inventory — Backend

A REST API for managing a pharmacy's medicines, categories, suppliers, customers, sales, inventory movements, and staff accounts. Built with **Spring Boot**, **Spring Security (JWT)**, and **PostgreSQL**, and pre-configured with CORS so it can be consumed by a separate frontend (e.g. a Vite/React app running on `localhost:5173`).

---

## 1. Project overview

### Tech stack

| Layer          | Technology                                      |
|----------------|--------------------------------------------------|
| Language       | Java 25                                          |
| Framework      | Spring Boot 4.1.0 (Web MVC, Data JPA, Security, Validation) |
| Database       | PostgreSQL                                       |
| Auth           | Stateless JWT (`io.jsonwebtoken` / jjwt 0.13.0)  |
| Build tool     | Maven (wrapper included, no local install needed) |
| Password hashing | BCrypt                                         |

### Architecture

The project follows a standard layered structure:

```
controller/   → REST endpoints (HTTP in/out)
service/      → business logic
repository/   → Spring Data JPA repositories
entity/       → JPA entities (database tables)
dto/          → request/response payloads
security/     → JWT filter, JWT service, user-details service
config/       → Spring Security + CORS configuration
exception/    → centralized error handling
```

### Domain model

- **User** — staff account with a `Role` (`ROLE_ADMIN`, `ROLE_PHARMACIST`, `ROLE_CASHIER`) and an active/inactive `status`.
- **Category** — groups medicines (e.g. "Painkillers", "Antibiotics").
- **Supplier** — companies medicines are purchased from.
- **Medicine** — name, category, supplier, price, quantity in stock, expiry date.
- **Customer** — people sales are recorded against.
- **Sale** / **SaleDetail** — a completed sale and its line items; stock is decremented automatically.
- **InventoryTransaction** — manual `STOCK_IN` / `STOCK_OUT` movements, independent of sales.

### Roles & permissions

| Action                              | Admin | Pharmacist | Cashier |
|--------------------------------------|:-----:|:----------:|:-------:|
| View medicines / categories          | ✅ | ✅ | ✅ |
| Create/edit/delete medicines & categories | ✅ | ❌ | ❌ |
| View suppliers, manual stock in/out  | ✅ | ✅ | ❌ |
| Create/edit/delete suppliers         | ✅ | ❌ | ❌ |
| View customers, create customers     | ✅ | ✅ | ✅ |
| Edit customers                       | ✅ | ✅ | ❌ |
| Delete customers                     | ✅ | ❌ | ❌ |
| Record a sale                        | ✅ | ✅ | ✅ |
| View sales                           | ✅ | ✅ | ✅ |
| Manage staff accounts (`/api/admin/**`) | ✅ | ❌ | ❌ |

### API endpoints

All endpoints are prefixed with `/api`. Endpoints under `/api/auth/**` are public; everything else requires a valid JWT in the `Authorization: Bearer <token>` header, on top of the role rules above.

| Method | Endpoint | Notes |
|--------|----------|-------|
| POST | `/api/auth/register` | Public, **first-run only** — see [First admin setup](#first-admin-setup) |
| POST | `/api/auth/login` | Returns a JWT |
| GET/POST/PUT/DELETE | `/api/medicines`, `/api/medicines/{id}` | `GET /api/medicines/search?name=...` also available |
| GET/POST/PUT/DELETE | `/api/categories`, `/api/categories/{id}` | |
| GET/POST/PUT/DELETE | `/api/suppliers`, `/api/suppliers/{id}` | |
| GET/POST/PUT/DELETE | `/api/customers`, `/api/customers/{id}` | |
| POST | `/api/sales` | Creates a sale + line items, decrements stock |
| GET  | `/api/sales`, `/api/sales/{id}` | |
| POST | `/api/inventory/stock-in`, `/api/inventory/stock-out` | Manual stock movement |
| GET  | `/api/inventory`, `/api/inventory/medicine/{medicineId}` | Transaction history |
| GET/POST/PUT/DELETE | `/api/admin/users`, `/api/admin/users/{id}` | Admin only — create staff, change role, activate/deactivate, delete |

### First admin setup

`POST /api/auth/register` is only usable **once** — the very first time it's called, while the `users` table is empty, it creates that user with `ROLE_ADMIN`. Every subsequent call to `/api/auth/register` will fail with an error, because the app expects the admin to create all other staff accounts via `POST /api/admin/users`. This is intentional and documented in `AuthService.java`.

So the setup order is always:
1. `POST /api/auth/register` once → becomes the Admin.
2. Log in as Admin, then use `POST /api/admin/users` to create Pharmacist/Cashier accounts.

---

## 2. Setup instructions

### Prerequisites

- **Java 25 JDK** installed and on your `PATH`
- **Docker** (recommended, for PostgreSQL + pgAdmin) — or a local PostgreSQL 14+ instance
- No need to install Maven — the project ships with the Maven Wrapper (`mvnw` / `mvnw.cmd`)

### Step 1 — Start PostgreSQL

The project includes a `Compose.yml` that spins up PostgreSQL and pgAdmin with the credentials the app already expects:

```bash
docker compose -f Compose.yml up -d
```

This starts:

| Service   | Port | Credentials |
|-----------|------|--------------|
| PostgreSQL | `5432` | user: `pharmacy` / password: `root` / db: `pharmacy_sales_inventory` |
| pgAdmin    | `5050` (open `http://localhost:5050`) | email: `pharmacy@just.edu.so` / password: `root` |

> If you'd rather use an existing local PostgreSQL install instead of Docker, just create a database named `pharmacy_sales_inventory` and update `src/main/resources/application.properties` to match your own username/password.

### Step 2 — Configure the app (optional)

Default configuration lives in `src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/pharmacy_sales_inventory
spring.datasource.username=pharmacy
spring.datasource.password=root

app.jwt.secret=${JWT_SECRET:change-this-super-secret-key-please-32chars-min}
app.jwt.expiration-ms=${JWT_EXPIRATION_MS:86400000}
```

- The datasource values already match the `Compose.yml` defaults, so **no changes are needed** if you used Docker as above.
- `app.jwt.secret` and `app.jwt.expiration-ms` can be overridden with environment variables (`JWT_SECRET`, `JWT_EXPIRATION_MS`) without touching the file — recommended before any real deployment, since the default secret is a placeholder.
- Tables are created/updated automatically on startup via `spring.jpa.hibernate.ddl-auto=update` — no manual schema/migration step is required.

### Step 3 — CORS (already handled)

`CorsConfig.java` already allows any `http://localhost:*` or `http://127.0.0.1:*` origin (e.g. a Vite dev server on `http://localhost:5173`), so a locally-running frontend will work out of the box. Update the allowed origin patterns there before deploying if the frontend will be served from a different domain.

---

## 3. Running the application

### Option A — Maven Wrapper (recommended)

From the project root (where `pom.xml` lives):

```bash
# macOS/Linux
./mvnw spring-boot:run

# Windows
mvnw.cmd spring-boot:run
```

### Option B — Build a jar and run it

```bash
./mvnw clean package
java -jar target/PharmacySalesInventory-0.0.1-SNAPSHOT.jar
```

### Option C — From an IDE

Open the project as a Maven project in IntelliJ IDEA / Eclipse / VS Code, then run `PharmacySalesInventoryApplication.java` directly.

---

Once running, the API is available at:

```
http://localhost:8080/api
```

### Quick smoke test

```bash
# 1. Register the first admin (only works once, on an empty database)
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Admin User","username":"admin","email":"admin@example.com","password":"secret123"}'

# 2. Log in to get a JWT
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"secret123"}'

# 3. Call a protected endpoint with the token from step 2
curl http://localhost:8080/api/medicines \
  -H "Authorization: Bearer <token>"
```

---

## 4. Troubleshooting

| Symptom | Likely cause |
|---------|--------------|
| `Connection refused` on startup | PostgreSQL isn't running — check `docker compose ps` or your local Postgres service |
| `401 Unauthorized` on every request except `/api/auth/**` | Missing/expired/invalid `Authorization: Bearer <token>` header |
| `403 Forbidden` | Token is valid, but the logged-in user's role doesn't have permission for that endpoint |
| `IllegalStateException` on `/api/auth/register` | The database already has at least one user — use `/api/admin/users` (as an Admin) to create more accounts instead |
| CORS error in the browser console | Frontend is running on an origin other than `http://localhost:*` / `http://127.0.0.1:*` — update `CorsConfig.java` |
