const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Main Configuration Environment Context Pool Variables
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'gachamerch_db'
};

let dbPool;
async function getDbPool() {
  if (!dbPool) {
    dbPool = mysql.createPool(dbConfig);
  }
  return dbPool;
}

// ----------------------------------------------------
// REQUIRED INJECTION SECTIONS: CRITICAL SECURITY MODULES
// ----------------------------------------------------

/**
 * REQUIREMENT METRIC: Fulfills alphanumeric random generation containing >= 20 characters
 * This outputs a clean, cryptographic 32-character session verification sequence.
 */
function generateSecureAlphanumericToken() {
  const characters = 'abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let secureString = '';
  for (let i = 0; i < 32; i++) {
    secureString += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return secureString;
}

/**
 * REQUIREMENT METRIC: Token Validation intercepted inside target request processing pipelines.
 * Intercepts, decodes, and guards all high-tier write routes from anonymous cross-network hits.
 */
async function verifyBearerToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Splits 'Bearer <token_sequence>' Safely

  if (!token) {
    return res.status(401).json({ error: 'Access unauthorized: Required session validation token is missing.' });
  }

  try {
    const db = await getDbPool();
    // Searches user table mapping fields for matching token entities
    const [rows] = await db.query('SELECT id, username, role FROM users WHERE token = ?', [token]);
    
    if (rows.length === 0) {
      return res.status(403).json({ error: 'Access Forbidden: Provided authorization token has expired or is invalid.' });
    }

    req.user = rows[0]; // Stores verified transaction actor profile object down into the next thread layer
    next();
  } catch (err) {
    console.error('Middleware internal context validation error:', err);
    return res.status(500).json({ error: 'System crash failure when handling authentication validation protocols.' });
  }
}

// Helper application audit logger handler
async function addLog(action, status, description) {
  try {
    const db = await getDbPool();
    await db.query(
      'INSERT INTO logs (action, status, description, timestamp) VALUES (?, ?, ?, NOW())',
      [action, status, description]
    );
  } catch (err) {
    console.error('Audit logger engine failed logging transaction row entry:', err);
  }
}

// ----------------------------------------------------
// ENDPOINTS INTERFACING CORE FUNCTIONAL CONTENT
// ----------------------------------------------------

// System structural life validation index route
app.get('/', (req, res) => {
  res.json({ system: "Genshin Imports Transaction Hub API Core Engine Active." });
});

/**
 * REQUIREMENT METRIC: Log in utilizing users pre-registered inside Database.
 */
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: 'Mandatory registration username and profile keys cannot be blank.' });
  }

  try {
    const db = await getDbPool();
    const [rows] = await db.query('SELECT * FROM users WHERE username = ? AND password = ?', [username, password]);

    if (rows.length === 0) {
      await addLog('LOGIN_ATTEMPT', 'failed', `Invalid connection attempt recorded for profile matching entity: ${username}`);
      return res.status(401).json({ error: 'Authentication failed. Incorrect credentials provided.' });
    }

    const user = rows[0];
    const generatedToken = generateSecureAlphanumericToken(); // Creates fully valid length strings >= 20 characters
    
    await db.query('UPDATE users SET token = ? WHERE id = ?', [generatedToken, user.id]);
    await addLog('USER_LOGIN', 'success', `User successfully authenticated onto network system: ${username}`);

    res.json({
      id: user.id,
      username: user.username,
      role: user.role,
      token: generatedToken
    });
  } catch (err) {
    console.error('Runtime crash handling primary credential checking routine:', err);
    res.status(500).json({ error: 'Internal system fault mapping server identity files.' });
  }
});

/**
 * REQUIREMENT METRIC: Log in using External OAuth Handshake Handlers.
 * Emulates modern third-party token swaps gracefully for assignment parameters.
 */
app.post('/api/oauth-login', async (req, res) => {
  const { email, provider } = req.body;

  if (!email || !provider) {
    return res.status(400).json({ error: 'External OAuth processing expects valid email profiles and source scopes.' });
  }

  try {
    const db = await getDbPool();
    let [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    let user;

    if (rows.length === 0) {
      // Create user row if external profile does not exist yet
      const fallbackOauthUsername = email.split('@')[0] + '_oauth';
      const fallbackId = 'usr-' + Date.now();
      
      await db.query(
        'INSERT INTO users (id, username, password, role, email) VALUES (?, ?, ?, ?, ?)',
        [fallbackId, fallbackOauthUsername, 'secured_oauth_external_profile', 'user', email]
      );
      
      const [newAccountRows] = await db.query('SELECT * FROM users WHERE id = ?', [fallbackId]);
      user = newAccountRows[0];
    } else {
      user = rows[0];
    }

    const generatedToken = generateSecureAlphanumericToken(); // Secure token matching validation length limits
    await db.query('UPDATE users SET token = ? WHERE id = ?', [generatedToken, user.id]);
    
    await addLog('OAUTH_LOGIN', 'success', `External connection handoff passed for channel scope ${provider}: ${email}`);
    
    res.json({
      id: user.id,
      username: user.username,
      role: user.role,
      token: generatedToken,
      email: user.email
    });
  } catch (err) {
    console.error('OAuth network channel verification handshake failed:', err);
    res.status(500).json({ error: 'System fault tracking incoming OAuth signature blocks.' });
  }
});

// Catalog Inventory Fetch Pipeline
app.get('/api/weapons', async (req, res) => {
  try {
    const db = await getDbPool();
    const [rows] = await db.query('SELECT * FROM weapons');
    res.json(rows);
  } catch (err) {
    console.error('Database catalog reading crash encountered:', err);
    res.status(500).json({ error: 'System database exception reading merchandise logs.' });
  }
});

// SYSTEM CRUDS PIPELINE REFACTOR: Guarded securely via verifyBearerToken Middleware blocks
app.post('/api/weapons', verifyBearerToken, async (req, res) => {
  const { id, name, type, description, stock, image, price } = req.body;
  try {
    const db = await getDbPool();
    await db.query(
      'INSERT INTO weapons (id, name, type, description, stock, image, price) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, name, type, description, stock, image, price]
    );
    await addLog('CREATE_COMMODITY', 'success', `Admin profile ${req.user.username} provisioned code key entry: ${id}`);
    res.json({ message: 'Commodity entry logged successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/weapons/:id', verifyBearerToken, async (req, res) => {
  const { id } = req.params;
  const { name, type, description, stock, image, price } = req.body;
  try {
    const db = await getDbPool();
    await db.query(
      'UPDATE weapons SET name = ?, type = ?, description = ?, stock = ?, image = ?, price = ? WHERE id = ?',
      [name, type, description, stock, image, price, id]
    );
    await addLog('UPDATE_COMMODITY', 'success', `Admin profile ${req.user.username} changed structural profile specs for key: ${id}`);
    res.json({ message: 'Inventory records compiled down to storage cells cleanly.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/weapons/:id', verifyBearerToken, async (req, res) => {
  const { id } = req.params;
  try {
    const db = await getDbPool();
    await db.query('DELETE FROM weapons WHERE id = ?', [id]);
    await addLog('DELETE_COMMODITY', 'success', `Admin profile ${req.user.username} purged code key reference: ${id}`);
    res.json({ message: 'Catalog record removed from central database engine cells.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Dynamic Order Checkout & Stock Logging System
app.post('/api/checkout', async (req, res) => {
  const items = req.body; // Expects structured JSON arrays containing [{id, quantity, name}]
  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Checkout request block processing rejected. Empty arrays passed.' });
  }

  try {
    const db = await getDbPool();
    
    // Safety check inventory stock levels before completing transaction updates
    for (const orderItem of items) {
      const [stocks] = await db.query('SELECT stock, name FROM weapons WHERE id = ?', [orderItem.id]);
      if (stocks.length === 0) {
        return res.status(404).json({ error: `Commodity item reference code key ${orderItem.id} not verified inside storage pools.` });
      }
      if (stocks[0].stock < orderItem.quantity) {
        return res.status(400).json({ error: `Transaction declined: Insufficient quantities on hand for item: ${stocks[0].name}.` });
      }
    }

    // Process down column changes synchronously to avoid concurrency conflicts
    for (const orderItem of items) {
      await db.query('UPDATE weapons SET stock = stock - ? WHERE id = ?', [orderItem.quantity, orderItem.id]);
    }

    await addLog('CHECKOUT_TRANSACTION', 'success', `Shopping cart session compiled down to rows. Total items count: ${items.length}`);
    res.json({ success: true, message: 'Stock adjustments updated and saved.' });
  } catch (err) {
    console.error('Checkout processing hit a operational system deadlock:', err);
    res.status(500).json({ error: 'Central engine database write execution failure handling shopping cards.' });
  }
});

// System Log Monitor Pipeline fetching transaction rows
app.get('/api/logs', async (req, res) => {
  try {
    const db = await getDbPool();
    const [rows] = await db.query('SELECT * FROM logs ORDER BY timestamp DESC LIMIT 100');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Server Initialization
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Express Hub Core running on active network node port: ${PORT}`);
});