import 'dart:convert';
import 'package:http/http.dart' as http;

class Weapon {
  final String id;
  final String name;
  final String type;
  final String description;
  final int stock;
  final String image;
  final double price;

  Weapon({
    required this.id,
    required this.name,
    required this.type,
    required this.description,
    required this.stock,
    required this.image,
    required this.price,
  });

  factory Weapon.fromJson(Map<String, dynamic> json) {
    return Weapon(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      type: json['type'] ?? '',
      description: json['description'] ?? '',
      stock: json['stock'] is int
          ? json['stock']
          : int.tryParse(json['stock'].toString()) ?? 0,
      image: json['image'] ?? '',
      price: json['price'] is num
          ? (json['price'] as num).toDouble()
          : double.tryParse(json['price'].toString()) ?? 0.0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'type': type,
      'description': description,
      'stock': stock,
      'image': image,
      'price': price,
    };
  }

  // Get the asset path normalized for Flutter asset loading
  String getAssetPath() {
    if (image.isEmpty) return '';
    // Remove './' prefix if present and normalize slashes
    String path =
        image.replaceFirst(RegExp(r'^\.\/'), '').replaceAll('\\', '/');

    // Ensure we return a path that starts with assets/
    if (!path.startsWith('assets/')) {
      path = 'assets/' + path;
    }

    // Do not auto-append variants; return the normalized path as stored in DB.
    return path;
  }
}

class UserSession {
  final String username;
  final String role;
  final String token;
  final String email;

  UserSession({
    required this.username,
    required this.role,
    required this.token,
    required this.email,
  });

  factory UserSession.fromJson(Map<String, dynamic> json) {
    return UserSession(
      username: json['username'] ?? '',
      role: json['role'] ?? 'user',
      token: json['token'] ?? '',
      email: json['email'] ?? '',
    );
  }
}

class ApiService {
  // Can points to localhost for local android/iOS emulator, or full URL
  static String baseUrl = "http://localhost:3000";
  static UserSession? currentSession;

  // Set Authorization headers using Bearer scheme
  static Map<String, String> getHeaders() {
    final headers = {
      'Content-Type': 'application/json',
    };
    if (currentSession != null) {
      headers['Authorization'] = 'Bearer ${currentSession!.token}';
    }
    return headers;
  }

  // 1. Authenticate user credentials
  static Future<UserSession> login(String username, String password) async {
    final response = await http.post(
      Uri.parse("$baseUrl/api/login"),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'username': username, 'password': password}),
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      currentSession = UserSession.fromJson(data);
      return currentSession!;
    } else {
      final errorMsg = jsonDecode(response.body)['error'] ?? "Failed to login";
      throw Exception(errorMsg);
    }
  }

  // 2. Clear Session (Log out)
  static void logout() {
    currentSession = null;
  }

  // 3. Fetch list of available inventory weapons
  static Future<List<Weapon>> fetchWeapons() async {
    final response = await http.get(
      Uri.parse("$baseUrl/api/weapons"),
      headers: getHeaders(),
    );

    if (response.statusCode == 200) {
      final List<dynamic> data = jsonDecode(response.body);
      return data.map((json) => Weapon.fromJson(json)).toList();
    } else {
      throw Exception("Failed to fetch weapons inventory list.");
    }
  }

  // 4. Create new weapon (Admin role required)
  static Future<void> createWeapon(Weapon weapon) async {
    final response = await http.post(
      Uri.parse("$baseUrl/api/weapons"),
      headers: getHeaders(),
      body: jsonEncode(weapon.toJson()),
    );

    if (response.statusCode != 201) {
      final errorMsg =
          jsonDecode(response.body)['error'] ?? "Failed to create weapon";
      throw Exception(errorMsg);
    }
  }

  // 5. Update weapon (Admin role required)
  static Future<void> updateWeapon(Weapon weapon) async {
    final response = await http.put(
      Uri.parse("$baseUrl/api/weapons/${weapon.id}"),
      headers: getHeaders(),
      body: jsonEncode(weapon.toJson()),
    );

    if (response.statusCode != 200) {
      final errorMsg =
          jsonDecode(response.body)['error'] ?? "Failed to update weapon";
      throw Exception(errorMsg);
    }
  }

  // 6. Delete weapon (Admin role required)
  static Future<void> deleteWeapon(String weaponId) async {
    final response = await http.delete(
      Uri.parse("$baseUrl/api/weapons/$weaponId"),
      headers: getHeaders(),
    );

    if (response.statusCode != 200) {
      final errorMsg =
          jsonDecode(response.body)['error'] ?? "Failed to delete weapon";
      throw Exception(errorMsg);
    }
  }

  // 7. Process Order Checkout transaction
  static Future<void> checkoutOrder(List<Map<String, dynamic>> items) async {
    final response = await http.post(
      Uri.parse("$baseUrl/api/orders"),
      headers: getHeaders(),
      body: jsonEncode({'items': items}),
    );

    if (response.statusCode != 200) {
      final errorMsg =
          jsonDecode(response.body)['error'] ?? "Failed to complete purchase";
      throw Exception(errorMsg);
    }
  }
}
