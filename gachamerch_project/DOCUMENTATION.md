# GachaMerch: Genshin Weapon Merchant
### Course: COSC6094 Mobile Solution Case Study Project
---

## 1. Project Overview & Architecture
This solution is built using a cohesive **Full-Stack Hybrid Architecture** to satisfy strict transactional consistencies, high-fidelity responsive layout designs, and smooth administrative controls across devices. It allows fans to view and secure Genshin Impact weapon collectibles, translating local cart items into server-authoritative Primogem transaction records.

The project structure is split into two cleanly separated tiers:
*   **Frontend**: A high-performance Flutter app written in Dart, integrating responsive Material 3 layout mechanics.
*   **Backend**: A fast Node.js HTTP service powered by Express, implementing strict JWT/token bearer authentication and executing ACID transaction updates over state stocks.
*   **Database**: A structured MySQL relational instance storing credentials, available store items, and complete audit tables.

```
       +-------------------------------------------------+
       |               Flutter Mobile App                |
       |  (Material 3, State Management, http Services)  |
       +-----------------------------------+-------------+
                                           |
                                   REST requests (JSON)
                                           |
                                           v
       +-------------------------------------------------+
       |              Express REST Backend               |
       |     (Token Validation, CORS, Audit Logging)     |
       +-----------------------------------+-------------+
                                           |
                                   Connection pooling
                                           |
                                           v
       +-------------------------------------------------+
       |               MySQL Database                    |
       |    (Weapons Inventory, Order Logs, Users)       |
       +-------------------------------------------------+
```

---

## 2. Relational Database Schema
The backend requires a corresponding MySQL schema. Refer to `database/schema.sql` inside this project structure. Below is the relational mapping:

### **Users Table (`users`)**
Handles credentials for login sessions.
*   `id` (VARCHAR, Primary Key) - Unique identifier for the user.
*   `username` (VARCHAR, Unique) - Login credential name.
*   `password` (VARCHAR) - Secured user password.
*   `role` (VARCHAR) - Defines user privileges (`'admin'` or `'user'`).
*   `email` (VARCHAR, Unique) - Optional notification destination email.
*   `token` (VARCHAR) - Generated secure authorization bearer tokens.

### **Weapons Table (`weapons`)**
Manages catalog inventory items.
*   `id` (VARCHAR, Primary Key) - Weapon system ID (e.g. `W01`).
*   `name` (VARCHAR) - Weapon display name.
*   `type` (VARCHAR) - Weapon category (e.g. `'Sword'`, `'Bow'`).
*   `description` (TEXT) - Lore details and damage stats description.
*   `stock` (INT) - Current quantity available for purchase (ACID constrained).
*   `image` (VARCHAR) - URL address of the item illustration.
*   `price` (DECIMAL) - Checkout cost, tracked as Primogems currency.

### **Orders Table (`orders`)**
Registers invoice audit logs.
*   `id` (VARCHAR, Primary Key) - Unique invoice order code ID.
*   `details` (VARCHAR) - Concatenated text of checkout list items (e.g., `2x Staff of Homa`).
*   `timestamp` (DATETIME) - Default system date of checkout log creation.

---

## 3. How to Run Locally in VSCode

### Prerequisites
*   [Flutter SDK](https://docs.flutter.dev/get-started/install) installed.
*   [Node.js](https://nodejs.org/) installed.
*   [MySQL Server](https://dev.mysql.com/downloads/installer/) running locally or on a remote cloud host.

---

### Step 1: Initialize Database
1.  Open your preferred MySQL terminal or workbench.
2.  Inspect and run the queries found inside `database/schema.sql` to instantiate the tables and pre-populate mock data.

---

### Step 2: Boot Node.js REST Server
1.  Open VSCode and navigate to `backend/` directory:
    ```bash
    cd gachamerch_project/backend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Duplicate `.env.example` to create `.env`, setting your local database credentials:
    ```bash
    cp .env.example .env
    ```
4.  Launch the backend service:
    ```bash
    npm run start
    ```
    The console will print: `GachaMerch HTTP backend listening on http://localhost:3000`.

---

### Step 3: Run Flutter Application
1.  Open another VSCode terminal block and navigate to `frontend/` directory:
    ```bash
    cd gachamerch_project/frontend
    ```
2.  Ensure mock packages are retrieved:
    ```bash
    flutter pub get
    ```
3.  Configure API Endpoint:
    *   Launch the app in your phone, emulator, or workspace browser.
    *   On the login screen, you can quickly write down the server's IP address (e.g., `http://10.0.2.2:3000` for Android Emulator, or `http://localhost:3000` for desktop/web testing).
4.  Begin Testing and CRUD operations:
    *   **User login**: username = `user`, password = `password123` (Standard user, can add items to cart and check out).
    *   **Admin login**: username = `admin`, password = `password123` (Can do everything, plus access the database admin panel where items are added/edited/deleted).
