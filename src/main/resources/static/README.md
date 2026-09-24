# Annapurna™ Cafeteria Management System

A multi-page responsive Touch Kiosk Web Application with dynamic particle animation, coffee-and-vanilla theme, invisible-lines receipt billing, and an integrated Java backend REST API.

## Project Structure

```
cafeteria management system/
├── index.html            # Page 1: Welcome Page with Interactive Particle Canvas & "Ready to order!"
├── menu.html             # Page 2: Vending Touch Screen Kiosk (Hides 0-stock foods, Floating Cart)
├── billing.html          # Page 3: Billing Receipt (Invisible Lines Table, Print & Auto-Redirect)
├── thankyou.html         # Page 4: Order Token Screen (Particle Background & 5s Auto-Redirect)
├── css/
│   ├── style.css         # Coffee & Vanilla Design Tokens with Antigravity Headings
│   └── print.css         # 80mm Thermal Receipt Print Stylesheet
├── js/
│   ├── data.js           # Menu Data Store, Stock Inventory & Java REST API Bridge
│   ├── cart.js           # CartManager (Stock Checks, Calculation, Java Dispatch)
│   └── particles.js      # Interactive Antigravity Canvas Particles (Mouse & Touch)
└── java-backend/         # Java REST API Backend (Spring Boot)
    ├── pom.xml
    └── src/main/java/com/cafeteria/
        ├── CafeteriaApplication.java
        ├── model/
        │   ├── MenuItem.java
        │   ├── Order.java
        │   └── OrderItem.java
        └── controller/
            └── CafeteriaApiController.java
```

## How the JavaScript Connects to Java Backend

1. **Dual Mode Operation**:
   - **Standalone / Offline Mode**: If the Java backend is not running, the JavaScript kiosk runs 100% autonomously using LocalStorage.
   - **Java Connected Mode**: When the Java Spring Boot service runs on `http://localhost:8080`, the frontend automatically synchronizes stock deductions and records orders via REST endpoints:
     - `GET  /api/health` -> Health check
     - `GET  /api/menu` -> Fetch live menu items
     - `GET  /api/menu/available` -> Fetch only items in stock
     - `POST /api/orders` -> Save order payload with token & line items

2. **Starting the Java Backend**:
   ```bash
   cd java-backend
   mvn spring-boot:run
   ```\n