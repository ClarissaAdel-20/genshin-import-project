import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import AdmZip from "adm-zip";

interface Weapon {
  id: string;
  name: string;
  type: string;
  description: string;
  stock: number;
  image: string;
  price: number;
}

interface User {
  id: string;
  username: string;
  role: "admin" | "user";
  token?: string;
}

// In-Memory Database mocking MySQL tables & structure
let weapons: Weapon[] = [
  {
    id: "W01",
    name: "Staff of Homa",
    type: "Polearm",
    description: "A polearm that was used in ancient purifying rituals. Extremely popular for Pyro DPS units.",
    stock: 25,
    image: "https://enka.network/ui/UI_EquipIcon_Pole_Homa.png",
    price: 648000 // In IDR/equivalent currency tokens
  },
  {
    id: "W02",
    name: "Mistsplitter Reforged",
    type: "Sword",
    description: "A business sword that blazes with a fierce violet light. Grants elemental damage boost.",
    stock: 12,
    image: "https://enka.network/ui/UI_EquipIcon_Sword_Narukami.png",
    price: 648000
  },
  {
    id: "W03",
    name: "Splendor of Tranquil Waters",
    type: "Sword",
    description: "Fontaine starlet's signature sword. Gleams with a crystalline Hydro blue luster.",
    stock: 8,
    image: "https://enka.network/ui/UI_EquipIcon_Sword_Pneuma.png",
    price: 648000
  },
  {
    id: "W04",
    name: "Aqua Simulacra",
    type: "Bow",
    description: "A bows of deep azure color. Extravagant weapon boost with critical damage multiplier.",
    stock: 15,
    image: "https://enka.network/ui/UI_EquipIcon_Bow_Kirin.png",
    price: 328000
  },
  {
    id: "W05",
    name: "Tome of the Eternal Flow",
    type: "Catalyst",
    description: "A heavy, archaic book containing deep records of Fontaine's aquatic legal history.",
    stock: 5,
    image: "https://enka.network/ui/UI_EquipIcon_Catalyst_Ludwig.png",
    price: 328000
  }
];

// Server request, validation and MySQL emulation logging
interface SystemLog {
  timestamp: string;
  type: "server" | "mysql";
  message: string;
  query?: string;
}

let logs: SystemLog[] = [];

function addLog(type: "server" | "mysql", message: string, query?: string) {
  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
  logs.unshift({ timestamp, type, message, query });
  // Keep logs at a reasonable limit
  if (logs.length > 50) {
    logs.pop();
  }
}

// Populate initial logs simulating MySQL startup
addLog("server", "GachaMerch Express server initialized successfully.");
addLog("mysql", "Connected to MySQL server host: localhost:3306, DB name: gachamerch_db", "SELECT VERSION();");
addLog("mysql", "Synchronized tables: `users`, `weapons`, `orders` based on schema.sql", "SHOW TABLES;");

// Generate a random alphanumeric Bearer token (minimum 20 characters)
function calculateSecureToken(): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let token = "";
  for (let i = 0; i < 24; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

// Active sessions storage
let activeTokenUser: User | null = null;

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // CORS and visual simulator logs helper middleware
  app.use((req, res, next) => {
    if (req.path.startsWith("/api") && req.path !== "/api/logs") {
      addLog("server", `${req.method} ${req.path} - Requested received`);
    }
    next();
  });

  // Bearer Token Verification Middleware
  function verifyBearerToken(req: express.Request, res: express.Response, next: express.NextFunction) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      addLog("server", "Authorization failed: Missing or invalid Bearer format", "HTTP 401 Unauthorized");
      return res.status(401).json({ 
        error: "Unauthorized", 
        message: "Access denied. Missing or malformed Bearer Token in authorization header." 
      });
    }

    const token = authHeader.split(" ")[1];
    
    // Check token validation (must match our active session or meet length & format requirements)
    if (token.length < 20) {
      addLog("server", `Verification failed: Token is too short (${token.length} chars)`, "HTTP 403 Forbidden");
      return res.status(403).json({ 
        error: "Forbidden", 
        message: "Invalid credentials. Bearer token must be at least 20 alphanumeric characters." 
      });
    }

    // Verify successful session token mapping
    if (activeTokenUser && activeTokenUser.token === token) {
      (req as any).user = activeTokenUser;
      addLog("server", `Bearer Token verification succeeded for User: ${activeTokenUser.username} (${activeTokenUser.role})`);
      next();
    } else {
      // In simulator, let's gracefully accept clean simulated tokens of 20+ chars too to allow external curls
      const isAlphanumeric = /^[a-zA-Z0-9]+$/.test(token);
      if (isAlphanumeric) {
        (req as any).user = { id: "sim-user", username: "SimulatedTraveler", role: "user", token };
        addLog("server", `Simulated Bearer Token approved fallback (length: ${token.length})`);
        next();
      } else {
        addLog("server", "Verification failed. Token contains non-alphanumeric characters.", "HTTP 403 Forbidden");
        return res.status(403).json({ 
          error: "Forbidden", 
          message: "Bearer token signature verification failed. Must be purely alphanumeric characters." 
        });
      }
    }
  }

  // --- API ROUTES ---

  // ZIP exporter endpoint for gachamerch_project
  app.get("/api/export-zip", (req, res) => {
    try {
      addLog("server", "Export zip request received. Generating gachamerch_project.zip archive.");
      const zip = new AdmZip();
      const projectPath = path.join(process.cwd(), "gachamerch_project");
      zip.addLocalFolder(projectPath);
      
      const buffer = zip.toBuffer();
      
      res.setHeader("Content-Type", "application/zip");
      res.setHeader("Content-Disposition", "attachment; filename=gachamerch_project.zip");
      res.setHeader("Content-Length", buffer.length);
      res.send(buffer);
      
      addLog("server", "gachamerch_project.zip successfully generated and dispatched.");
    } catch (err: any) {
      addLog("server", `Failed to generate ZIP archive: ${err.message}`);
      res.status(500).json({ error: "Failed to create download", details: err.message });
    }
  });

  // Log feed for frontend developer dashboard
  app.get("/api/logs", (req, res) => {
    res.json(logs);
  });

  // Clearing history
  app.post("/api/logs/clear", (req, res) => {
    logs = [];
    addLog("server", "Developer system logs cleared.");
    res.json({ success: true });
  });

  // DB Authentication: Local DB login
  app.post("/api/auth/login", (req, res) => {
    const { username, password, oAuthService } = req.body;

    // Data validations: Empty username or password checking
    if (!oAuthService && (!username || !password)) {
      addLog("server", "Authentication validation fail: Missing required fields");
      return res.status(400).json({ 
        error: "Validation Error", 
        message: "Credentials input requires both a username and password." 
      });
    }

    let authenticatedUser: User | null = null;

    if (oAuthService) {
      // High-Fidelity Google/Facebook OAuth Login Simulation
      addLog("server", `OAuth Handshake processing with external provider: ${oAuthService}`);
      addLog("mysql", `SELECT * FROM users WHERE email = '${username || "traveler@google-oauth.com"}' AND oauth_provider = '${oAuthService}'`, "Checking external user record");
      
      authenticatedUser = {
        id: "usr-oauth-01",
        username: username || "GenshinTraveler",
        role: "user"
      };
    } else {
      // Classic Database verification
      addLog("mysql", `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`, "Executing SQL User verification");
      
      if (username === "admin" && password === "password123") {
        authenticatedUser = { id: "usr-01", username: "admin", role: "admin" };
      } else if (username === "user" && password === "password123") {
        authenticatedUser = { id: "usr-02", username: "user", role: "user" };
      } else {
        addLog("server", `Auth failed: Invalid credentials for user '${username}'`);
        return res.status(401).json({ 
          error: "Authentication Failed", 
          message: "Incorrect username or password. Check database documentation schema for defaults ('admin' / 'password123' or 'user' / 'password123')." 
        });
      }
    }

    // Generate Bearer token meeting alphanumeric and 20 character rules
    const token = calculateSecureToken();
    authenticatedUser.token = token;
    activeTokenUser = authenticatedUser;

    addLog("server", `Session token created: ${token} for ${authenticatedUser.username}`);
    res.json({
      success: true,
      message: "Login successful",
      user: {
        username: authenticatedUser.username,
        role: authenticatedUser.role,
        token: token
      }
    });
  });

  // GET Route 1: Retrieve all GachaMerch weapons
  app.get("/api/weapons", (req, res) => {
    addLog("mysql", "SELECT id, name, type, description, stock, image, price FROM weapons", "Retrieving weapon inventory catalog");
    res.json(weapons);
  });

  // GET Route 2: Retrieve a single weapon's details by ID
  app.get("/api/weapons/:id", (req, res) => {
    const id = req.params.id;
    addLog("mysql", `SELECT * FROM weapons WHERE id = '${id}' LIMIT 1`, `Retrieving details for weapon signature: ${id}`);
    
    const weapon = weapons.find(w => w.id === id);
    if (!weapon) {
      addLog("server", `Weapon lookup failure: ${id} could not be located`, "HTTP 404 Not Found");
      return res.status(404).json({ error: "Not Found", message: "Genshin equipment not found with that specific ID." });
    }
    res.json(weapon);
  });

  // POST Route: Admin Weapon Creation with validations and token check
  app.post("/api/weapons", verifyBearerToken, (req, res) => {
    // Check permission rules
    const userRole = (req as any).user?.role;
    if (userRole !== "admin") {
      addLog("server", `Access Denied: Role '${userRole}' cannot create weapons`, "HTTP 403 Forbidden");
      return res.status(403).json({ 
        error: "Permission Denied", 
        message: "Administrative privileges are required to perform weapon creation." 
      });
    }

    const { id, name, type, description, stock, image, price } = req.body;

    // Field existence Validation
    if (!id || !name || !type || !description || stock === undefined || !image || price === undefined) {
      return res.status(400).json({ 
        error: "Validation failed", 
        message: "All fields are required (id, name, type, description, stock, image, price)." 
      });
    }

    // Numeric validations
    const parsedStock = Number(stock);
    const parsedPrice = Number(price);

    if (isNaN(parsedStock) || parsedStock < 0) {
      addLog("server", "Validation failed: Weapon stock count must not be negative");
      return res.status(400).json({ 
        error: "Validation Failed", 
        message: "Inventory stock count must be a non-negative integer." 
      });
    }

    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      addLog("server", "Validation failed: Price must be positive amount");
      return res.status(400).json({ 
        error: "Validation Failed", 
        message: "Pricing amount must be a positive number greater than zero." 
      });
    }

    // Check if ID already exists
    if (weapons.some(w => w.id === id)) {
      return res.status(400).json({ 
        error: "Conflict", 
        message: `An inventory item with exact weapon ID '${id}' already exists.` 
      });
    }

    const newWeapon: Weapon = { id, name, type, description, stock: parsedStock, image, price: parsedPrice };
    weapons.push(newWeapon);

    addLog("mysql", `INSERT INTO weapons (id, name, type, description, stock, image, price) VALUES ('${id}', '${name}', '${type}', '${description.replace(/'/g, "''")}', ${parsedStock}, '${image}', ${parsedPrice})`, `Created new inventory weapon "${name}"`);
    
    res.status(201).json({
      success: true,
      message: "Weapon created successfully inside DB index",
      data: newWeapon
    });
  });

  // PUT Route: Admin Weapon Update with validation and verification token
  app.put("/api/weapons/:id", verifyBearerToken, (req, res) => {
    const userRole = (req as any).user?.role;
    if (userRole !== "admin") {
      addLog("server", "Access Denied: Action requires Admin role");
      return res.status(403).json({ error: "Access Denied", message: "Only administrators can alter stock definitions." });
    }

    const updateId = req.params.id;
    const { name, type, description, stock, image, price } = req.body;

    const idx = weapons.findIndex(w => w.id === updateId);
    if (idx === -1) {
      return res.status(404).json({ error: "Not Found", message: "Weapon ID could not be located in database tables." });
    }

    const parsedStock = Number(stock);
    const parsedPrice = Number(price);

    // Validation
    if (stock !== undefined && (isNaN(parsedStock) || parsedStock < 0)) {
      return res.status(400).json({ error: "Validation Failed", message: "Stock count cannot be negative numbers." });
    }
    if (price !== undefined && (isNaN(parsedPrice) || parsedPrice <= 0)) {
      return res.status(400).json({ error: "Validation Failed", message: "Weapon price must be greater than zero." });
    }

    // Execute update in-memory
    const original = weapons[idx];
    weapons[idx] = {
      ...original,
      name: name !== undefined ? name : original.name,
      type: type !== undefined ? type : original.type,
      description: description !== undefined ? description : original.description,
      stock: stock !== undefined ? parsedStock : original.stock,
      image: image !== undefined ? image : original.image,
      price: price !== undefined ? parsedPrice : original.price
    };

    addLog("mysql", `UPDATE weapons SET name='${weapons[idx].name}', stock=${weapons[idx].stock}, price=${weapons[idx].price} WHERE id='${updateId}'`, `Modified weapon signature ${updateId}`);
    
    res.json({
      success: true,
      message: "Weapon updated successfully in database registry",
      data: weapons[idx]
    });
  });

  // DELETE Route: Admin Weapon Removal
  app.delete("/api/weapons/:id", verifyBearerToken, (req, res) => {
    const userRole = (req as any).user?.role;
    if (userRole !== "admin") {
      addLog("server", "Access Denied: Only Admin role can purge inventory elements");
      return res.status(403).json({ error: "Access Denied", message: "Administrator permissions required." });
    }

    const idToDelete = req.params.id;
    const beforeCount = weapons.length;
    weapons = weapons.filter(w => w.id !== idToDelete);

    if (weapons.length === beforeCount) {
      return res.status(404).json({ error: "Not Found", message: "Weapon with this ID was not cataloged." });
    }

    addLog("mysql", `DELETE FROM weapons WHERE id = '${idToDelete}'`, `Permanently purged weapon ID reference: ${idToDelete}`);
    res.json({
      success: true,
      message: "Weapon successfully deleted from inventory database."
    });
  });

  // POST Route: Execute purchase checkout (Deducts stock on database)
  app.post("/api/buy", verifyBearerToken, (req, res) => {
    const { items } = req.body; // Array of { id: string, quantity: number }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Cart Error", message: "Shopping cart is currently empty." });
    }

    addLog("server", `Processing purchase order verification for total of ${items.length} unique weapons`);

    // First pass: Verify inventory availability and check bounds
    for (const item of items) {
      const dbItem = weapons.find(w => w.id === item.id);
      if (!dbItem) {
        return res.status(404).json({ 
          error: "Product Missing", 
          message: `Weapon with referenced catalog ID '${item.id}' was not found in active inventory.` 
        });
      }
      if (item.quantity <= 0) {
        return res.status(400).json({
          error: "Validation Failed",
          message: `Quantity for weapon ${dbItem.name} must be a positive integer.`
        });
      }
      if (dbItem.stock < item.quantity) {
        addLog("server", `Out of stock: Purchase of ${item.quantity} ${dbItem.name} requested, but only ${dbItem.stock} in stock`);
        return res.status(400).json({
          error: "Out of Stock",
          message: `Insufficient stock for '${dbItem.name}'. Only ${dbItem.stock} remains in store registry.`
        });
      }
    }

    // Dynamic database transaction emulation: update stock level for each bought item and record order
    const orderLogs: string[] = [];
    const orderId = "ORD-" + Math.floor(Math.random() * 900000 + 100000);

    for (const item of items) {
      const idx = weapons.findIndex(w => w.id === item.id);
      weapons[idx].stock -= item.quantity;
      
      const queryStr = `UPDATE weapons SET stock = stock - ${item.quantity} WHERE id = '${item.id}';`;
      addLog("mysql", queryStr, `Submitting order stock deduction transaction - Order reference: ${orderId}`);
      orderLogs.push(queryStr);
    }

    // Record SQL Order invoice
    addLog("mysql", `INSERT INTO orders (id, details, timestamp) VALUES ('${orderId}', 'Checkout transaction complete', NOW());`, "Saved buyer invoice receipt");

    res.json({
      success: true,
      orderId,
      message: "Teyvat dispatch logistics successfully initialized. Stock levels updated.",
      timestamp: new Date().toISOString()
    });
  });

  // Serve static assets out of the client compile path 'dist' in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[GachaMerch Hub] Full-Stack listening at http://0.0.0.0:${PORT}`);
  });
}

startServer();
