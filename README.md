# Cafeteria Management System - Spring Boot Backend

Local Spring Boot + MySQL REST backend. No online payment gateway is included.

## 1. Database
1. Start MySQL.
2. Run `src/main/resources/schema.sql` in MySQL Workbench.
3. Open `src/main/resources/application.properties`.
4. Replace `YOUR_MYSQL_PASSWORD` with your local MySQL root password.

## 2. Run
From this folder:

```bash
mvn spring-boot:run
```

The API runs at `http://localhost:8080`.

## 3. Admin login
Demo account created by `schema.sql`:
- email: `admin@example.com`
- password: `password`

`POST /api/auth/login` with JSON:
```json
{"email":"admin@example.com","password":"password"}
```

Admin/staff endpoints use HTTP Basic authentication with the same email/password.
Customers are anonymous and do not need an account.

## 4. Main endpoints
### Public customer
- `GET /api/catalog/categories`
- `GET /api/catalog/items`
- `GET /api/catalog/categories/{id}/items`
- `POST /api/orders`
- `GET /api/orders/{id}`

### Admin/staff
- `GET/POST/PUT/PATCH /api/admin/categories...`
- `GET/POST/PUT/PATCH/DELETE /api/admin/items...`
- `GET/PATCH /api/admin/orders...`
- `GET /api/admin/reports/today`

## 5. Example order
```json
{
  "items": [
    {"itemId": 1, "quantity": 2},
    {"itemId": 3, "quantity": 1}
  ],
  "paymentMethod": "CASH",
  "notes": "No onions"
}
```

Stock is decreased inside the same transaction as the order. `NULL` stock means unlimited/untracked stock.

## Important report limitation
The existing schema stores current stock but not a starting-stock snapshot for each day. Therefore the report returns actual sold quantities from `order_items` and current leftover stock from `menu_items`. It does not falsely calculate sold quantity as `starting stock - leftover`.


## Java version
This version of the project is configured for **Java 26** and Spring Boot **4.1.1**. Spring Boot 4.1.1 supports Java 26.
