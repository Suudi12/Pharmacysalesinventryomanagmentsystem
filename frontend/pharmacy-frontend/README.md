# Pharmacy Sales & Inventory &mdash; Frontend (React + Vite)

Frontend-kan wuxuu si toos ah ula shaqeeyaa backend-ka **PharmacySalesInventory** (Spring Boot).
Waxa uu daboolayaa endpoint kasta oo backend-ku leeyahay: auth, medicines, categories,
suppliers, customers, sales, inventory, iyo admin user management.

## 1. U diyaari backend-ka

1. Ka dhig database-ka PostgreSQL (`pharmacy_sales_inventory` sida `application.properties`
   ku qeexan tahay, ama beddel magaca).
2. Run backend-ka: `./mvnw spring-boot:run` (wuxuu ku shaqeynayaa `http://localhost:8080`).
3. **Muhiim:** waxaan ku daray `CorsConfig.java` cusub oo backend-ka + waxaan ku beddelay
   `SecurityConfig.java` si loo ogolaado CORS-ka `localhost` &mdash; iyada oo aan taasi la
   samayn, browser-ku wuu block gareyn lahaa dhammaan requests-ka frontend-ku. Hubi in
   file-yadan labadaba ay ku jiraan backend project-kaaga ka hor inta aanad frontend-ka run
   gareynin.

## 2. U diyaari frontend-ka

```bash
cd pharmacy-frontend
npm install
cp .env.example .env      # hagaaji VITE_API_BASE_URL haddii backend-ku port kale ku socdo
npm run dev
```

Frontend-ku wuxuu ku shaqeynayaa `http://localhost:5173`.

## 3. Isticmaalka koowaad (first run)

Database-ku marka uu madhan yahay:

1. Tag `/setup` (link-ka "Create the admin account" ee bogga login-ka).
2. Buuxi form-ka &mdash; user-kan **wuxuu si otomaatig ah u noqonayaa ROLE_ADMIN**
   (waa qaanuun backend-ku leeyahay: kaliya user-ka ugu horreeya ee system-ka ayaa
   public register loo furan yahay).
3. Kadib login-gareey, waxaadna gali kartaa **Staff accounts** si aad u abuurto
   pharmacist iyo cashier accounts.

## 4. Struct-ka code-ka (sida spec-ku qeexay)

```
src/
  components/   # Sidebar, AppLayout, Modal, ConfirmDialog, PrivateRoute, RoleRoute, Ui.jsx
  pages/        # Hal file oo route kasta (Login, Setup, Dashboard, Medicines, ...)
  services/     # Axios API calls, hal file oo resource kasta
  context/      # AuthContext (JWT + user session) iyo ToastContext (notifications)
  hooks/        # useAuth
  utils/        # roles.js, format.js (lacagta, taariikhda, low-stock)
  App.jsx       # Routing + role-based route guards
  main.jsx      # Entry point
```

## 5. Role-yada iyo ogolaanshaha (sida backend-ku qeexay)

| Feature | Admin | Pharmacist | Cashier |
|---|---|---|---|
| Medicines &mdash; view/search | ✅ | ✅ | ✅ |
| Medicines &mdash; create/edit/delete | ✅ | ❌ | ❌ |
| Categories &mdash; view | ✅ | ✅ | ✅ |
| Categories &mdash; create/edit/delete | ✅ | ❌ | ❌ |
| Suppliers &mdash; view/manage | ✅ | view only | ❌ |
| Customers &mdash; view/create | ✅ | ✅ | ✅ |
| Customers &mdash; edit | ✅ | ✅ | ❌ |
| Customers &mdash; delete | ✅ | ❌ | ❌ |
| Sales &mdash; create | ✅ | ✅ | ✅ |
| Sales &mdash; view history | ✅ | ✅ | ✅ |
| Inventory (stock in/out) | ✅ | view only | ❌ |
| Staff accounts | ✅ | ❌ | ❌ |

Frontend-ku wuxuu qarinayaa buttons/pages-ka aan role-ka la ogolayn, laakiin xasilloonida
dhabta ah waxaa xaqiijiya backend-ka (`@PreAuthorize`) &mdash; sidaas awgeed labada dhinac
way isku waafaqsan yihiin.

## 6. Waxa lagu daray backend-ka (validation/gap check)

Backend-ka mar hore wuu leeyahay validation dhammaystiran (`@NotBlank`, `@Email`, `@Min`,
`@DecimalMin`, duplicate checks, iwm). Halka aan hal wax ka maqnaa ka helay:

- **CORS**: lama qeexin. Waxaan ku daray `config/CorsConfig.java` + waxaan ku beddelay
  `config/SecurityConfig.java` si `http.cors()` loo shido oo `OPTIONS` preflight
  requests-ka la ogolaado. Iyada oo aan taasi, frontend-ku wax kama shaqayn lahayn.
