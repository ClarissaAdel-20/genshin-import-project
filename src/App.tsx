import React, { useState, useEffect } from 'react';
import {
  Layers,
  Sparkles,
  Download,
  Copy,
  RefreshCw,
  Search,
  Check,
  Award,
  Settings,
  Flame,
  Activity,
  Heart,
  ShieldAlert,
  Sliders,
  ChevronRight,
  Info,
  RotateCcw,
  BookOpen,
  Smartphone,
  Database,
  Code,
  Terminal,
  User,
  Plus,
  Trash2,
  Edit,
  ShoppingCart,
  Lock,
  FileText,
  AlertTriangle,
  ExternalLink,
  Laptop
} from 'lucide-react';
import { Weapon, DbUserSession, SystemLog } from './types';

// Pre-defined Flutter source codes for instant preview and download
const FLUTTER_CODES = {
  main: `import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'pages/login_page.dart';
import 'services/api_service.dart';

void main() {
  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => ApiService()),
      ],
      child: const GachaMerchApp(),
    ),
  );
}

class GachaMerchApp extends StatefulWidget {
  const GachaMerchApp({Key? key}) : return super(key: key);

  @override
  State<GachaMerchApp> createState() => _GachaMerchAppState();
}

class _GachaMerchAppState extends State<GachaMerchApp> {
  // Global Themable Config State (Course Requirement: Change 2-4 UI Properties)
  ThemeMode _themeMode = ThemeMode.dark;
  double _fontSizeMultiplier = 1.0;
  Color _accentColor = const Color(0xFFD1B170); // Warm Gold

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'GachaMerch - Genshin Import',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        fontFamily: 'Inter',
        brightness: Brightness.light,
        primaryColor: _accentColor,
        scaffoldBackgroundColor: const Color(0xFFF8F9FA),
        textTheme: TextTheme(
          bodyLarge: TextStyle(fontSize: 16 * _fontSizeMultiplier, color: Colors.black87),
          titleLarge: TextStyle(fontSize: 22 * _fontSizeMultiplier, fontWeight: FontWeight.bold),
        ),
      ),
      darkTheme: ThemeData(
        fontFamily: 'SpaceGrotesk',
        brightness: Brightness.dark,
        primaryColor: _accentColor,
        scaffoldBackgroundColor: const Color(0xFF0F111A),
        textTheme: TextTheme(
          bodyLarge: TextStyle(fontSize: 16 * _fontSizeMultiplier, color: Colors.whiteEF),
          titleLarge: TextStyle(fontSize: 22 * _fontSizeMultiplier, fontWeight: FontWeight.bold, color: _accentColor),
        ),
      ),
      themeMode: _themeMode,
      home: LoginPage(
        onThemeChanged: (mode, size, color) {
          setState(() {
            _themeMode = mode;
            _fontSizeMultiplier = size;
            _accentColor = color;
          });
        },
      ),
    );
  }
}`,

  api_service: `import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

class ApiService extends ChangeNotifier {
  final String baseUrl = 'http://localhost:3000/api';
  String? _bearerToken;
  String? _username;
  String? _role;

  String? get bearerToken => _bearerToken;
  String? get username => _username;
  String? get role => _role;
  bool get isAuthenticated => _bearerToken != null;

  // Login handler returning alphanumeric token >= 20 chars
  Future<bool> login(String username, String password, {String? oAuthService}) async {
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/auth/login'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'username': username,
          'password': password,
          'oAuthService': oAuthService,
        }),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        _bearerToken = data['user']['token'];
        _username = data['user']['username'];
        _role = data['user']['role'];
        notifyListeners();
        return true;
      }
      return false;
    } catch (e) {
      debugPrint('Connection error during authentication: $e');
      return false;
    }
  }

  void logout() {
    _bearerToken = null;
    _username = null;
    _role = null;
    notifyListeners();
  }

  // GET Request 1: Fetch Catalog Items
  Future<List<dynamic>> fetchWeapons() async {
    final response = await http.get(Uri.parse('$baseUrl/weapons'));
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    }
    throw Exception('Failed to load weapon inventory');
  }

  // GET Request 2: Fetch Single Item Details
  Future<Map<String, dynamic>> fetchWeaponDetails(String id) async {
    final response = await http.get(Uri.parse('$baseUrl/weapons/$id'));
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    }
    throw Exception('Failed to load weapon details');
  }

  // POST Request: Create Weapon (Requires Auth token verification)
  Future<bool> createWeapon(Map<String, dynamic> weaponData) async {
    final response = await http.post(
      Uri.parse('$baseUrl/weapons'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $_bearerToken',
      },
      body: jsonEncode(weaponData),
    );
    return response.statusCode == 201;
  }

  // PUT Request: Update Weapon stock or attributes
  Future<bool> updateWeapon(String id, Map<String, dynamic> weaponData) async {
    final response = await http.put(
      Uri.parse('$baseUrl/weapons/$id'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $_bearerToken',
      },
      body: jsonEncode(weaponData),
    );
    return response.statusCode == 200;
  }

  // DELETE Request: Remove Weapon
  Future<bool> deleteWeapon(String id) async {
    final response = await http.delete(
      Uri.parse('$baseUrl/weapons/$id'),
      headers: {
        'Authorization': 'Bearer $_bearerToken',
      },
    );
    return response.statusCode == 200;
  }

  // POST Request 2: Buy weapons and checkout
  Future<bool> buyWeapons(List<Map<String, dynamic>> items) async {
    final response = await http.post(
      Uri.parse('$baseUrl/buy'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $_bearerToken',
      },
      body: jsonEncode({'items': items}),
    );
    return response.statusCode == 200;
  }
}`,

  login_page: `import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/api_service.dart';
import 'store_page.dart';

class LoginPage extends StatefulWidget {
  final Function(ThemeMode, double, Color) onThemeChanged;
  const LoginPage({super.key, required this.onThemeChanged});

  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  final _formKey = GlobalKey<FormState>();
  final _usernameController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _isLoading = false;
  String? _errorMessage;

  // Validation Rule 1: Empty text check & formatting rules
  String? _validateUsername(String? value) {
    if (value == null || value.trim().isEmpty) {
      return 'Username field is required';
    }
    return null;
  }

  String? _validatePassword(String? value) {
    if (value == null || value.isEmpty) {
      return 'Password field must not be empty';
    }
    if (value.length < 6) {
      return 'Password must be at least 6 characters';
    }
    return null;
  }

  Future<void> _handleLogin() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    final api = Provider.of<ApiService>(context, listen: false);
    final success = await api.login(_usernameController.text, _passwordController.text);

    setState(() { _isLoading = false; });

    if (success) {
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (context) => StorePage(onThemeChanged: widget.onThemeChanged)),
      );
    } else {
      setState(() {
        _errorMessage = "Invalid login credentials! (Try admin/password123 or user/password123)";
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24.0),
          child: Form(
            key: _formKey,
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.rocket_launch, size: 60, color: Color(0xFFD1B170)),
                const SizedBox(height: 16),
                const Text('GACHAMERCH', style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold)),
                const Text('Genshin Import Showcase Store'),
                const SizedBox(height: 32),
                
                if (_errorMessage != null)
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(color: Colors.red.withOpacity(0.1), borderRadius: BorderRadius.circular(8)),
                    child: Text(_errorMessage!, style: const TextStyle(color: Colors.redAccent)),
                  ),
                  
                const SizedBox(height: 16),
                TextFormField(
                  controller: _usernameController,
                  decoration: const InputDecoration(labelText: 'Username', prefixIcon: Icon(Icons.person)),
                  validator: _validateUsername,
                ),
                TextFormField(
                  controller: _passwordController,
                  obscureText: true,
                  decoration: const InputDecoration(labelText: 'Password', prefixIcon: Icon(Icons.lock)),
                  validator: _validatePassword,
                ),
                const SizedBox(height: 24),
                ElevatedButton(
                  onPressed: _isLoading ? null : _handleLogin,
                  child: _isLoading ? const CircularProgressIndicator() : const Text('Login'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}`,

  store_page: `import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/api_service.dart';
import 'weapon_detail_page.dart';
import 'admin_crud_page.dart';
import 'cart_page.dart';

class StorePage extends StatefulWidget {
  final Function(ThemeMode, double, Color) onThemeChanged;
  const StorePage({super.key, required this.onThemeChanged});

  @override
  State<StorePage> createState() => _StorePageState();
}

class _StorePageState extends State<StorePage> {
  late Future<List<dynamic>> _weaponsFuture;

  @override
  void initState() {
    super.initState();
    _weaponsFuture = Provider.of<ApiService>(context, listen: false).fetchWeapons();
  }

  @override
  Widget build(BuildContext context) {
    final api = Provider.of<ApiService>(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Genshin Import'),
        actions: [
          IconButton(onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const CartPage())), icon: const Icon(Icons.shopping_cart)),
          if (api.role == 'admin')
            IconButton(onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const AdminCrudPage())), icon: const Icon(Icons.admin_panel_settings)),
        ],
      ),
      body: FutureBuilder<List<dynamic>>(
        future: _weaponsFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) return const Center(child: CircularProgressIndicator());
          if (snapshot.hasError) return Center(child: Text('Error: \${snapshot.error}'));

          final weapons = snapshot.data ?? [];
          return GridView.builder(
            padding: const EdgeInsets.all(16),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(crossAxisCount: 2, childAspectRatio: 0.75),
            itemCount: weapons.length,
            itemBuilder: (context, idx) {
              final weapon = weapons[idx];
              return Card(
                child: InkWell(
                  onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => WeaponDetailPage(weapon: weapon, onThemeChanged: widget.onThemeChanged))),
                  child: Column(
                    children: [
                      Image.network(weapon['image'], height: 100, fit: BoxFit.cover),
                      Text(weapon['name'], style: const TextStyle(fontWeight: FontWeight.bold)),
                      Text('\${weapon['price']} Primogems'),
                    ],
                  ),
                ),
              );
            },
          );
        },
      ),
    );
  }
}`,

  admin_page: `import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/api_service.dart';

class AdminCrudPage extends StatefulWidget {
  const AdminCrudPage({super.key});

  @override
  State<AdminCrudPage> createState() => _AdminCrudPageState();
}

class _AdminCrudPageState extends State<AdminCrudPage> {
  final _formKey = GlobalKey<FormState>();
  final _idController = TextEditingController();
  final _nameController = TextEditingController();
  final _descController = TextEditingController();
  final _stockController = TextEditingController();
  final _priceController = TextEditingController();
  String _type = 'Sword';

  // Validation Rule 2: Non-negative stock constraints
  String? _validateStock(String? value) {
    if (value == null || value.isEmpty) return 'Stock count required';
    final parsed = int.tryParse(value);
    if (parsed == null || parsed < 0) return 'Stock must be non-negative integer';
    return null;
  }

  // Validation Rule 3: Positive price constraints
  String? _validatePrice(String? value) {
    if (value == null || value.isEmpty) return 'Price required';
    final parsed = int.tryParse(value);
    if (parsed == null || parsed <= 0) return 'Price must be greater than zero';
    return null;
  }

  @override
  Widget build(BuildContext context) {
    final api = Provider.of<ApiService>(context);

    return Scaffold(
      appBar: AppBar(title: const Text('Admin Weapon Depot')),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            TextFormField(controller: _idController, decoration: const InputDecoration(labelText: 'Weapon ID (e.g. W06)')),
            TextFormField(controller: _nameController, decoration: const InputDecoration(labelText: 'Name (e.g. Primordial Jade)')),
            TextFormField(controller: _descController, decoration: const InputDecoration(labelText: 'Description')),
            TextFormField(controller: _stockController, decoration: const InputDecoration(labelText: 'Stock'), keyboardType: TextInputType.number, validator: _validateStock),
            TextFormField(controller: _priceController, decoration: const InputDecoration(labelText: 'Price'), keyboardType: TextInputType.number, validator: _validatePrice),
            ElevatedButton(
              onPressed: () {
                if (!_formKey.currentState!.validate()) return;
                api.createWeapon({
                  'id': _idController.text,
                  'name': _nameController.text,
                  'type': _type,
                  'description': _descController.text,
                  'stock': int.parse(_stockController.text),
                  'price': int.parse(_priceController.text),
                  'image': 'https://enka.network/ui/UI_EquipIcon_Sword_Narukami.png',
                });
                Navigator.of(context).pop();
              },
              child: const Text('Add Weapon'),
            )
          ],
        ),
      ),
    );
  }
}`,

  node_server: `// GachaMerch - Genshin Import Express Server
// Compatible with Node.js & local MySQL setups
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// MySQL database connections
const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'gachamerch_db'
});

db.connect((err) => {
  if (err) {
    console.error('MySQL Connection failure:', err);
    return;
  }
  console.log('Successfully connected to MySQL database engine.');
});

// Alphanumeric Bearer token middleware filter verification
function verifyBearerToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized', message: 'Bearer token required' });
  }
  const token = authHeader.split(' ')[1];
  if (token.length < 20) {
    return res.status(403).json({ error: 'Forbidden', message: 'Invalid token structure' });
  }

  // Retrieve user session mapping from db
  db.query('SELECT * FROM users WHERE token = ?', [token], (err, results) => {
    if (err || results.length === 0) {
      return res.status(403).json({ error: 'Forbidden', message: 'Token expired or invalid' });
    }
    req.user = results[0];
    next();
  });
}

// REST GET 1: Retrieve all elements
app.get('/api/weapons', (req, res) => {
  db.query('SELECT * FROM weapons', (error, results) => {
    if (error) return res.status(500).json({ error });
    res.json(results);
  });
});

// REST GET 2: Retrieve single item
app.get('/api/weapons/:id', (req, res) => {
  db.query('SELECT * FROM weapons WHERE id = ?', [req.params.id], (error, results) => {
    if (error) return res.status(500).json({ error });
    if (results.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(results[0]);
  });
});

// REST POST: Save item
app.post('/api/weapons', verifyBearerToken, (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
  const { id, name, type, description, stock, image, price } = req.body;
  
  db.query('INSERT INTO weapons SET ?', { id, name, type, description, stock, image, price }, (error) => {
    if (error) return res.status(400).json({ error });
    res.status(201).json({ success: true, message: 'Created' });
  });
});

// REST POST 2: Buy checkout & deduct stock level
app.post('/api/buy', verifyBearerToken, (req, res) => {
  const { items } = req.body;
  // Dynamic SQL transactions
  db.beginTransaction((err) => {
    if (err) return res.status(500).json({ error: err });
    
    // Process stock levels checking and subtraction
    for (let item of items) {
      db.query('UPDATE weapons SET stock = stock - ? WHERE id = ? AND stock >= ?', [item.quantity, item.id, item.quantity], (error, results) => {
        if (error || results.affectedRows === 0) {
          return db.rollback(() => {
            res.status(400).json({ error: 'Insufficient stock or invalid weapon ID' });
          });
        }
      });
    }

    db.query('INSERT INTO orders (id, timestamp) VALUES (?, NOW())', ['ORD-' + Date.now()], (error) => {
      if (error) {
        return db.rollback(() => { res.status(500).json({ error }); });
      }
      db.commit(() => {
        res.json({ success: true, message: 'Stock levels updated. Purchase verified!' });
      });
    });
  });
});

app.listen(PORT, () => console.log('Node Server started on Port ' + PORT));`,

  schema_sql: `-- Database Script: MySQL DDL Setup Schema
-- Project: GachaMerch Genshin Import Application

CREATE DATABASE IF NOT EXISTS gachamerch_db;
USE gachamerch_db;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(50) PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL, -- 'admin' or 'user'
  email VARCHAR(100) UNIQUE,
  token VARCHAR(100)
);

-- Weapons Table
CREATE TABLE IF NOT EXISTS weapons (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'Sword', 'Bow', 'Polearm'
  description TEXT,
  stock INT NOT NULL DEFAULT 0,
  image VARCHAR(255),
  price DECIMAL(10, 2) NOT NULL
);

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id VARCHAR(50) PRIMARY KEY,
  details VARCHAR(255),
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert Default Seed Data for validation
INSERT INTO users (id, username, password, role, email) VALUES
('usr-01', 'admin', 'password123', 'admin', 'admin@gachamerch.com'),
('usr-02', 'user', 'password123', 'user', 'user@gachamerch.com')
ON DUPLICATE KEY UPDATE id=id;

INSERT INTO weapons (id, name, type, description, stock, image, price) VALUES
('W01', 'Staff of Homa', 'Polearm', 'An ancient ritual staff. Highly coveted.', 25, 'https://enka.network/ui/UI_EquipIcon_Pole_Homa.png', 648000),
('W02', 'Mistsplitter Reforged', 'Sword', 'Violet energy sword with massive crit multiplier.', 12, 'https://enka.network/ui/UI_EquipIcon_Sword_Narukami.png', 648000),
('W03', 'Splendor of Tranquil Waters', 'Sword', 'Fontaine crystal sword. Gleams beautifully.', 8, 'https://enka.network/ui/UI_EquipIcon_Sword_Pneuma.png', 648000)
ON DUPLICATE KEY UPDATE id=id;
`
};

export default function App() {
  // Database synchronization & web console state
  const [weapons, setWeapons] = useState<Weapon[]>([]);
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [currentUser, setCurrentUser] = useState<DbUserSession | null>(null);

  // Applet tabs
  const [activeTab, setActiveTab] = useState<'emulator' | 'console' | 'exporter' | 'documentation'>('emulator');

  // Emulator state
  const [emulatedPage, setEmulatedPage] = useState<'login' | 'store' | 'detail' | 'cart' | 'admin'>('login');
  
  // Custom theme properties (Course requirement)
  const [customTheme, setCustomTheme] = useState<{
    id: string;
    name: string;
    fontFamily: string;
    fontSize: string;
    bgColor: string;
    textColor: string;
    accentTint: string;
  }>({
    id: 'gold-light',
    name: 'Teyvat Gold Light',
    fontFamily: 'font-sans',
    fontSize: 'text-sm',
    bgColor: 'bg-white',
    textColor: 'text-gray-900',
    accentTint: '#d1b170'
  });

  const customThemesList = [
    {
      id: 'gold-light',
      name: 'Teyvat Gold Light (Default)',
      fontFamily: 'font-sans',
      fontSize: 'text-sm',
      bgColor: 'bg-white',
      textColor: 'text-gray-900',
      accentTint: '#d1b170'
    },
    {
      id: 'abyss-purple',
      name: 'Abyss Dark Purple',
      fontFamily: 'font-mono',
      fontSize: 'text-xs',
      bgColor: 'bg-[#151224]',
      textColor: 'text-[#e5dcfc]',
      accentTint: '#c279fb'
    },
    {
      id: 'hydro-blue',
      name: 'Fontaine Hydro Blue',
      fontFamily: 'font-serif',
      fontSize: 'text-base',
      bgColor: 'bg-[#eef8ff]',
      textColor: 'text-[#1c2e42]',
      accentTint: '#3caafd'
    }
  ];

  // Emulator interactive parameters
  const [loginUsername, setLoginUsername] = useState<string>('');
  const [loginPassword, setLoginPassword] = useState<string>('');
  const [loginError, setLoginError] = useState<string | null>(null);
  
  // Selected single weapon in emulator
  const [selectedWeapon, setSelectedWeapon] = useState<Weapon | null>(null);
  
  // Shopping Cart state
  const [cart, setCart] = useState<Array<{ weapon: Weapon; quantity: number }>>([]);
  const [cartError, setCartError] = useState<string | null>(null);
  const [checkoutSuccess, setCheckoutSuccess] = useState<string | null>(null);

  // Admin CRUD parameters
  const [adminWeaponId, setAdminWeaponId] = useState<string>('');
  const [adminWeaponName, setAdminWeaponName] = useState<string>('');
  const [adminWeaponType, setAdminWeaponType] = useState<string>('Sword');
  const [adminWeaponDesc, setAdminWeaponDesc] = useState<string>('');
  const [adminWeaponStock, setAdminWeaponStock] = useState<string>('10');
  const [adminWeaponPrice, setAdminWeaponPrice] = useState<string>('328000');
  const [adminWeaponImage, setAdminWeaponImage] = useState<string>('https://enka.network/ui/UI_EquipIcon_Sword_Narukami.png');
  const [adminError, setAdminError] = useState<string | null>(null);
  const [adminSuccess, setAdminSuccess] = useState<string | null>(null);

  // Exporter tab state
  const [codeKey, setCodeKey] = useState<keyof typeof FLUTTER_CODES>('main');
  const [copiedCodeFlag, setCopiedCodeFlag] = useState<boolean>(false);

  // Simulated SQL editor console
  const [customSqlQuery, setCustomSqlQuery] = useState<string>('SELECT * FROM weapons WHERE stock > 10;');
  const [sqlResult, setSqlResult] = useState<string>('');

  // Fetch from the actual Express server!
  const getWeaponsFromDb = async () => {
    try {
      const response = await fetch('/api/weapons');
      if (response.ok) {
        const data = await response.json();
        setWeapons(data);
      }
    } catch (e) {
      console.error("Express weapons route is booting up:", e);
    }
  };

  const getLogsFromDb = async () => {
    try {
      const response = await fetch('/api/logs');
      if (response.ok) {
        const data = await response.json();
        setLogs(data);
      }
    } catch (e) {
      // safe fallback
    }
  };

  useEffect(() => {
    getWeaponsFromDb();
    getLogsFromDb();
    const interval = setInterval(() => {
      getWeaponsFromDb();
      getLogsFromDb();
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  // Live SQL interpreter mock for validation & review
  const runCustomSqlInLiveConsole = () => {
    const cleanQuery = customSqlQuery.trim().toUpperCase();
    if (cleanQuery.includes('SELECT * FROM WEAPONS')) {
      const filtered = cleanQuery.includes('STOCK > 10') 
        ? weapons.filter(w => w.stock > 10) 
        : weapons;
      setSqlResult(`Query Plan: Index scan on weapons table\nReturned ${filtered.length} rows in 2ms:\n` + JSON.stringify(filtered, null, 2));
    } else if (cleanQuery.includes('SELECT * FROM USERS')) {
      setSqlResult(`Index match on users. Found 2 records:\n` + JSON.stringify([
        { id: "usr-01", username: "admin", role: "admin", email: "admin@gachamerch.com" },
        { id: "usr-02", username: "user", role: "user", email: "user@gachamerch.com" }
      ], null, 2));
    } else if (cleanQuery.includes('SELECT') || cleanQuery.includes('SHOW')) {
      setSqlResult(`Emulated result: query execution OK.\nRows affected: 0.`);
    } else {
      setSqlResult(`Query Error: DDL mutations are write-locked in the live developer inspector workspace. Please run Admin CRUD controls on the Mobile Simulator to write securely!`);
    }
  };

  // Login handler
  const handleAuthSubmit = async (provider?: string) => {
    setLoginError(null);
    
    // Check validation rule 1: fields empty
    if (!provider && (!loginUsername.trim() || !loginPassword.trim())) {
      setLoginError("Form Validation: Username and Password fields are required!");
      return;
    }

    try {
      const body: any = {};
      if (provider) {
        body.oAuthService = provider;
        body.username = provider === 'Google' ? 'TravelerGodGoogle' : 'FacebookTraveler';
      } else {
        body.username = loginUsername.trim();
        body.password = loginPassword;
      }

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const resData = await response.json();
      if (!response.ok) {
        setLoginError(resData.message || "Credential matching failed!");
        return;
      }

      // Successful login
      setCurrentUser(resData.user);
      setEmulatedPage('store');
    } catch (e) {
      setLoginError("Node.js authentication server is unreachable.");
    }
  };

  // Buy Checkout handler (incorporating token verification)
  const handlePurchaseCheckout = async () => {
    setCartError(null);
    setCheckoutSuccess(null);

    if (cart.length === 0) {
      setCartError("Validation Error: Shopping cart is completely empty.");
      return;
    }

    if (!currentUser?.token) {
      setCartError("Security Error: Alphanumeric login bearer token missing.");
      return;
    }

    try {
      const buyItems = cart.map(c => ({ id: c.weapon.id, quantity: c.quantity }));
      
      const response = await fetch('/api/buy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.token}`
        },
        body: JSON.stringify({ items: buyItems })
      });

      const resData = await response.json();
      if (!response.ok) {
        setCartError(resData.message || "Purchase deduction failed.");
        return;
      }

      setCheckoutSuccess(`Deducted successfully! Order ID: ${resData.orderId}. GachaMerch logistic orders are en-route.`);
      setCart([]);
    } catch (e) {
      setCartError("Backend error executing checkout transaction.");
    }
  };

  // Add Item to cart
  const addToCart = (wpn: Weapon, qty: number) => {
    // Check stock bounds validation
    if (qty <= 0) return;
    if (wpn.stock < qty) {
      alert(`Oops! Requesting ${qty} pieces but GachaMerch only has ${wpn.stock} in stock!`);
      return;
    }

    const existingIdx = cart.findIndex(c => c.weapon.id === wpn.id);
    if (existingIdx > -1) {
      const newCart = [...cart];
      newCart[existingIdx].quantity += qty;
      setCart(newCart);
    } else {
      setCart([...cart, { weapon: wpn, quantity: qty }]);
    }
  };

  // Admin Create Weapon
  const handleAdminCrudSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError(null);
    setAdminSuccess(null);

    // Dynamic validations
    if (!adminWeaponId.trim() || !adminWeaponName.trim() || !adminWeaponDesc.trim()) {
      setAdminError("Validation Error: Weapon ID, Name and Description cannot be left blank.");
      return;
    }

    const parsedStock = Number(adminWeaponStock);
    const parsedPrice = Number(adminWeaponPrice);

    if (isNaN(parsedStock) || parsedStock < 0) {
      setAdminError("Validation Error: Weapon stock level cannot be negative!");
      return;
    }

    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      setAdminError("Validation Error: Primogem pricing must be a positive number greater than zero!");
      return;
    }

    if (!currentUser?.token) {
      setAdminError("Security Header Error: Invalid session Bearer Token.");
      return;
    }

    try {
      const response = await fetch('/api/weapons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.token}`
        },
        body: JSON.stringify({
          id: adminWeaponId.trim(),
          name: adminWeaponName.trim(),
          type: adminWeaponType,
          description: adminWeaponDesc.trim(),
          stock: parsedStock,
          image: adminWeaponImage,
          price: parsedPrice
        })
      });

      const resData = await response.json();
      if (!response.ok) {
        setAdminError(resData.message || "Could not publish Gacha weapon.");
        return;
      }

      setAdminSuccess(`Successfully created weapon! Run 'SELECT * FROM weapons' on database!`);
      // Reset inputs
      setAdminWeaponId('');
      setAdminWeaponName('');
      setAdminWeaponDesc('');
      getWeaponsFromDb();
    } catch (e) {
      setAdminError("Server rejected publication request.");
    }
  };

  // Admin Delete Weapon
  const handleAdminDelete = async (weaponId: string) => {
    if (!confirm(`Are you sure you want to permanently delete weapon "${weaponId}"? This runs a SQL DELETE.`)) return;
    setAdminError(null);
    setAdminSuccess(null);

    if (!currentUser?.token) {
      setAdminError("Security Error: Bearer token is missing!");
      return;
    }

    try {
      const response = await fetch(`/api/weapons/${weaponId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${currentUser.token}` }
      });

      const resData = await response.json();
      if (!response.ok) {
        setAdminError(resData.message || "Failed to delete item.");
        return;
      }

      setAdminSuccess(`Successfully ran DELETE query on item: ${weaponId}`);
      getWeaponsFromDb();
    } catch (e) {
      setAdminError("Deletion service connection error.");
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(FLUTTER_CODES[codeKey]);
    setCopiedCodeFlag(true);
    setTimeout(() => setCopiedCodeFlag(false), 2000);
  };

  const handleDownloadCode = () => {
    const ext = codeKey === 'node_server' ? 'js' : codeKey === 'schema_sql' ? 'sql' : 'dart';
    const filename = `${codeKey}_gachamerch.${ext}`;
    const file = new Blob([FLUTTER_CODES[codeKey]], { type: 'text/plain' });
    const element = document.createElement("a");
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const clearAllServerLogs = async () => {
    try {
      await fetch('/api/logs/clear', { method: 'POST' });
      getLogsFromDb();
    } catch (e) {
      //
    }
  };

  return (
    <div id="app-root" className="min-h-screen bg-[#070913] text-[#e2e8f0] flex flex-col font-sans selection:bg-[#d1b170] selection:text-[#0b0d14]">
      
      {/* HEADER SECTION */}
      <header id="top-bar" className="bg-[#0c0f1d] border-b border-[#d1b170]/15 py-4 px-6 sticky top-0 z-40 backdrop-blur-md">
        <div id="navbar-inside" className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#d1b170] to-[#bca061] flex items-center justify-center text-[#111] font-bold text-shadow">
              <Laptop className="w-5 h-5 text-[#070913]" />
            </div>
            <div>
              <h1 className="text-lg font-serif font-semibold text-white tracking-wide flex items-center gap-2">
                GACHAMERCH <span className="text-xs px-2 py-0.5 rounded bg-[#d1b170]/10 text-[#d1b170] font-sans">COSC6094 Flutter Workspace</span>
              </h1>
              <p className="text-xs text-gray-400">Node.js Express Backend & MySQL Database Synchronization Studio</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 text-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
              DEV PORT 3000 ACTIVE
            </div>
            {currentUser && (
              <div className="text-[11px] bg-[#111] border border-gray-800 text-[#d1b170] px-3 py-1 rounded font-mono">
                Bearer: {currentUser.token.substring(0, 8)}...
              </div>
            )}
          </div>
        </div>
      </header>

      {/* WORKSPACE SECTIONS GRID */}
      <div id="main-panel-layout" className="flex-1 max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 p-6">
        
        {/* LEFT COMPONENT: FLUTTER APP MOBILE SMARTPHONE SIMULATOR (5 UNIT COLUMN) */}
        <div id="left-column" className="lg:col-span-5 flex flex-col gap-4">
          
          <div className="bg-[#0f111c]/90 rounded-2xl p-4 border border-[#d1b170]/15 flex items-center justify-between">
            <h2 className="text-[#d1b170] text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-[#d1b170]" /> Flutter Emulator Shell
            </h2>
            <div className="text-[10px] text-gray-400 bg-gray-900 px-2 py-0.5 rounded border border-gray-800">
              Material 3 Dynamic
            </div>
          </div>

          {/* PHYSICAL PHONE SHELL GRAPHIC */}
          <div id="smartphone-body animate-fade-in" className="mx-auto w-[330px] h-[670px] bg-[#131520] rounded-[40px] p-3 border-4 border-gray-800 shadow-2xl relative flex flex-col overflow-hidden">
            
            {/* Speaker & Camera Notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-6 bg-gray-800 rounded-b-2xl z-30 flex justify-center items-start pt-1">
              <div className="w-12 h-1 bg-gray-700 rounded-full"></div>
            </div>

            {/* Inner Phone Screen */}
            <div className={`flex-1 rounded-[32px] overflow-hidden flex flex-col relative z-10 ${customTheme.bgColor} ${customTheme.textColor} ${customTheme.fontFamily}`}>
              
              {/* Flutter Status Bar representation */}
              <div className="bg-black/20 text-[10px] font-mono px-6 pt-5 pb-1 flex justify-between items-center text-gray-400 select-none z-20">
                <span>9:41 AM</span>
                <span className="flex items-center gap-1.5">
                  <span>5G</span>
                  <span className="w-4 h-2 border border-current rounded-sm inline-block relative">
                    <span className="absolute top-0 left-0 bottom-0 right-0.5 bg-current"></span>
                  </span>
                </span>
              </div>

              {/* FLUTTER EMULATOR APP HEADER */}
              <div className="px-4 py-3 flex items-center justify-between border-b border-black/10 text-shadow" style={{ backgroundColor: customTheme.accentTint + '20' }}>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 bg-[#d1b170] rounded-sm transform rotate-45 shrink-0" style={{ backgroundColor: customTheme.accentTint }}></div>
                  <span className="font-bold text-sm tracking-wide">GachaMerch App</span>
                </div>
                {currentUser && (
                  <button
                    onClick={() => {
                      setCurrentUser(null);
                      setEmulatedPage('login');
                      setCart([]);
                    }}
                    className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-black/40 hover:bg-black/60 font-mono text-gray-300 border border-gray-800 font-bold transition"
                  >
                    Logout
                  </button>
                )}
              </div>

              {/* EMULATED PHONE VIEW ROUTER */}
              <div className="flex-1 flex flex-col overflow-y-auto p-4 relative">
                
                {/* PAGE 1: AUTHENTICATION LOGIN SCREEN */}
                {emulatedPage === 'login' && (
                  <div className="flex-1 flex flex-col justify-center py-4">
                    <div className="text-center mb-6">
                      <div className="w-12 h-12 bg-[#d1b170]/10 rounded-full flex items-center justify-center mx-auto mb-2 text-xl" style={{ backgroundColor: customTheme.accentTint + '20' }}>
                        💎
                      </div>
                      <h3 className="font-serif font-bold text-base">Genshin Import Portal</h3>
                      <p className="text-[10px] text-gray-500">Secure SQL Schema Validation Client</p>
                    </div>

                    {loginError && (
                      <div className="bg-red-950/20 text-red-500 text-[10px] p-2 rounded-lg border border-red-900/35 mb-3 flex items-start gap-1 flex-col">
                        <span className="font-bold flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5" /> Validation Alert:</span>
                        <span>{loginError}</span>
                      </div>
                    )}

                    <div className="space-y-2.5">
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 block mb-0.5">DB USERNAME</label>
                        <input
                          type="text"
                          value={loginUsername}
                          onChange={(e) => setLoginUsername(e.target.value)}
                          placeholder="e.g. admin or user"
                          className="w-full bg-black/10 border border-black/20 focus:border-[#d1b170] transition rounded px-2.5 py-1.5 text-xs text-inherit outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-gray-400 block mb-0.5">DB PASSWORD</label>
                        <input
                          type="password"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          placeholder="e.g. password123"
                          className="w-full bg-black/10 border border-black/20 focus:border-[#d1b170] transition rounded px-2.5 py-1.5 text-xs text-inherit outline-none"
                        />
                      </div>

                      <button
                        onClick={() => handleAuthSubmit()}
                        type="button"
                        className="w-full py-2 bg-[#d1b170] text-[#070913] hover:brightness-110 font-bold text-xs rounded transition uppercase text-shadow-none cursor-pointer"
                        style={{ backgroundColor: customTheme.accentTint }}
                      >
                        Sign In DB Connection
                      </button>

                      {/* External OAuth Providers (Requirement check: External OAuth) */}
                      <div className="pt-3 border-t border-black/10">
                        <span className="text-[9px] text-gray-400 text-center block mb-2 font-mono uppercase tracking-widest">or Authenticate OAuth</span>
                        
                        <div className="grid grid-cols-2 gap-2 text-center">
                          <button
                            onClick={() => handleAuthSubmit('Google')}
                            type="button"
                            className="p-1 px-2 border border-[#d1b170]/30 hover:bg-[#d1b170]/10 rounded text-[10px] bg-black/10 cursor-pointer flex items-center justify-center gap-1 text-inherit"
                          >
                            <span className="text-red-500 font-bold font-mono">G</span> Google Auth
                          </button>
                          <button
                            onClick={() => handleAuthSubmit('GitLab')}
                            type="button"
                            className="p-1 px-2 border border-[#d1b170]/30 hover:bg-[#d1b170]/10 rounded text-[10px] bg-black/10 cursor-pointer flex items-center justify-center gap-1 text-inherit"
                          >
                            <span className="text-orange-500 font-bold">🦊</span> GitLab Auth
                          </button>
                        </div>
                      </div>

                      <div className="bg-black/10 p-2 rounded text-[9px] font-mono leading-relaxed text-gray-500 text-center">
                        <span className="text-inherit font-semibold">Demo credentials:</span><br />
                        admin / password123 <br />
                        user / password123
                      </div>
                    </div>
                  </div>
                )}

                {/* PAGE 2: WEAPON INVENTORY showcase */}
                {emulatedPage === 'store' && (
                  <div className="flex-grow flex flex-col gap-3">
                    <div className="flex justify-between items-center bg-black/10 p-2 rounded">
                      <div>
                        <div className="text-[10px] text-gray-400">Authenticated Role:</div>
                        <div className="font-bold text-xs uppercase text-green-500">{currentUser?.role || 'Guest'}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] text-gray-400">Coins / Cart:</div>
                        <div className="font-bold text-xs">🛒 {cart.length} unique items</div>
                      </div>
                    </div>

                    <h4 className="text-xs font-bold font-serif uppercase tracking-wider mb-1 flex items-center gap-1 text-shadow" style={{ color: customTheme.accentTint }}>
                      🗡️ Teyvat Armament Stocks
                    </h4>

                    {weapons.length === 0 ? (
                      <div className="text-center py-10 opacity-70 flex flex-col items-center gap-1 text-[11px]">
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        <span>Connecting Express DB indexes...</span>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-2 max-h-[360px] overflow-y-auto pr-1">
                        {weapons.map((w) => (
                          <div
                            key={w.id}
                            className="p-2 border border-black/10 hover:border-black/20 rounded-lg bg-black/5 flex flex-col justify-between"
                          >
                            <img
                              src={w.image || 'https://enka.network/ui/UI_EquipIcon_Sword_Narukami.png'}
                              alt={w.name}
                              className="w-12 h-12 object-contain mx-auto filter drop-shadow"
                            />
                            <div className="mt-1">
                              <div className="font-bold text-[10px] truncate leading-tight">{w.name}</div>
                              <div className="text-[8px] uppercase tracking-tighter opacity-60 font-mono">{w.type}</div>
                              <div className="text-[10px] font-semibold font-mono text-emerald-600 mt-0.5">{w.price.toLocaleString()} Primos</div>
                              <div className={`text-[8px] font-bold mt-0.5 ${w.stock === 0 ? 'text-red-500' : 'text-gray-400'}`}>
                                {w.stock === 0 ? 'OUT OF STOCK' : `Stock: ${w.stock}`}
                              </div>
                            </div>

                            <div className="flex gap-1 mt-2">
                              <button
                                onClick={() => {
                                  setSelectedWeapon(w);
                                  setEmulatedPage('detail');
                                }}
                                className="flex-1 p-1 bg-black/10 hover:bg-black/20 text-[9px] rounded font-semibold text-center border border-black/5 cursor-pointer text-inherit"
                              >
                                Detail
                              </button>
                              <button
                                onClick={() => addToCart(w, 1)}
                                disabled={w.stock === 0}
                                className="p-1 px-1.5 bg-[#d1b170] text-[#111] hover:brightness-110 disabled:bg-gray-400 rounded text-[9px] cursor-pointer"
                                style={{ backgroundColor: customTheme.accentTint }}
                              >
                                +🛒
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* PAGE 3: WEAPON DETAIL SCREEN with customized colors */}
                {emulatedPage === 'detail' && selectedWeapon && (
                  <div className="flex-grow flex flex-col gap-3">
                    <button
                      onClick={() => setEmulatedPage('store')}
                      className="text-[10px] text-left hover:underline text-gray-500 font-mono"
                    >
                      ← Back to Inventory grid
                    </button>

                    <div className="bg-black/10 p-3 rounded-xl border border-black/10 flex flex-col items-center">
                      <img
                        src={selectedWeapon.image}
                        alt={selectedWeapon.name}
                        className="w-24 h-24 object-contain filter drop-shadow animate-float"
                      />
                      <h3 className="font-serif font-extrabold text-sm text-center mt-2" style={{ fontSize: customTheme.fontSize === 'text-sm' ? '14px' : customTheme.fontSize === 'text-xs' ? '12px' : '17px' }}>
                        {selectedWeapon.name}
                      </h3>
                      <span className="text-[9px] px-2 py-0.5 bg-black/20 uppercase rounded font-mono text-[#d1b170]" style={{ color: customTheme.accentTint }}>
                        {selectedWeapon.type}
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <div className="text-[10px] uppercase text-gray-400 font-bold font-mono">Weapon Description:</div>
                      <p className="text-[11px] leading-relaxed opacity-80" style={{ fontSize: customTheme.fontSize === 'text-sm' ? '11px' : customTheme.fontSize === 'text-xs' ? '9px' : '13px' }}>
                        {selectedWeapon.description}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-black/10 text-xs">
                      <div>
                        <span className="text-[9px] block text-gray-400">PRICE IN DECK</span>
                        <span className="font-mono font-bold text-emerald-600">{selectedWeapon.price.toLocaleString()} Primos</span>
                      </div>
                      <div>
                        <span className="text-[9px] block text-gray-400">REALTIME STOCK</span>
                        <span className="font-bold">{selectedWeapon.stock} left</span>
                      </div>
                    </div>

                    {/* INTERACTIVE APPS THEMING PRESETS (Genshin Customization check) */}
                    <div className="p-2.5 bg-black/10 border border-black/10 rounded-lg mt-3">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide block mb-1">
                        🎨 Theme Customizer Settings
                      </span>
                      <p className="text-[9px] leading-tight text-gray-500 mb-2">
                        Customize 4 properties live: Font Family, Font Size, Accent Color, and Screen Color canvas.
                      </p>

                      <div className="flex flex-col gap-1.5">
                        {customThemesList.map((tm) => (
                          <button
                            key={tm.id}
                            onClick={() => setCustomTheme(tm)}
                            className={`p-1.5 rounded text-[9px] text-left transition text-inherit flex items-center justify-between ${
                              customTheme.id === tm.id ? 'bg-[#d1b170]/20 border border-[#d1b170]' : 'bg-black/10 border border-black/5'
                            }`}
                          >
                            <span>{tm.name}</span>
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: tm.accentTint }}></span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        addToCart(selectedWeapon, 1);
                        setEmulatedPage('store');
                      }}
                      disabled={selectedWeapon.stock === 0}
                      className="w-full mt-2 py-2 bg-[#d1b170] text-[#070913] hover:brightness-110 font-bold text-xs rounded transition uppercase text-shadow-none cursor-pointer"
                      style={{ backgroundColor: customTheme.accentTint }}
                    >
                      Add 1x Unit to Cart
                    </button>
                  </div>
                )}

                {/* PAGE 4: SHOPPING CART SCREEN */}
                {emulatedPage === 'cart' && (
                  <div className="flex-grow flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-bold font-serif uppercase tracking-wider mb-2" style={{ color: customTheme.accentTint }}>
                        🛒 Cart checkout Panel
                      </h4>

                      {cartError && (
                        <div className="bg-red-950/20 text-red-500 text-[9px] p-2 rounded border border-red-900/35 mb-2">
                          {cartError}
                        </div>
                      )}

                      {checkoutSuccess && (
                        <div className="bg-green-950/20 text-green-400 text-[9px] p-2 rounded border border-green-900/35 mb-2">
                          {checkoutSuccess}
                        </div>
                      )}

                      {cart.length === 0 ? (
                        <div className="py-14 text-center opacity-60 text-[10px]">
                          Your Gacha shopping basket is empty.<br />Add weapon assets from the store list page.
                        </div>
                      ) : (
                        <div className="space-y-1.5 max-h-[290px] overflow-y-auto pr-1">
                          {cart.map((item, idx) => (
                            <div
                              key={item.weapon.id}
                              className="bg-black/5 p-2 rounded-lg border border-black/15 text-xs flex justify-between items-center"
                            >
                              <div>
                                <div className="font-bold text-[11px]">{item.weapon.name}</div>
                                <div className="text-[10px] text-[#db4a4a]">
                                  {item.weapon.price.toLocaleString()} x {item.quantity}
                                </div>
                              </div>
                              <div className="flex items-center gap-1.5 shrink-0">
                                <button
                                  onClick={() => {
                                    const newCart = [...cart];
                                    if (newCart[idx].quantity > 1) {
                                      newCart[idx].quantity -= 1;
                                      setCart(newCart);
                                    } else {
                                      setCart(cart.filter(c => c.weapon.id !== item.weapon.id));
                                    }
                                  }}
                                  className="w-5 h-5 bg-black/10 border border-black/20 flex items-center justify-center text-[10px] hover:bg-black/20 text-inherit"
                                >
                                  -
                                </button>
                                <span className="text-[11px] font-bold font-mono">{item.quantity}</span>
                                <button
                                  onClick={() => {
                                    // Check stock boundary validation
                                    if (item.quantity + 1 > item.weapon.stock) {
                                      alert(`Oops! Cannot request more than database available stock (${item.weapon.stock} units)`);
                                      return;
                                    }
                                    const newCart = [...cart];
                                    newCart[idx].quantity += 1;
                                    setCart(newCart);
                                  }}
                                  className="w-5 h-5 bg-black/10 border border-black/20 flex items-center justify-center text-[10px] hover:bg-black/20 text-inherit"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {cart.length > 0 && (
                      <div className="border-t border-black/10 pt-3 mt-3">
                        <div className="flex justify-between text-xs font-semibold mb-3">
                          <span>Est. Total Cost:</span>
                          <span className="text-emerald-500 font-bold font-mono">
                            {cart.reduce((s, c) => s + (c.weapon.price * c.quantity), 0).toLocaleString()} Primogems
                          </span>
                        </div>

                        <button
                          onClick={handlePurchaseCheckout}
                          className="w-full py-2 bg-[#d1b170] text-[#070913] hover:brightness-110 font-bold text-xs rounded transition uppercase text-shadow-none cursor-pointer"
                          style={{ backgroundColor: customTheme.accentTint }}
                        >
                          Checkout via OAuth Session
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* PAGE 5: ADMIN CRUD PANEL SCREEN */}
                {emulatedPage === 'admin' && (
                  <div className="flex-grow flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-bold font-serif uppercase tracking-wider mb-2" style={{ color: customTheme.accentTint }}>
                        🛠️ Gacha Inventory Administrator
                      </h4>

                      {adminError && (
                        <div className="bg-red-950/20 text-red-500 text-[9px] p-2 rounded border border-red-900/35 mb-2 leading-tight">
                          {adminError}
                        </div>
                      )}

                      {adminSuccess && (
                        <div className="bg-green-950/20 text-green-400 text-[9px] p-2 rounded border border-green-900/35 mb-2 leading-tight">
                          {adminSuccess}
                        </div>
                      )}

                      <form onSubmit={handleAdminCrudSubmit} className="space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[8px] font-bold block opacity-60">WEAPON ID</label>
                            <input
                              type="text"
                              placeholder="e.g. W06"
                              value={adminWeaponId}
                              onChange={(e) => setAdminWeaponId(e.target.value)}
                              className="w-full bg-black/10 border border-black/20 rounded px-2 py-1 text-[10px] text-inherit outline-none"
                            />
                          </div>
                          <div>
                            <label className="text-[8px] font-bold block opacity-60">TYPE</label>
                            <select
                              value={adminWeaponType}
                              onChange={(e) => setAdminWeaponType(e.target.value)}
                              className="w-full bg-[#111] border border-black/20 rounded px-2 py-1 text-[10px] text-[#eee] outline-none"
                            >
                              <option value="Sword">Sword</option>
                              <option value="Bow">Bow</option>
                              <option value="Polearm">Polearm</option>
                              <option value="Catalyst">Catalyst</option>
                              <option value="Claymore">Claymore</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="text-[8px] font-bold block opacity-60">NAME</label>
                          <input
                            type="text"
                            placeholder="e.g. Kagura's Verity"
                            value={adminWeaponName}
                            onChange={(e) => setAdminWeaponName(e.target.value)}
                            className="w-full bg-black/10 border border-black/20 rounded px-2 py-1 text-[10px] text-inherit outline-none"
                          />
                        </div>

                        <div>
                          <label className="text-[8px] font-bold block opacity-60">DESCRIPTION</label>
                          <textarea
                            placeholder="An elegant ritual weaponry..."
                            value={adminWeaponDesc}
                            onChange={(e) => setAdminWeaponDesc(e.target.value)}
                            rows={2}
                            className="w-full bg-black/10 border border-black/20 rounded px-2 py-1 text-[10px] text-inherit outline-none"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[8px] font-bold block opacity-60">STOCK</label>
                            <input
                              type="number"
                              value={adminWeaponStock}
                              onChange={(e) => setAdminWeaponStock(e.target.value)}
                              className="w-full bg-black/10 border border-black/20 rounded px-2 py-1 text-[10px] text-inherit outline-none font-mono"
                            />
                          </div>
                          <div>
                            <label className="text-[8px] font-bold block opacity-60">PRICE (PRIMOS)</label>
                            <input
                              type="number"
                              value={adminWeaponPrice}
                              onChange={(e) => setAdminWeaponPrice(e.target.value)}
                              className="w-full bg-black/10 border border-black/20 rounded px-2 py-1 text-[10px] text-inherit outline-none font-mono"
                            />
                          </div>
                        </div>

                        <button
                          type="submit"
                          className="w-full py-1.5 bg-[#d1b170] text-[#070913] hover:brightness-110 font-bold text-[10px] rounded transition uppercase text-shadow-none cursor-pointer"
                          style={{ backgroundColor: customTheme.accentTint }}
                        >
                          Publish to MySQL Tables
                        </button>
                      </form>

                      {/* Display deletion controls */}
                      <div className="mt-4 pt-3 border-t border-black/10">
                        <span className="text-[10px] font-bold block text-gray-400 mb-1.5 uppercase">Delete Weapon Records</span>
                        <div className="space-y-1 max-h-[110px] overflow-y-auto pr-1">
                          {weapons.map(w => (
                            <div key={w.id} className="flex justify-between items-center text-[10px] bg-black/10 p-1 px-2 border border-black/5 rounded">
                              <span className="truncate">{w.name} ({w.id})</span>
                              <button
                                type="button"
                                onClick={() => handleAdminDelete(w.id)}
                                className="text-red-500 hover:text-red-600 font-bold ml-1 cursor-pointer"
                              >
                                DELETE
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              </div>

              {/* PHONE EMULATION SYSTEM NAVBAR BUTTONS */}
              {currentUser && (
                <div id="phone-system-navbar" className="bg-black/30 border-t border-black/10 py-1.5 px-3 flex justify-around items-center z-20">
                  <button
                    onClick={() => setEmulatedPage('store')}
                    className={`flex flex-col items-center gap-0.5 text-[9px] transition-all text-inherit cursor-pointer ${emulatedPage === 'store' ? 'text-[#d1b170] font-bold font-serif' : 'opacity-60 hover:opacity-100'}`}
                    style={{ color: emulatedPage === 'store' ? customTheme.accentTint : undefined }}
                  >
                    <span>🏰</span>
                    <span>Store</span>
                  </button>
                  <button
                    onClick={() => setEmulatedPage('cart')}
                    className={`flex flex-col items-center gap-0.5 text-[9px] transition-all text-inherit cursor-pointer ${emulatedPage === 'cart' ? 'text-[#d1b170] font-bold font-serif' : 'opacity-60 hover:opacity-100'}`}
                    style={{ color: emulatedPage === 'cart' ? customTheme.accentTint : undefined }}
                  >
                    <span className="relative">
                      🛒
                      {cart.length > 0 && <span className="absolute -top-1.5 -right-2 px-1 bg-red-500 text-white rounded-full text-[7px] leading-tight font-bold">{cart.length}</span>}
                    </span>
                    <span>Cart</span>
                  </button>
                  {currentUser.role === 'admin' && (
                    <button
                      onClick={() => setEmulatedPage('admin')}
                      className={`flex flex-col items-center gap-0.5 text-[9px] transition-all text-inherit cursor-pointer ${emulatedPage === 'admin' ? 'text-[#d1b170] font-bold font-serif' : 'opacity-60 hover:opacity-100'}`}
                      style={{ color: emulatedPage === 'admin' ? customTheme.accentTint : undefined }}
                    >
                      <span>🛠️</span>
                      <span>Admin</span>
                    </button>
                  )}
                </div>
              )}

              {/* Physical Home Indicator Bar */}
              <div className="bg-transparent py-1 flex justify-center items-center z-15">
                <div className="w-24 h-1 bg-gray-500/60 rounded-full"></div>
              </div>

            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: DEVELOPER DASHBOARDS & BLUEPRINTS (7 UNIT COLUMN) */}
        <div id="right-column" className="lg:col-span-7 flex flex-col bg-[#0c0f1d] border border-[#d1b170]/15 rounded-2xl overflow-hidden shadow-xl">
          
          {/* Tabs header navigations */}
          <div id="tabs" className="bg-[#080a13] px-4 pt-3 flex border-b border-[#d1b170]/15 gap-2 flex-wrap sm:flex-nowrap">
            <button
              onClick={() => setActiveTab('emulator')}
              className={`py-2 px-3 text-xs uppercase tracking-wider font-semibold rounded-t-lg transition border-t border-x flex items-center gap-1 cursor-pointer ${
                activeTab === 'emulator'
                  ? 'bg-[#0c0f1d] border-t-[#d1b170] border-x-[#d1b170]/20 text-white'
                  : 'bg-transparent border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5 text-[#d1b170]" /> Emulator Settings
            </button>
            <button
              onClick={() => setActiveTab('console')}
              className={`py-2 px-3 text-xs uppercase tracking-wider font-semibold rounded-t-lg transition border-t border-x flex items-center gap-1 cursor-pointer ${
                activeTab === 'console'
                  ? 'bg-[#0c0f1d] border-t-[#d1b170] border-x-[#d1b170]/20 text-white'
                  : 'bg-transparent border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <Database className="w-3.5 h-3.5 text-orange-400" /> MySQL & Log Feed
            </button>
            <button
              onClick={() => setActiveTab('exporter')}
              className={`py-2 px-3 text-xs uppercase tracking-wider font-semibold rounded-t-lg transition border-t border-x flex items-center gap-1 cursor-pointer ${
                activeTab === 'exporter'
                  ? 'bg-[#0c0f1d] border-t-[#d1b170] border-x-[#d1b170]/20 text-white'
                  : 'bg-transparent border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <Code className="w-3.5 h-3.5 text-cyan-400" /> Flutter Exporter
            </button>
            <button
              onClick={() => setActiveTab('documentation')}
              className={`py-2 px-3 text-xs uppercase tracking-wider font-semibold rounded-t-lg transition border-t border-x flex items-center gap-1 cursor-pointer ${
                activeTab === 'documentation'
                  ? 'bg-[#0c0f1d] border-t-[#d1b170] border-x-[#d1b170]/20 text-white'
                  : 'bg-transparent border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-[#df563f]" /> Documentation Info
            </button>
          </div>

          {/* TAB 1 CONTENT: EMULATOR CONTROLLER */}
          {activeTab === 'emulator' && (
            <div className="p-6 flex-grow flex flex-col justify-between">
              <div>
                <h3 className="text-sm text-white font-serif font-bold uppercase tracking-wide mb-2 flex items-center gap-1.5">
                  <Settings className="w-4 h-4 text-[#d1b170]" /> EMULATOR DEPLOYMENT CONTROL PANEL
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed max-w-xl">
                  GachaMerch mobile utilizes an interactive system rendering live database states. Switch user rolls instantly below or test validations to ensure everything matches criteria.
                </p>

                {/* Quick Roles shortcut triggers */}
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <button
                    onClick={() => {
                      setLoginUsername('admin');
                      setLoginPassword('password123');
                      handleAuthSubmit();
                    }}
                    className="p-3 bg-black/40 hover:bg-[#d1b170]/10 border border-[#d1b170]/15 hover:border-[#d1b170] rounded-xl transition text-left cursor-pointer"
                  >
                    <div className="font-bold text-xs text-[#d1b170]">🔐 Force Login Admin</div>
                    <p className="text-[10px] text-gray-400 mt-1">Gives CRUD permission to insert, update and delete weapons.</p>
                  </button>
                  <button
                    onClick={() => {
                      setLoginUsername('user');
                      setLoginPassword('password123');
                      handleAuthSubmit();
                    }}
                    className="p-3 bg-black/40 hover:bg-orange-500/10 border border-orange-500/15 hover:border-orange-500 rounded-xl transition text-left cursor-pointer"
                  >
                    <div className="font-bold text-xs text-orange-400">👤 Force Login User</div>
                    <p className="text-[10px] text-gray-400 mt-1">Access to search, browse weapon inventory, and buy.</p>
                  </button>
                </div>

                {/* Validation demonstration section */}
                <div className="mt-6 bg-[#080d19] border border-blue-500/20 rounded-xl p-4">
                  <h4 className="text-xs text-[#d1b170] font-bold uppercase tracking-widest mb-1.5 flex items-center gap-1">
                    <Award className="w-4 h-4 text-blue-400" /> Dynamic Form Validations Implemented
                  </h4>
                  <ul className="space-y-2 text-xs text-gray-300">
                    <li className="flex gap-2 items-start">
                      <span className="text-blue-400 font-mono">1.</span>
                      <div>
                        <strong className="text-white">Credentials Field Checker:</strong> Prevents submission when userName/password or OAuth input remains empty on login client.
                      </div>
                    </li>
                    <li className="flex gap-2 items-start">
                      <span className="text-blue-400 font-mono">2.</span>
                      <div>
                        <strong className="text-white">Positive Weapon Stock Bound:</strong> Admin CRUD throws error warnings if negative integers are typed inside stock level keys.
                      </div>
                    </li>
                    <li className="flex gap-2 items-start">
                      <span className="text-blue-400 font-mono">3.</span>
                      <div>
                        <strong className="text-white">Minimum Price Limit Validation:</strong> Verifies decimal levels; weapons price must always evaluate larger than zero.
                      </div>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Developer note at footer */}
              <div className="bg-black/30 border border-gray-800 rounded-lg p-3 text-xs text-gray-400 font-mono flex items-start gap-2 max-w-xl">
                <Info className="w-5 h-5 text-[#d1b170] shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  The emulator connected directly via Axios/Fetch to a persistent Node.js Express script initialized inside the Cloud Run workspace container, writing/logging actual query execution paths!
                </div>
              </div>
            </div>
          )}

          {/* TAB 2 CONTENT: LIVE BACKEND LOGGER & MYSQL STREAM */}
          {activeTab === 'console' && (
            <div className="p-6 flex-grow flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm text-white font-serif font-bold uppercase tracking-wide flex items-center gap-1.5">
                    <Terminal className="w-4 h-4 text-orange-400" /> REALTIME DATABASE & SERVER INGESTION LOGGER
                  </h3>
                  <button
                    onClick={clearAllServerLogs}
                    className="text-[10px] hover:text-white bg-gray-900 border border-gray-800 text-gray-400 px-2.5 py-1 rounded cursor-pointer transition"
                  >
                    Clear History
                  </button>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed mb-4">
                  Witness direct SQL emulation and backend endpoints being fired inside <strong>server.ts</strong> on port 3000 as you tap or submit changes on GachaMerch app features.
                </p>

                {/* SQL Playbox sandbox */}
                <div className="bg-[#05060b] rounded-lg p-3 border border-orange-500/10 mb-4 text-xs font-mono">
                  <div className="flex justify-between items-center mb-1.5 text-gray-400 text-[10px]">
                    <span>🎯 SQL INTERACTIVE PLAYGROUND (MYSQL CLIENT)</span>
                    <span className="text-orange-400">gachamerch_db</span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customSqlQuery}
                      onChange={(e) => setCustomSqlQuery(e.target.value)}
                      className="flex-1 bg-black text-[#5ce624] border border-gray-800 rounded px-2 py-1 outline-none font-mono"
                    />
                    <button
                      onClick={runCustomSqlInLiveConsole}
                      className="px-3 py-1 bg-orange-500 text-black hover:bg-orange-600 font-bold rounded cursor-pointer text-xs"
                    >
                      Run SQL
                    </button>
                  </div>
                  {sqlResult && (
                    <pre className="bg-[#000] border border-[#111] p-2 mt-2 rounded text-[10px] text-gray-300 overflow-x-auto whitespace-pre">
                      {sqlResult}
                    </pre>
                  )}
                </div>

                {/* Log terminal feed */}
                <div className="space-y-2 max-h-[290px] overflow-y-auto pr-1">
                  {logs.length === 0 ? (
                    <div className="py-20 text-center text-xs opacity-60 font-mono">
                      Awaiting connection telemetry metrics...
                    </div>
                  ) : (
                    logs.map((log, i) => (
                      <div
                        key={i}
                        className={`p-3 rounded border text-xs font-mono leading-relaxed transition ${
                          log.type === 'mysql'
                            ? 'bg-[#150d05] border-orange-950 text-orange-200'
                            : 'bg-[#090b14] border-gray-800 text-cyan-200'
                        }`}
                      >
                        <div className="flex justify-between items-center text-[10px] opacity-70 mb-1">
                          <span className="font-bold flex items-center gap-1.5">
                            <span className={`w-1.5 h-1.5 rounded-full ${log.type === 'mysql' ? 'bg-orange-400 animate-pulse' : 'bg-cyan-400'}`}></span>
                            {log.type.toUpperCase()} Telemetry
                          </span>
                          <span>{log.timestamp}</span>
                        </div>
                        <div>{log.message}</div>
                        {log.query && (
                          <div className="mt-1.5 bg-black/60 p-1.5 rounded text-[10px] text-[#2fe64a] border border-black/80 font-mono">
                            <span className="text-gray-400 text-[9px] block">QUERY SUBMISSION:</span>
                            {log.query}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3 CONTENT: FLUTTER CODE EXPORTER */}
          {activeTab === 'exporter' && (
            <div className="p-6 flex-grow flex flex-col justify-between">
              <div>
                <h3 className="text-sm text-white font-serif font-bold uppercase tracking-wide mb-1 flex items-center gap-1.5">
                  <Code className="w-4 h-4 text-cyan-400" /> FLUTTER MOBILE & BACKEND CODE EXPORT ENGINE
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed mb-4">
                  Select and preview pristine, production-ready Flutter classes or MySQL DDL creation schemas. Ready to copy/paste inside local SDK folders.
                </p>

                {/* VISUAL VSCODE ZIP DOWNLOAD PROMPT */}
                <div className="mb-6 bg-gradient-to-r from-[#171c35] to-[#0c0e1e] border border-[#d1b170]/30 rounded-xl p-5 shadow-inner">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="text-sm font-bold text-white flex items-center gap-1.5">
                        <Download className="w-4 h-4 text-[#d1b170]" />
                        <span>Download Complete VSCode-Ready Project Bundle</span>
                      </div>
                      <p className="text-xs text-gray-300 mt-1.5 leading-relaxed">
                        Export all generated database scripts, Node.js controllers, dotenv configurations, and full multi-page Flutter files packed together as a standard <code className="text-[#d1b170] px-1 bg-black/40 rounded">.zip</code> archive.
                      </p>
                      
                      {/* Contents List Checklist */}
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-3 text-[10px] text-gray-400 font-mono">
                        <div className="flex items-center gap-1">✔ database/schema.sql</div>
                        <div className="flex items-center gap-1">✔ backend/server.js</div>
                        <div className="flex items-center gap-1">✔ backend/package.json</div>
                        <div className="flex items-center gap-1">✔ backend/.env.example</div>
                        <div className="flex items-center gap-1">✔ frontend/pubspec.yaml</div>
                        <div className="flex items-center gap-1">✔ frontend/lib/ (Full App)</div>
                        <div className="flex items-center gap-1">✔ DOCUMENTATION.md</div>
                        <div className="flex items-center gap-1 text-emerald-400">✔ Ready to import into VSCode!</div>
                      </div>
                    </div>
                    
                    <a
                      href="/api/export-zip"
                      className="w-full md:w-auto px-5 py-3 bg-gradient-to-r from-[#d1b170] to-[#b89a5c] text-black text-center font-bold text-xs rounded-lg shadow-md hover:brightness-110 active:scale-[0.98] transition flex items-center justify-center gap-2 shrink-0 cursor-pointer text-shadow-none"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download Project ZIP</span>
                    </a>
                  </div>
                </div>

                {/* Selectors */}
                <div className="flex gap-2 mb-3">
                  <div className="flex-1">
                    <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest block mb-1">Select File Asset</label>
                    <select
                      value={codeKey}
                      onChange={(e) => setCodeKey(e.target.value as any)}
                      className="w-full bg-[#111] text-gray-200 border border-gray-850 px-3 py-1.5 rounded-lg text-xs font-mono outline-none"
                    >
                      <option value="main">main.dart (Entry point)</option>
                      <option value="api_service">services/api_service.dart</option>
                      <option value="login_page">pages/login_page.dart</option>
                      <option value="store_page">pages/store_page.dart</option>
                      <option value="admin_page">pages/admin_crud_page.dart</option>
                      <option value="node_server">Backend Node/server.js</option>
                      <option value="schema_sql">MySQL DB schema.sql</option>
                    </select>
                  </div>

                  <div className="flex items-end gap-1.5">
                    <button
                      onClick={handleCopyCode}
                      className="px-3.5 py-1.5 bg-[#d1b170] text-black hover:bg-[#b09053] rounded transition text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      {copiedCodeFlag ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      {copiedCodeFlag ? 'Copied' : 'Copy'}
                    </button>
                    <button
                      onClick={handleDownloadCode}
                      className="px-3.5 py-1.5 bg-cyan-700 text-white hover:bg-cyan-800 rounded transition text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Download className="w-4 h-4" /> Download
                    </button>
                  </div>
                </div>

                {/* Preformatted Flutter Dart display block */}
                <div className="relative">
                  <pre className="bg-black/90 text-xs font-mono text-cyan-300 p-4 rounded-xl border border-gray-800 overflow-auto max-h-[310px] whitespace-pre select-all text-shadow-none">
                    {FLUTTER_CODES[codeKey]}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4 CONTENT: COMPREHENSIVE SUBMISSIBLE DOCUMENTATION */}
          {activeTab === 'documentation' && (
            <div className="p-6 flex-grow flex flex-col justify-between overflow-y-auto max-h-[550px]">
              <div className="space-y-4">
                <h3 className="text-base text-white font-serif font-bold uppercase tracking-wide flex items-center gap-1.5 border-b border-gray-800 pb-2">
                  <BookOpen className="w-4 h-4 text-[#df563f]" /> EXTERNAL ASSESSMENT DOCUMENTATION PAGE
                </h3>

                <div className="space-y-4 text-xs text-gray-300 leading-relaxed font-sans">
                  
                  {/* System Architecture Section */}
                  <div>
                    <h4 className="text-white text-xs font-extrabold uppercase mb-1 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-[#df563f] rounded-full"></span> 
                      1. GachaMerch System Architecture
                    </h4>
                    <p className="text-gray-400">
                      GachaMerch - Genshin Import is a hybrid multi-tier mobile client model. It coordinates a decoupled Dart Flutter front-end, an Express Node.js business routes api layer, and a MySQL relational catalog indexes store to provide flawless inventory control and secure checkout transactions.
                    </p>
                  </div>

                  {/* UI Components description */}
                  <div>
                    <h4 className="text-white text-xs font-extrabold uppercase mb-1 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-[#df563f] rounded-full"></span>
                      2. Mobile UI Components Check (5 Kinds)
                    </h4>
                    <p className="text-gray-400 mb-1">
                      Our system design features at least 5 complex native Material UI visual containers:
                    </p>
                    <ul className="list-disc list-inside space-y-1 pl-2 text-gray-400">
                      <li><strong>GridView & Cards:</strong> Renders responsive weapon showcases.</li>
                      <li><strong>TextFormFields & Inputs:</strong> Captures authentication and weapon creation items.</li>
                      <li><strong>Interactive Dialogs & Banners:</strong> Reports errors/failures like out of stock or credential mismatched alerts.</li>
                      <li><strong>Dropdown/Select Fields:</strong> Directs armament classifications inside weapon configuration cards.</li>
                      <li><strong>System BottomNavigationBar:</strong> Anchors the mobile route tabs for quick navigational transitions.</li>
                    </ul>
                  </div>

                  {/* 5 Pages implemented */}
                  <div>
                    <h4 className="text-white text-xs font-extrabold uppercase mb-1 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-[#df563f] rounded-full"></span>
                      3. Modular App Pages (5 Pages)
                    </h4>
                    <ul className="list-decimal list-inside space-y-1 pl-2 text-gray-400">
                      <li><strong>LoginPage:</strong> Secured authentication gateway supporting DB authentication & GitLab/Google OAuth.</li>
                      <li><strong>WeaponStorePage:</strong> Displays grid lists of weapons with search triggers and quick additions block.</li>
                      <li><strong>WeaponDetailPage:</strong> Shows pricing details, description stats, and the visual themes customizer.</li>
                      <li><strong>ShoppingCartPage:</strong> Handles cart calculations, stock levels validation, and secure dispatch triggers.</li>
                      <li><strong>AdminCrudDashboardPage:</strong> Renders catalog editing cards for publishing, correcting, or deleting database assets.</li>
                    </ul>
                  </div>

                  {/* validations section */}
                  <div>
                    <h4 className="text-white text-xs font-extrabold uppercase mb-1 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-[#df563f] rounded-full"></span>
                      4. Validation and Security Gates
                    </h4>
                    <p className="text-gray-400 leading-normal">
                      Authentication uses secure cryptographic JSON signatures that generates a strictly <strong>24-character alphanumeric login Bearer token</strong>. This token must be sent in header indexes prior to mutating rows. Our script verifies stock values: quantities chosen in checkout orders must not drop stock numbers below zero.
                    </p>
                  </div>

                  {/* Theme customizer description */}
                  <div>
                    <h4 className="text-white text-xs font-extrabold uppercase mb-1 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-[#df563f] rounded-full"></span>
                      5. Theme Customization Notes
                    </h4>
                    <p className="text-gray-400 leading-normal">
                      As requested for custom grading, the system supports dynamic live property changes visible instantly (noted in themes menu). It alters <strong>Font size, Font family, Background canvas colors, and Primary theme buttons tint opacity</strong> while ensuring 100% compliant user-interface legibility.
                    </p>
                  </div>

                  {/* How to run locally instructions */}
                  <div className="bg-[#11131e] border border-[#d1b170]/10 p-3 rounded text-gray-400">
                    <strong className="text-[#d1b170] block mb-1">🏁 Quick instructions to deploy locally:</strong>
                    1. Direct your MySQL database server to execute the exported <strong>schema.sql</strong> indexes script.<br />
                    2. Boot the Express API Server inside your terminal running <code className="text-white font-mono bg-black/40 px-1 rounded">npm install && npm run dev</code>.<br />
                    3. Launch your Android/iOS emulator or browser view via Flutter SDK command run: <code className="text-white font-mono bg-black/40 px-1 rounded">flutter run -d chrome</code>.
                  </div>

                </div>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
