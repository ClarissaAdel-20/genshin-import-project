const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection Pool (Configured with env details, falls back to a lazy initialiser)
let pool;
async function getDbPool() {
  if (!pool) {
    try {
      pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'gachamerch_db',
        port: parseInt(process.env.DB_PORT || '3306'),
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
      });
      console.log('MySQL Connection Pool initiated.');
    } catch (err) {
      console.error('Failed to create MySQL pool:', err);
      throw err;
    }
  }
  return pool;
}

// System Logging Utility
const systemLogs = [];
function addLog(action, status, detail) {
  const log = {
    id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toISOString(),
    action,
    status,
    detail
  };
  systemLogs.unshift(log);
  console.log(`[Log] ${log.timestamp} - ${action} (${status}): ${detail}`);
  return log;
}

// 1. Authentication Endpoint
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  try {
    const db = await getDbPool();
    const [rows] = await db.query('SELECT * FROM users WHERE username = ? AND password = ?', [username, password]);

    if (rows.length > 0) {
      const user = rows[0];
      // Generate a simple secure token for authorization headers
      const token = `tok_${user.username}_${Math.random().toString(36).substr(2, 9)}`;
      await db.query('UPDATE users SET token = ? WHERE id = ?', [token, user.id]);

      addLog('USER_LOGIN', 'success', `User ${username} authenticated successfully.`);
      res.json({
        username: user.username,
        role: user.role,
        token: token,
        email: user.email
      });
    } else {
      addLog('USER_LOGIN', 'failed', `Invalid login credentials attempted for: ${username}`);
      res.status(401).json({ error: 'Invalid username or password' });
    }
  } catch (err) {
    console.error('Login error:', err);
    addLog('USER_LOGIN', 'error', `Database query error: ${err.message}`);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 2. Weapons - Read Inventory (Fetch from both weapons and artifacts tables)
app.get('/api/weapons', async (req, res) => {
  try {
    const db = await getDbPool();
    const [weapons] = await db.query('SELECT * FROM weapons');
    const [artifacts] = await db.query('SELECT * FROM artifacts');
    const combined = [...weapons, ...artifacts];
    res.json(combined);
  } catch (err) {
    console.error('Fetch weapons error:', err);
    res.status(500).json({ error: 'Internal server error while fetching weapons and artifacts' });
  }
});

// 3. Weapons - Create (Admin functionality)
app.post('/api/weapons', async (req, res) => {
  const { id, name, type, description, stock, image, price } = req.body;
  if (!id || !name || !type || stock === undefined || !price) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  try {
    const db = await getDbPool();
    const isArtifact = id.toLowerCase().startsWith('a') || 
                       ['flower', 'plume', 'sands', 'goblet', 'circlet', 'relic'].some(keyword => type.toLowerCase().includes(keyword));
    const targetTable = isArtifact ? 'artifacts' : 'weapons';

    await db.query(
      `INSERT INTO ${targetTable} (id, name, type, description, stock, image, price) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, name, type, description || '', stock, image || '', price]
    );

    addLog('WEAPON_CREATE', 'success', `Created ${isArtifact ? 'artifact' : 'weapon'} ${name} (ID: ${id})`);
    res.status(201).json({ message: 'Item created successfully', weapon: req.body });
  } catch (err) {
    console.error('Create item error:', err);
    addLog('WEAPON_CREATE', 'error', `Failed to create item: ${err.message}`);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// 4. Weapons - Update (Admin functionality)
app.put('/api/weapons/:id', async (req, res) => {
  const { id } = req.params;
  const { name, type, description, stock, image, price } = req.body;

  try {
    const db = await getDbPool();
    const isArtifact = id.toLowerCase().startsWith('a') || 
                       ['flower', 'plume', 'sands', 'goblet', 'circlet', 'relic'].some(keyword => type.toLowerCase().includes(keyword));
    const targetTable = isArtifact ? 'artifacts' : 'weapons';

    const [result] = await db.query(
      `UPDATE ${targetTable} SET name=?, type=?, description=?, stock=?, image=?, price=? WHERE id=?`,
      [name, type, description || '', stock, image || '', price, id]
    );

    if (result.affectedRows > 0) {
      addLog('WEAPON_UPDATE', 'success', `Updated item credentials for ID: ${id}`);
      res.json({ message: 'Item updated successfully' });
    } else {
      res.status(404).json({ error: 'Item not found' });
    }
  } catch (err) {
    console.error('Update item error:', err);
    addLog('WEAPON_UPDATE', 'error', `Failed to update item ${id}: ${err.message}`);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// 5. Weapons - Delete (Admin functionality)
app.delete('/api/weapons/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const db = await getDbPool();
    const isArtifact = id.toLowerCase().startsWith('a');
    const targetTable = isArtifact ? 'artifacts' : 'weapons';

    const [result] = await db.query(`DELETE FROM ${targetTable} WHERE id = ?`, [id]);

    if (result.affectedRows > 0) {
      addLog('WEAPON_DELETE', 'success', `Deleted item with ID: ${id}`);
      res.json({ message: 'Item deleted successfully' });
    } else {
      res.status(404).json({ error: 'Item not found' });
    }
  } catch (err) {
    console.error('Delete item error:', err);
    addLog('WEAPON_DELETE', 'error', `Failed to delete item ${id}: ${err.message}`);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// 6. Submit Checkout Transaction Order
app.post('/api/orders', async (req, res) => {
  const { items } = req.body;
  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Invalid checkout request body' });
  }

  try {
    const db = await getDbPool();
    const orderId = `ord-${Date.now()}`;
    const descList = items.map(i => `${i.quantity}x ${i.name}`).join(', ');

    // Start Transaction to guarantee stock decrease consistency
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      // Deduct stock for each item
      for (const item of items) {
        let rows;
        let targetTable;

        // Try weapons first
        const [weaponRows] = await connection.query('SELECT stock FROM weapons WHERE id = ?', [item.id]);
        if (weaponRows.length > 0) {
          rows = weaponRows;
          targetTable = 'weapons';
        } else {
          // Try artifacts
          const [artifactRows] = await connection.query('SELECT stock FROM artifacts WHERE id = ?', [item.id]);
          if (artifactRows.length > 0) {
            rows = artifactRows;
            targetTable = 'artifacts';
          }
        }

        if (!targetTable) {
          throw new Error(`Item not found in inventory: ${item.name}`);
        }

        const currentStock = rows[0].stock;
        if (currentStock < item.quantity) {
          throw new Error(`Insufficient stock for ${item.name}. Available: ${currentStock}`);
        }

        await connection.query(`UPDATE ${targetTable} SET stock = stock - ? WHERE id = ?`, [item.quantity, item.id]);
      }

      // Record Order item
      await connection.query('INSERT INTO orders (id, details) VALUES (?, ?)', [orderId, descList]);
      await connection.commit();

      addLog('CHECKOUT', 'success', `Processed transaction ${orderId}. Details: ${descList}`);
      res.json({ message: 'Purchase processed and audited successfully.', orderId });
    } catch (e) {
      await connection.rollback();
      throw e;
    } finally {
      connection.release();
    }
  } catch (err) {
    console.error('Checkout validation failed:', err);
    addLog('CHECKOUT', 'failed', `Checkout declined: ${err.message}`);
    res.status(400).json({ error: err.message || 'Database error occurred' });
  }
});

// 7. Read Audit Logs Console
app.get('/api/logs', (req, res) => {
  res.json(systemLogs);
});

// Root Health Route
app.get('/', (req, res) => {
  res.send('✅ GachaMerch Server is Active and running healthy.');
});

// Server Ingress
app.listen(PORT, '0.0.0.0', () => {
  console.log(`GachaMerch HTTP backend listening on http://localhost:${PORT}`);
});
